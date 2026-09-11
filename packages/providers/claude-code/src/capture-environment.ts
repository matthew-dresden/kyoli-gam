import { spawnSync } from "node:child_process";
import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { platform, tmpdir } from "node:os";
import { join } from "node:path";

export const CLAUDE_CAPTURE_ALTERNATE_BACKEND_ENV_VARS = [
  "CLAUDE_CODE_USE_BEDROCK",
  "CLAUDE_CODE_USE_VERTEX",
  "CLAUDE_CODE_USE_FOUNDRY",
  "CLAUDE_CODE_USE_GATEWAY",
  "CLAUDE_CODE_USE_ANTHROPIC_AWS",
  "CLAUDE_CODE_USE_ANTHROPIC_GOOGLE_CLOUD",
  "CLAUDE_CODE_USE_MANTLE",
] as const;

export function createClaudeCaptureEnv(
  baseUrl: string,
  parentEnv: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const captureEnv: NodeJS.ProcessEnv = {
    ...parentEnv,
    ANTHROPIC_BASE_URL: baseUrl,
  };

  for (const variable of CLAUDE_CAPTURE_ALTERNATE_BACKEND_ENV_VARS) {
    delete captureEnv[variable];
  }

  return captureEnv;
}

export function createClaudeCaptureSettings(baseUrl: string): string {
  const env: Record<string, string> = {
    ANTHROPIC_BASE_URL: baseUrl,
  };

  for (const variable of CLAUDE_CAPTURE_ALTERNATE_BACKEND_ENV_VARS) {
    env[variable] = "";
  }

  return JSON.stringify({ env });
}

export interface ClaudeCaptureSpawn {
  command: string;
  args: string[];
  windowsVerbatimArguments?: boolean;
}

export function createClaudeCaptureSpawn(
  binaryPath: string,
  command: string,
  args: string[],
  options: {
    platform?: NodeJS.Platform;
    comSpec?: string;
  } = {},
): ClaudeCaptureSpawn {
  const currentPlatform = options.platform ?? platform();
  const isWindowsCommandScript = currentPlatform === "win32"
    && /\.(?:cmd|bat)$/i.test(binaryPath);

  if (!isWindowsCommandScript) {
    return { command, args };
  }

  const commandLine = [command, ...args].map(quoteWindowsCmdArg).join(" ");
  return {
    command: options.comSpec ?? process.env.ComSpec ?? "cmd.exe",
    args: ["/d", "/s", "/c", `"${commandLine}"`],
    windowsVerbatimArguments: true,
  };
}

export function quoteWindowsCmdArg(value: string): string {
  // Reject expansion/control characters; quoted cmd arguments preserve the rest.
  if (/[\u0000\r\n%!]/u.test(value)) {
    throw new Error("capture command contains unsupported Windows shell characters");
  }

  return `"${value.replace(/"/g, '""')}"`;
}

interface ClaudeManagedSettingsProbeOptions {
  platform?: NodeJS.Platform;
  managedSettingsDir?: string;
  commandProbe?: (command: string, args: string[]) => boolean;
}

export async function hasClaudeEndpointManagedSettings(
  options: ClaudeManagedSettingsProbeOptions = {},
): Promise<boolean> {
  const currentPlatform = options.platform ?? platform();
  const managedSettingsDirs = options.managedSettingsDir
    ? [options.managedSettingsDir]
    : defaultManagedSettingsDirs(currentPlatform);

  for (const managedSettingsDir of managedSettingsDirs) {
    if (await hasManagedSettingsFiles(managedSettingsDir)) {
      return true;
    }
  }

  const commandProbe = options.commandProbe ?? probeManagedSettingsCommand;
  if (currentPlatform === "darwin") {
    return commandProbe("/usr/bin/defaults", [
      "read",
      "com.anthropic.claudecode",
    ]);
  }

  if (currentPlatform === "win32") {
    return commandProbe("reg.exe", [
      "query",
      "HKLM\\SOFTWARE\\Policies\\ClaudeCode",
    ]) || commandProbe("reg.exe", [
      "query",
      "HKCU\\SOFTWARE\\Policies\\ClaudeCode",
    ]);
  }

  return false;
}

function defaultManagedSettingsDirs(currentPlatform: NodeJS.Platform): string[] {
  if (currentPlatform === "darwin") {
    return ["/Library/Application Support/ClaudeCode"];
  }
  if (currentPlatform === "win32") {
    return [
      join("C:\\Program Files", "ClaudeCode"),
      ...(process.env.ProgramFiles
        ? [join(process.env.ProgramFiles, "ClaudeCode")]
        : []),
      ...(process.env.ProgramW6432
        ? [join(process.env.ProgramW6432, "ClaudeCode")]
        : []),
    ].filter((directory, index, directories) => directories.indexOf(directory) === index);
  }
  return ["/etc/claude-code"];
}

async function hasManagedSettingsFiles(settingsDir: string): Promise<boolean> {
  if (await pathExistsOrIsUnreadable(join(settingsDir, "managed-settings.json"))) {
    return true;
  }

  try {
    const entries = await readdir(join(settingsDir, "managed-settings.d"), {
      withFileTypes: true,
    });
    return entries.some((entry) => (
      (entry.isFile() || entry.isSymbolicLink())
      && !entry.name.startsWith(".")
      && entry.name.endsWith(".json")
    ));
  } catch (error) {
    return !isMissingPathError(error);
  }
}

async function pathExistsOrIsUnreadable(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    return !isMissingPathError(error);
  }
}

function isMissingPathError(error: unknown): boolean {
  return error instanceof Error
    && "code" in error
    && error.code === "ENOENT";
}

function probeManagedSettingsCommand(command: string, args: string[]): boolean {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 2_000,
    windowsHide: true,
  });

  if (result.error || result.signal) {
    return true;
  }
  if (result.status === 0) {
    return true;
  }

  if (command === "/usr/bin/defaults") {
    return !result.stderr.includes("does not exist");
  }
  return result.status !== 1;
}

export async function withClaudeCaptureSettings<T>(
  baseUrl: string,
  callback: (settingsPath: string) => Promise<T>,
): Promise<T> {
  // Endpoint-managed policy outranks --settings and may restore a real provider.
  // Refuse capture instead; server-managed settings are bypassed for loopback URLs.
  if (await hasClaudeEndpointManagedSettings()) {
    throw new Error("live Claude capture is disabled under endpoint-managed settings");
  }

  const settingsDir = await mkdtemp(join(tmpdir(), "kyoli-claude-capture-"));
  const settingsPath = join(settingsDir, "settings.json");

  try {
    await writeFile(settingsPath, createClaudeCaptureSettings(baseUrl), {
      encoding: "utf8",
      mode: 0o600,
    });
    return await callback(settingsPath);
  } finally {
    await rm(settingsDir, { recursive: true, force: true });
  }
}
