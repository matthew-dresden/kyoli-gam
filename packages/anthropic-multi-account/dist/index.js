import {
  CLAUDE_CODE_CONFIG_SCOPED_TOOL_NAMES,
  applyClaudeCodeUpstreamBodyFields,
  checkCCCompat,
  clampEffortAfterRejection,
  clampUnsupportedEffortInBody,
  compareVersions,
  composeClaudeCodeBillingSystemEntry,
  createClaudeCodePerRequestHeaders,
  createClaudeCodeStaticHeaders,
  detectCliVersion,
  detectDrift,
  fingerprint_data_default,
  getClaudeCodeSystemPromptVariants,
  isClaudeCode1mModelLabel,
  isClaudeFableModel,
  loadClaudeCodeSharedRequestProfile,
  loadTemplate,
  orderClaudeCodeHeadersForOutbound,
  parseEffortCapabilityRejection,
  refreshLiveFingerprintAsync,
  resolveClaudeCodeCacheControl,
  resolveClaudeCodeModelAlias,
  selectClaudeCodeSystemPrompt,
  stampClaudeCodeCch,
  toClaudeCodeWireModelId
} from "./chunk-IRJXACHO.js";
import "./chunk-ITZJ5FTB.js";
import "./chunk-QTHKVNEI.js";

// src/index.ts
import {
  CascadeStateManager,
  createOpenCodeNativeAuthMethods,
  createOpenCodeNativeAuthLoader,
  createOpenCodeNativePluginLifecycle,
  zeroCostProviderModels,
  loadPoolChainConfig,
  migrateFromAuthJson as migrateFromAuthJson2,
  PoolManager
} from "opencode-multi-account-core";

// src/accounts/manager.ts
import { createAccountManagerForProvider } from "opencode-multi-account-core";

// src/shared/config.ts
import {
  createConfigLoader
} from "opencode-multi-account-core";
var configLoader = createConfigLoader("claude-multiauth.json");
var { getConfig, loadConfig, resetConfigCache, updateConfigField } = configLoader;

// src/accounts/claims.ts
import { createClaimsManager } from "opencode-multi-account-core";

// src/shared/constants.ts
import { anthropicOAuthAdapter } from "opencode-multi-account-core";
var ANTHROPIC_OAUTH_ADAPTER = anthropicOAuthAdapter;
var ANTHROPIC_CLIENT_ID = ANTHROPIC_OAUTH_ADAPTER.oauthClientId;
var ANTHROPIC_TOKEN_ENDPOINT = ANTHROPIC_OAUTH_ADAPTER.tokenEndpoint;
var ANTHROPIC_USAGE_ENDPOINT = ANTHROPIC_OAUTH_ADAPTER.usageEndpoint;
var ANTHROPIC_PROFILE_ENDPOINT = ANTHROPIC_OAUTH_ADAPTER.profileEndpoint;
var ACCOUNTS_FILENAME = ANTHROPIC_OAUTH_ADAPTER.accountStorageFilename;
var CLAIMS_FILENAME = "anthropic-multi-account-claims.json";
var PLAN_LABELS = ANTHROPIC_OAUTH_ADAPTER.planLabels;
var TOKEN_EXPIRY_BUFFER_MS = 6e4;
var TOKEN_REFRESH_TIMEOUT_MS = 3e4;

// src/accounts/claims.ts
var claimsManager = createClaimsManager(CLAIMS_FILENAME);
var {
  isClaimedByOther,
  readClaims,
  releaseClaim,
  writeClaim
} = claimsManager;

// src/oauth/token.ts
import { createHash as createHash3 } from "crypto";

// src/oauth/anthropic-oauth.ts
import { exec } from "child_process";
import { randomUUID } from "crypto";
import * as v3 from "valibot";

// src/fixtures/defaults/cc-derived-defaults.json
var cc_derived_defaults_default = {
  request: {
    baseApiUrl: "https://api.anthropic.com",
    anthropicVersion: "2023-06-01",
    xApp: "cli",
    betaHeader: "claude-code-20250219,oauth-2025-04-20,context-1m-2025-08-07,interleaved-thinking-2025-05-14,context-management-2025-06-27,prompt-caching-scope-2026-01-05,advisor-tool-2026-03-01,effort-2025-11-24"
  },
  oauth: {
    clientId: "9d1c250a-e61b-44d9-88ed-5944d1962f5e",
    authorizeUrl: "https://claude.ai/oauth/authorize",
    tokenUrl: "https://platform.claude.com/v1/oauth/token",
    scopes: "org:create_api_key user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload",
    baseApiUrl: "https://api.anthropic.com"
  }
};

// src/claude-code/oauth-config/detect.ts
import { createHash } from "crypto";
import { execFileSync as defaultExecFileSync } from "child_process";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir, platform } from "os";
import { dirname, join } from "path";

// src/shared/utils.ts
import {
  createMinimalClient,
  formatWaitTime,
  getAccountLabel,
  getConfigDir,
  getErrorCode,
  sleep
} from "opencode-multi-account-core";
async function showToast(client, message, variant) {
  if (getConfig().quiet_mode) return;
  try {
    await client.tui.showToast({ body: { message, variant } });
  } catch {
  }
}
function debugLog(client, message, extra) {
  if (!getConfig().debug) return;
  client.app.log({
    body: { service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName, level: "debug", message, extra }
  }).catch(() => {
  });
}

// src/claude-code/oauth-config/detect.ts
var CONFIG_SCAN_WINDOW_CHARS = 4096;
var CONFIG_SCAN_LOOKBACK_CHARS = 2048;
var KNOWN_PROD_CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
var POLLUTED_CACHED_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
var SAFE_FALLBACK_SCOPES = "org:create_api_key user:profile user:inference user:sessions:claude_code user:mcp_servers user:file_upload";
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var CLIENT_ID_ASSIGNMENT_PATTERN = /\b(?:CLIENT_ID|[A-Z_]+CLIENT_ID)\s*:\s*"([0-9a-f-]{36})"/gi;
var CACHE_FILE_NAME = "anthropic-oauth-config-cache.json";
var DEFAULT_OVERRIDE_FILE_NAME = "oauth-config.override.json";
var derivedDefaults = cc_derived_defaults_default;
var fallbackPayload = normalizeDetectedOAuthConfigPayload({
  clientId: derivedDefaults.oauth?.clientId || KNOWN_PROD_CLIENT_ID,
  authorizeUrl: derivedDefaults.oauth?.authorizeUrl || "https://claude.ai/oauth/authorize",
  tokenUrl: derivedDefaults.oauth?.tokenUrl || "https://platform.claude.com/v1/oauth/token",
  scopes: derivedDefaults.oauth?.scopes || SAFE_FALLBACK_SCOPES,
  baseApiUrl: derivedDefaults.oauth?.baseApiUrl || "https://api.anthropic.com"
});
var FALLBACK = {
  ...fallbackPayload,
  source: "fallback"
};
function hasPollutedCachedScope(scopes) {
  const parsedScopes = scopes.split(/\s+/).filter(Boolean);
  return parsedScopes.includes(POLLUTED_CACHED_SCOPE) || !parsedScopes.includes("org:create_api_key");
}
function filterScopesByBinaryPresence(buf, expected) {
  const verified = [];
  for (const scope of expected) {
    const needle = Buffer.from(`"${scope}"`);
    if (buf.includes(needle)) {
      verified.push(scope);
    }
  }
  return verified;
}
function getVerifiedCanonicalScopes(buf, fallbackScopes) {
  const expectedScopes = fallbackScopes.split(/\s+/).filter(Boolean);
  const verifiedScopes = filterScopesByBinaryPresence(buf, expectedScopes);
  return verifiedScopes.length === expectedScopes.length ? verifiedScopes.join(" ") : null;
}
function normalizeAuthorizeUrl(url) {
  if (url === "https://claude.com/cai/oauth/authorize") {
    return "https://claude.ai/oauth/authorize";
  }
  return url;
}
function normalizeDetectedOAuthConfigPayload(payload) {
  return {
    ...payload,
    authorizeUrl: normalizeAuthorizeUrl(payload.authorizeUrl)
  };
}
function pickNearestScopes(block, centerIndex) {
  return pickNearestValue(block, centerIndex, /SCOPES\s*:\s*"([^"]+)"/gi) || pickNearestValue(block, centerIndex, /scope[s]?\s*:\s*"([^"]+)"/gi) || null;
}
function isLikelyLocalUrl(value) {
  if (!value) {
    return false;
  }
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local");
  } catch {
    return false;
  }
}
function extractCandidateBlocks(binaryText) {
  const blocks = [];
  const seenRanges = /* @__PURE__ */ new Set();
  const clientIdMatches = [...binaryText.matchAll(CLIENT_ID_ASSIGNMENT_PATTERN)];
  for (const [index, currentMatch] of clientIdMatches.entries()) {
    const currentIndex = currentMatch.index ?? 0;
    const previousClientIdIndex = clientIdMatches[index - 1]?.index;
    const nextClientIdIndex = clientIdMatches[index + 1]?.index;
    const range = getCandidateBlockRange(
      currentIndex,
      previousClientIdIndex,
      nextClientIdIndex,
      binaryText.length
    );
    const start = range.start;
    const end = Math.min(
      binaryText.length,
      Math.max(range.end, currentIndex + currentMatch[0].length)
    );
    const key = `${start}:${end}`;
    if (seenRanges.has(key)) {
      continue;
    }
    seenRanges.add(key);
    blocks.push(binaryText.slice(start, end));
  }
  if (blocks.length === 0 && binaryText.length > 0) {
    blocks.push(binaryText.slice(0, Math.min(binaryText.length, CONFIG_SCAN_WINDOW_CHARS)));
  }
  return blocks;
}
function midpoint(left, right) {
  return Math.floor((left + right) / 2);
}
function getCandidateBlockRange(currentIndex, previousClientIdIndex, nextClientIdIndex, textLength) {
  const boundedLeftEdge = currentIndex - CONFIG_SCAN_LOOKBACK_CHARS;
  const boundedRightEdge = currentIndex + CONFIG_SCAN_WINDOW_CHARS;
  const leftBoundary = previousClientIdIndex === void 0 ? boundedLeftEdge : Math.max(boundedLeftEdge, midpoint(previousClientIdIndex, currentIndex));
  const rightBoundary = nextClientIdIndex === void 0 ? boundedRightEdge : Math.min(boundedRightEdge, midpoint(currentIndex, nextClientIdIndex));
  return {
    start: Math.max(0, leftBoundary),
    end: Math.min(textLength, Math.max(currentIndex + 1, rightBoundary))
  };
}
function pickNearestValue(block, centerIndex, pattern) {
  let nearestValue;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const match of block.matchAll(pattern)) {
    const matchIndex = match.index ?? 0;
    const distance = Math.abs(matchIndex - centerIndex);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestValue = match[1];
    }
  }
  return nearestValue;
}
function scoreCandidate(candidate, extractedScopes) {
  let score = 0;
  if (UUID_PATTERN.test(candidate.clientId)) score += 4;
  if (candidate.baseApiUrl.startsWith("https://")) score += 3;
  if (!isLikelyLocalUrl(candidate.baseApiUrl)) score += 5;
  if (!isLikelyLocalUrl(candidate.authorizeUrl)) score += 2;
  if (!isLikelyLocalUrl(candidate.tokenUrl)) score += 2;
  if (extractedScopes) score += 2;
  if (candidate.scopes.includes("user:sessions:claude_code")) score += 1;
  return score;
}
function extractCandidateFromBlock(block) {
  const clientIdMatch = /\b(?:CLIENT_ID|[A-Z_]+CLIENT_ID)\s*:\s*"([0-9a-f-]{36})"/i.exec(block);
  if (!clientIdMatch?.[1]) {
    return null;
  }
  const clientIdIndex = clientIdMatch.index ?? 0;
  const authorizeUrl = pickNearestValue(block, clientIdIndex, /CLAUDE_AI_AUTHORIZE_URL\s*:\s*"(https?:\/\/[^\"]*\/oauth\/authorize[^\"]*)"/gi);
  const baseApiUrl = pickNearestValue(block, clientIdIndex, /BASE_API_URL\s*:\s*"(https?:\/\/[^\"]+)"/gi);
  const tokenUrl = pickNearestValue(block, clientIdIndex, /TOKEN_URL\s*:\s*"(https:\/\/[^\"]*\/oauth\/token[^\"]*)"/gi);
  const rawExtractedScopes = pickNearestScopes(block, clientIdIndex);
  const hasPollutedScope = rawExtractedScopes ? rawExtractedScopes.split(/\s+/).some((scope) => scope === POLLUTED_CACHED_SCOPE) : false;
  const extractedScopes = rawExtractedScopes && !hasPollutedScope ? rawExtractedScopes : null;
  const payload = {
    clientId: clientIdMatch[1],
    authorizeUrl: normalizeAuthorizeUrl(authorizeUrl || FALLBACK.authorizeUrl),
    tokenUrl: tokenUrl || FALLBACK.tokenUrl,
    scopes: extractedScopes || FALLBACK.scopes,
    baseApiUrl: baseApiUrl || FALLBACK.baseApiUrl
  };
  if (!isDetectedOAuthConfigPayload(payload)) {
    return null;
  }
  return {
    payload,
    score: scoreCandidate(payload, extractedScopes)
  };
}
var memoizedConfig = null;
var detectorTestOverrides = {};
function getPlatform() {
  return detectorTestOverrides.platform?.() ?? platform();
}
function fileExists(path) {
  return (detectorTestOverrides.existsSync ?? existsSync)(path);
}
function candidatePaths() {
  const home = homedir();
  if (getPlatform() === "win32") {
    return [
      join(home, ".local", "bin", "claude.exe"),
      join(home, "AppData", "Roaming", "npm", "node_modules", "@anthropic-ai", "claude-code", "cli.js"),
      join(home, "AppData", "Roaming", "npm", "node_modules", "@anthropic-ai", "claude-code", "cli.mjs"),
      join(home, ".claude", "local", "node_modules", "@anthropic-ai", "claude-code", "cli.js"),
      join(home, ".claude", "local", "node_modules", "@anthropic-ai", "claude-code", "cli.mjs")
    ];
  }
  return [
    join(home, ".local", "bin", "claude"),
    "/usr/local/bin/claude",
    "/opt/homebrew/bin/claude",
    "/usr/local/lib/node_modules/@anthropic-ai/claude-code/cli.js",
    "/usr/local/lib/node_modules/@anthropic-ai/claude-code/cli.mjs",
    "/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/cli.js",
    join(home, ".claude", "local", "node_modules", "@anthropic-ai", "claude-code", "cli.js"),
    join(home, ".claude", "local", "node_modules", "@anthropic-ai", "claude-code", "cli.mjs")
  ];
}
function enumerateCCCandidates() {
  const seen = /* @__PURE__ */ new Set();
  const candidates = [];
  const currentPlatform = getPlatform();
  const pathDelimiter = currentPlatform === "win32" ? ";" : ":";
  const pathDirs = (detectorTestOverrides.pathEnv ?? process.env.PATH ?? "").split(pathDelimiter).filter(Boolean);
  const pathCandidateNames = currentPlatform === "win32" ? ["claude.exe", "claude.cmd", "claude"] : ["claude"];
  const addCandidate = (candidatePath) => {
    const key = currentPlatform === "win32" ? candidatePath.toLowerCase() : candidatePath;
    if (seen.has(key) || !fileExists(candidatePath)) {
      return;
    }
    seen.add(key);
    candidates.push(candidatePath);
  };
  for (const dir of pathDirs) {
    for (const fileName of pathCandidateNames) {
      addCandidate(join(dir, fileName));
    }
  }
  for (const candidatePath of candidatePaths()) {
    addCandidate(candidatePath);
  }
  return candidates;
}
function probeOneVersion(binPath) {
  const currentPlatform = getPlatform();
  if (currentPlatform === "win32" && /\.(cmd|bat)$/i.test(binPath) && /[&|><^"'%\r\n`$;(){}\[\]]/.test(binPath)) {
    return null;
  }
  try {
    const output = (detectorTestOverrides.execFileSync ?? defaultExecFileSync)(binPath, ["--version"], {
      timeout: 2e3,
      encoding: "utf-8",
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"],
      shell: currentPlatform === "win32" && /\.(cmd|bat)$/i.test(binPath)
    });
    return output.match(/(\d+\.\d+\.\d+(?:[.\-][\w.\-]+)?)/)?.[1] ?? null;
  } catch {
    return null;
  }
}
function getCachePath() {
  return join(getConfigDir(), CACHE_FILE_NAME);
}
function getDefaultOverridePath() {
  return join(getConfigDir(), DEFAULT_OVERRIDE_FILE_NAME);
}
function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
function isDetectedOAuthConfigPayload(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value;
  return typeof candidate.clientId === "string" && UUID_PATTERN.test(candidate.clientId) && typeof candidate.authorizeUrl === "string" && isValidUrl(candidate.authorizeUrl) && typeof candidate.tokenUrl === "string" && isValidUrl(candidate.tokenUrl) && typeof candidate.scopes === "string" && candidate.scopes.length > 0;
}
function buildResolvedConfig(payload, source, ccPath, ccHash) {
  return {
    ...payload,
    source,
    ...ccPath ? { ccPath } : {},
    ...ccHash ? { ccHash } : {}
  };
}
function toFallbackConfig(ccPath, ccHash) {
  return buildResolvedConfig(FALLBACK, "fallback", ccPath, ccHash);
}
function isOverrideDisabled() {
  return process.env.ANTHROPIC_MULTI_ACCOUNT_OAUTH_DISABLE_OVERRIDE === "1";
}
function readOverrideString(value) {
  if (!value) {
    return void 0;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : void 0;
}
function getOverridePath() {
  return readOverrideString(process.env.ANTHROPIC_MULTI_ACCOUNT_OAUTH_OVERRIDE_PATH) ?? getDefaultOverridePath();
}
function readOverrideRecord(value) {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value;
}
function readOverrideField(candidate, key) {
  const value = candidate[key];
  return typeof value === "string" ? readOverrideString(value) : void 0;
}
function readOverrideUrl(candidate, key) {
  const value = readOverrideField(candidate, key);
  return value && isValidUrl(value) ? value : void 0;
}
function normalizeOverride(value) {
  const candidate = readOverrideRecord(value);
  if (!candidate) {
    return {};
  }
  const normalized = {};
  const clientId = readOverrideField(candidate, "clientId");
  if (clientId && UUID_PATTERN.test(clientId)) {
    normalized.clientId = clientId;
  }
  const authorizeUrl = readOverrideUrl(candidate, "authorizeUrl");
  if (authorizeUrl) {
    normalized.authorizeUrl = normalizeAuthorizeUrl(authorizeUrl);
  }
  const tokenUrl = readOverrideUrl(candidate, "tokenUrl");
  if (tokenUrl) {
    normalized.tokenUrl = tokenUrl;
  }
  const scopes = readOverrideField(candidate, "scopes");
  if (scopes) {
    normalized.scopes = scopes;
  }
  const baseApiUrl = readOverrideUrl(candidate, "baseApiUrl");
  if (baseApiUrl) {
    normalized.baseApiUrl = baseApiUrl;
  }
  return normalized;
}
async function loadManualOverride() {
  if (isOverrideDisabled()) {
    return {};
  }
  const envOverride = normalizeOverride({
    clientId: process.env.ANTHROPIC_MULTI_ACCOUNT_OAUTH_CLIENT_ID,
    authorizeUrl: process.env.ANTHROPIC_MULTI_ACCOUNT_OAUTH_AUTHORIZE_URL,
    tokenUrl: process.env.ANTHROPIC_MULTI_ACCOUNT_OAUTH_TOKEN_URL,
    scopes: process.env.ANTHROPIC_MULTI_ACCOUNT_OAUTH_SCOPES
  });
  if (Object.keys(envOverride).length > 0) {
    return envOverride;
  }
  try {
    const fileOverride = JSON.parse(await readFile(getOverridePath(), "utf-8"));
    return normalizeOverride(fileOverride);
  } catch {
    return {};
  }
}
async function applyManualOverride(baseConfig) {
  const override = await loadManualOverride();
  if (Object.keys(override).length === 0) {
    return baseConfig;
  }
  return {
    ...baseConfig,
    ...override,
    source: "override"
  };
}
function findCCBinary() {
  const override = process.env.ANTHROPIC_CC_PATH;
  if (override && fileExists(override)) {
    return override;
  }
  const candidates = enumerateCCCandidates();
  if (candidates.length === 0) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0] ?? null;
  }
  const probedCandidates = candidates.map((candidatePath) => {
    const version = probeOneVersion(candidatePath);
    return version ? { path: candidatePath, version } : null;
  }).filter((candidate) => candidate !== null).sort((left, right) => compareVersions(right.version, left.version) ?? 0);
  return probedCandidates[0]?.path ?? candidates[0] ?? null;
}
async function fingerprintBinary(path) {
  const binaryContents = await readFile(path);
  return createHash("sha256").update(binaryContents).digest("hex").slice(0, 16);
}
function scanBinaryForOAuthConfig(buf) {
  const binaryText = buf.toString("latin1");
  const candidates = extractCandidateBlocks(binaryText).map(extractCandidateFromBlock).filter((candidate) => candidate !== null).sort((left, right) => right.score - left.score);
  const preferredCandidate = candidates.find((candidate) => candidate.payload.clientId === KNOWN_PROD_CLIENT_ID);
  return preferredCandidate?.payload ?? candidates[0]?.payload ?? null;
}
async function readRawCacheEntries() {
  const raw = await readFile(getCachePath(), "utf-8");
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || typeof parsed.entries !== "object" || parsed.entries === null) {
    return {};
  }
  return parsed.entries;
}
async function loadCache() {
  try {
    const rawEntries = await readRawCacheEntries();
    const validEntries = {};
    for (const [hash, value] of Object.entries(rawEntries)) {
      if (isDetectedOAuthConfigPayload(value) && !hasPollutedCachedScope(value.scopes)) {
        validEntries[hash] = normalizeDetectedOAuthConfigPayload(value);
      }
    }
    return validEntries;
  } catch {
    return {};
  }
}
async function saveCache(hash, config2) {
  try {
    const cachePath = getCachePath();
    const currentEntries = {};
    try {
      Object.assign(currentEntries, await readRawCacheEntries());
    } catch {
    }
    currentEntries[hash] = config2;
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(
      cachePath,
      JSON.stringify({ entries: currentEntries, savedAt: Date.now() }, null, 2),
      "utf-8"
    );
  } catch {
  }
}
async function detectOAuthConfig() {
  if (memoizedConfig) {
    return memoizedConfig;
  }
  try {
    const ccPath = (detectorTestOverrides.findCCBinary || findCCBinary)();
    if (!ccPath) {
      memoizedConfig = await applyManualOverride(FALLBACK);
      return memoizedConfig;
    }
    const ccHash = await fingerprintBinary(ccPath);
    const cachedEntries = await loadCache();
    const cachedConfig = cachedEntries[ccHash];
    if (cachedConfig) {
      memoizedConfig = await applyManualOverride(buildResolvedConfig(cachedConfig, "cached", ccPath, ccHash));
      return memoizedConfig;
    }
    const readBinaryFile = detectorTestOverrides.readBinaryFile || readFile;
    const binaryBuffer = await readBinaryFile(ccPath);
    const scannedConfig = scanBinaryForOAuthConfig(binaryBuffer);
    if (!scannedConfig) {
      memoizedConfig = await applyManualOverride(toFallbackConfig(ccPath, ccHash));
      return memoizedConfig;
    }
    const verifiedCanonicalScopes = getVerifiedCanonicalScopes(binaryBuffer, FALLBACK.scopes);
    if (verifiedCanonicalScopes) {
      scannedConfig.scopes = verifiedCanonicalScopes;
    }
    const runtimeDetectedConfig = normalizeDetectedOAuthConfigPayload(scannedConfig);
    await saveCache(ccHash, runtimeDetectedConfig);
    memoizedConfig = await applyManualOverride(buildResolvedConfig(runtimeDetectedConfig, "detected", ccPath, ccHash));
    return memoizedConfig;
  } catch {
    memoizedConfig = await applyManualOverride(FALLBACK);
    return memoizedConfig;
  }
}

// src/claude-code/derived-profile.ts
var bundledTemplate = fingerprint_data_default;
var derivedDefaults2 = cc_derived_defaults_default;
var DEFAULT_BASE_API_URL = derivedDefaults2.request?.baseApiUrl || "https://api.anthropic.com";
var sharedProfile = loadClaudeCodeSharedRequestProfile();
var DEFAULT_ANTHROPIC_VERSION = bundledTemplate.header_values?.["anthropic-version"] || sharedProfile.anthropicVersion || derivedDefaults2.request?.anthropicVersion || "2023-06-01";
var DEFAULT_X_APP = bundledTemplate.header_values?.["x-app"] || sharedProfile.xApp || derivedDefaults2.request?.xApp || "cli";
var DEFAULT_BETA_HEADER = bundledTemplate.anthropic_beta || bundledTemplate.header_values?.["anthropic-beta"] || sharedProfile.anthropicBeta || derivedDefaults2.request?.betaHeader || "oauth-2025-04-20,interleaved-thinking-2025-05-14";
function loadCCDerivedRequestProfile() {
  const template = loadTemplate();
  const cliVersion = detectCliVersion();
  const anthropicVersion = template.header_values?.["anthropic-version"] || DEFAULT_ANTHROPIC_VERSION;
  const betaHeader = template.anthropic_beta || template.header_values?.["anthropic-beta"] || DEFAULT_BETA_HEADER;
  const xApp = template.header_values?.["x-app"] || DEFAULT_X_APP;
  return {
    template,
    cliVersion,
    userAgent: `claude-cli/${cliVersion} (external, cli)`,
    anthropicVersion,
    betaHeader,
    xApp,
    baseApiUrl: sharedProfile.baseUrl || DEFAULT_BASE_API_URL,
    apiV1BaseUrl: sharedProfile.apiV1BaseUrl || `${DEFAULT_BASE_API_URL}/v1`
  };
}
async function loadCCDerivedAuthProfile() {
  const requestProfile = loadCCDerivedRequestProfile();
  const oauthConfig = await detectOAuthConfig();
  const baseApiUrl = oauthConfig.baseApiUrl || requestProfile.baseApiUrl;
  return {
    ...requestProfile,
    oauthConfig,
    baseApiUrl,
    apiV1BaseUrl: `${baseApiUrl}/v1`
  };
}

// src/claude-code/identity.ts
import { readFileSync, readdirSync } from "fs";
import { homedir as homedir2 } from "os";
import { join as join2 } from "path";
var EMPTY_IDENTITY = {
  deviceId: "",
  accountUuid: ""
};
var testOverrideIdentity = null;
function getCandidatePaths() {
  const home = homedir2();
  const paths = [
    join2(home, ".claude.json"),
    join2(home, ".claude", ".claude.json"),
    join2(home, ".claude", "claude.json")
  ];
  try {
    const backupDir = join2(home, ".claude", "backups");
    const backups = readdirSync(backupDir).filter((file) => file.startsWith(".claude.json.backup.")).sort().reverse();
    for (const backup of backups) {
      paths.push(join2(backupDir, backup));
    }
  } catch {
  }
  return paths;
}
function parseIdentityFile(path) {
  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));
    if (!data.userID) {
      return null;
    }
    return {
      deviceId: data.userID,
      accountUuid: data.oauthAccount?.accountUuid ?? data.accountUuid ?? ""
    };
  } catch {
    return null;
  }
}
function loadClaudeIdentity() {
  if (testOverrideIdentity) {
    return testOverrideIdentity;
  }
  for (const path of getCandidatePaths()) {
    const identity = parseIdentityFile(path);
    if (identity) {
      return identity;
    }
  }
  return EMPTY_IDENTITY;
}

// src/claude-code/index.ts
var claudeCodeIntegration = {
  loadRequestProfile: loadCCDerivedRequestProfile,
  loadAuthProfile: loadCCDerivedAuthProfile,
  loadIdentity: loadClaudeIdentity,
  loadTemplate,
  detectCliVersion,
  detectOAuthConfig,
  detectDrift,
  checkCompat: checkCCCompat,
  refreshLiveFingerprint: refreshLiveFingerprintAsync
};

// src/oauth/callback-server.ts
import { createServer } from "http";
var DEFAULT_TIMEOUT_MS = 3e5;
var SUCCESS_REDIRECT_URL = "https://platform.claude.com/oauth/code/success?app=claude-code";
function startCallbackServer(options) {
  const { expectedState, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  return new Promise((resolveServer, rejectServer) => {
    let settled = false;
    let resolveCode = null;
    let rejectCode = null;
    let timeoutHandle = null;
    const waitForCode = new Promise((resolve, reject) => {
      resolveCode = resolve;
      rejectCode = reject;
    });
    function settle(error, result) {
      if (settled) return;
      settled = true;
      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
        timeoutHandle = null;
      }
      if (error) {
        rejectCode?.(error);
      } else if (result) {
        resolveCode?.(result);
      }
      resolveCode = null;
      rejectCode = null;
      server.close();
    }
    function stop() {
      settle(new Error("OAuth callback server stopped"));
    }
    function sendResponse(res, status, headers, body, onFinish) {
      res.writeHead(status, { ...headers, Connection: "close" });
      res.end(body ?? "", onFinish);
    }
    const server = createServer(
      (req, res) => {
        const url = new URL(req.url ?? "/", `http://localhost`);
        if (url.pathname !== "/callback") {
          res.writeHead(404, {
            "Content-Type": "text/plain",
            Connection: "close"
          });
          res.end("Not Found");
          return;
        }
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (state !== expectedState) {
          sendResponse(
            res,
            400,
            { "Content-Type": "text/plain" },
            "State mismatch",
            () => settle(new Error("OAuth callback state mismatch"))
          );
          return;
        }
        if (!code) {
          sendResponse(
            res,
            400,
            { "Content-Type": "text/plain" },
            "Missing code",
            () => settle(new Error("OAuth callback missing code"))
          );
          return;
        }
        sendResponse(
          res,
          302,
          { Location: SUCCESS_REDIRECT_URL },
          void 0,
          () => settle(null, { code, state })
        );
      }
    );
    server.listen(0, "localhost", () => {
      const addr = server.address();
      const port = addr.port;
      timeoutHandle = setTimeout(() => {
        settle(new Error("OAuth callback timed out"));
      }, timeoutMs);
      resolveServer({ port, waitForCode, stop });
    });
    server.on("error", (err) => {
      if (!settled) {
        rejectServer(err);
      }
    });
  });
}

// src/oauth/pkce.ts
import { createHash as createHash2, randomBytes } from "crypto";
function base64url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function generatePKCE() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash2("sha256").update(verifier).digest());
  return { verifier, challenge };
}
function generateState() {
  return base64url(randomBytes(32));
}

// src/oauth/token-node-request.ts
import * as childProcess from "child_process";
var execFile2 = childProcess.execFile;
function buildNodeTokenRequestScript() {
  return `
const https = require("node:https");
const endpoint = process.env.ANTHROPIC_REFRESH_ENDPOINT;
const contentType = process.env.ANTHROPIC_REFRESH_CONTENT_TYPE || "application/json";
const timeoutMs = Number(process.env.ANTHROPIC_REFRESH_TIMEOUT_MS || "30000");
const payload = process.env.ANTHROPIC_REFRESH_REQUEST_BODY || "";
const userAgent = process.env.ANTHROPIC_REFRESH_USER_AGENT;

function printSuccess(body) {
  console.log(JSON.stringify({ ok: true, body }));
}

function printFailure(error) {
  console.log(JSON.stringify({ ok: false, ...error }));
}

const request = https.request(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": contentType,
    Accept: "application/json",
    "Content-Length": Buffer.byteLength(payload).toString(),
    ...(userAgent ? { "User-Agent": userAgent } : {}),
  },
}, (response) => {
  let body = "";
  response.setEncoding("utf8");
  response.on("data", (chunk) => {
    body += chunk;
  });
  response.on("end", () => {
    const status = response.statusCode ?? 0;
    if (status < 200 || status >= 300) {
      printFailure({ status, body });
      return;
    }

    printSuccess(body);
  });
});

request.setTimeout(timeoutMs, () => {
  request.destroy(new Error("Request timed out after " + timeoutMs + "ms"));
});

request.on("error", (error) => {
  printFailure({ error: error instanceof Error ? error.name + ": " + error.message : String(error) });
});

request.write(payload);
request.end();
`;
}
async function defaultRunNodeTokenRequest(options) {
  const script = buildNodeTokenRequestScript();
  const contentType = options.contentType ?? "application/json";
  return new Promise((resolve, reject) => {
    execFile2(
      options.executable,
      ["-e", script],
      {
        timeout: options.timeoutMs + 1e3,
        maxBuffer: 1024 * 1024,
        env: {
          ...process.env,
          ANTHROPIC_REFRESH_CONTENT_TYPE: contentType,
          ANTHROPIC_REFRESH_ENDPOINT: options.endpoint,
          ANTHROPIC_REFRESH_REQUEST_BODY: options.body,
          ANTHROPIC_REFRESH_TIMEOUT_MS: String(options.timeoutMs),
          ANTHROPIC_REFRESH_USER_AGENT: options.userAgent ?? ""
        }
      },
      (error, stdout, stderr) => {
        const trimmedStdout = stdout.trim();
        if (error) {
          reject(new Error(stderr.trim() || error.message));
          return;
        }
        if (!trimmedStdout) {
          reject(new Error("Empty response from Node refresh helper"));
          return;
        }
        resolve(trimmedStdout);
      }
    );
  });
}
var nodeTokenRequestRunner = defaultRunNodeTokenRequest;
async function runNodeTokenRequest(options) {
  return nodeTokenRequestRunner(options);
}

// src/usage.ts
import * as v2 from "valibot";

// src/shared/types.ts
import * as v from "valibot";
var OAuthCredentialsSchema = v.object({
  type: v.literal("oauth"),
  refresh: v.string(),
  access: v.string(),
  expires: v.number()
});
var UsageLimitEntrySchema = v.object({
  utilization: v.number(),
  resets_at: v.nullable(v.string())
});
var UsageLimitsSchema = v.object({
  five_hour: v.optional(v.nullable(UsageLimitEntrySchema), null),
  seven_day: v.optional(v.nullable(UsageLimitEntrySchema), null),
  seven_day_sonnet: v.optional(v.nullable(UsageLimitEntrySchema), null)
});
var CredentialRefreshPatchSchema = v.object({
  accessToken: v.string(),
  expiresAt: v.number(),
  refreshToken: v.optional(v.string()),
  uuid: v.optional(v.string()),
  accountId: v.optional(v.string()),
  accountUuid: v.optional(v.string()),
  deviceId: v.optional(v.string()),
  email: v.optional(v.string())
});
var StoredAccountSchema = v.object({
  uuid: v.optional(v.string()),
  credentialOwnerId: v.optional(v.string()),
  accountId: v.optional(v.string()),
  accountUuid: v.optional(v.string()),
  deviceId: v.optional(v.string()),
  label: v.optional(v.string()),
  email: v.optional(v.string()),
  planTier: v.optional(v.string(), ""),
  refreshToken: v.string(),
  accessToken: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  addedAt: v.number(),
  lastUsed: v.number(),
  enabled: v.optional(v.boolean(), true),
  rateLimitResetAt: v.optional(v.number()),
  cachedUsage: v.optional(UsageLimitsSchema),
  cachedUsageAt: v.optional(v.number()),
  consecutiveAuthFailures: v.optional(v.number(), 0),
  isAuthDisabled: v.optional(v.boolean(), false),
  authDisabledReason: v.optional(v.string())
});
var AccountStorageSchema = v.object({
  version: v.literal(1),
  accounts: v.optional(v.array(StoredAccountSchema), []),
  activeAccountUuid: v.optional(v.string())
});
var TokenResponseSchema = v.object({
  access_token: v.string(),
  refresh_token: v.optional(v.string()),
  expires_in: v.number(),
  account: v.optional(v.object({
    uuid: v.optional(v.string()),
    email_address: v.optional(v.string())
  }))
});
var AccountSelectionStrategySchema = v.picklist(["sticky", "round-robin", "hybrid"]);
var PluginConfigSchema = v.object({
  /** sticky: same account until failure, round-robin: rotate every request, hybrid: health+usage scoring */
  account_selection_strategy: v.optional(AccountSelectionStrategySchema, "sticky"),
  /** Use cross-process claim file to distribute parallel sessions across accounts */
  cross_process_claims: v.optional(v.boolean(), true),
  /** Skip account when any usage tier utilization >= this % (100 = disabled) */
  soft_quota_threshold_percent: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(100)), 100),
  /** Minimum backoff after rate limit (ms) */
  rate_limit_min_backoff_ms: v.optional(v.pipe(v.number(), v.minValue(0)), 3e4),
  /** Default retry-after when header is missing (ms) */
  default_retry_after_ms: v.optional(v.pipe(v.number(), v.minValue(0)), 6e4),
  /** Consecutive auth failures before disabling account */
  max_consecutive_auth_failures: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1)), 3),
  /** Backoff after token refresh failure (ms) */
  token_failure_backoff_ms: v.optional(v.pipe(v.number(), v.minValue(0)), 3e4),
  /** Enable proactive background token refresh */
  proactive_refresh: v.optional(v.boolean(), true),
  /** Seconds before expiry to trigger proactive refresh (default 30 min) */
  proactive_refresh_buffer_seconds: v.optional(v.pipe(v.number(), v.minValue(60)), 1800),
  /** Interval between background refresh checks in seconds (default 5 min) */
  proactive_refresh_interval_seconds: v.optional(v.pipe(v.number(), v.minValue(30)), 300),
  /** Suppress toast notifications */
  quiet_mode: v.optional(v.boolean(), false),
  /** Enable debug logging */
  debug: v.optional(v.boolean(), false)
});

// src/usage.ts
var OAUTH_BETA_HEADER = ANTHROPIC_OAUTH_ADAPTER.oauthBetaHeader;
var ProfileResponseSchema = v2.object({
  account: v2.object({
    email: v2.optional(v2.string()),
    has_claude_pro: v2.optional(v2.boolean(), false),
    has_claude_max: v2.optional(v2.boolean(), false)
  })
});
async function fetchUsage(accessToken) {
  try {
    const response = await fetch(ANTHROPIC_USAGE_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "anthropic-beta": OAUTH_BETA_HEADER
      }
    });
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status} ${response.statusText}` };
    }
    const result = v2.safeParse(UsageLimitsSchema, await response.json());
    if (!result.success) {
      return { ok: false, reason: `Invalid response: ${result.issues[0]?.message ?? "unknown"}` };
    }
    return { ok: true, data: result.output };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, reason: message };
  }
}
async function fetchProfile(accessToken) {
  try {
    const response = await fetch(ANTHROPIC_PROFILE_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "anthropic-beta": OAUTH_BETA_HEADER
      }
    });
    if (!response.ok) {
      return { ok: false, reason: `HTTP ${response.status} ${response.statusText}` };
    }
    const result = v2.safeParse(ProfileResponseSchema, await response.json());
    if (!result.success) {
      return { ok: false, reason: `Invalid response: ${result.issues[0]?.message ?? "unknown"}` };
    }
    const planTier = result.output.account.has_claude_max ? "max" : result.output.account.has_claude_pro ? "pro" : "free";
    return { ok: true, data: { email: result.output.account.email, planTier } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, reason: message };
  }
}
function getPlanLabel(account) {
  if (!account.planTier || account.planTier === "free") return "";
  return PLAN_LABELS[account.planTier] ?? account.planTier.charAt(0).toUpperCase() + account.planTier.slice(1);
}

// src/oauth/anthropic-oauth.ts
var TOKEN_REQUEST_EXECUTABLE = process.env.OPENCODE_REFRESH_NODE_EXECUTABLE || "node";
var browserExec = (command, callback) => {
  exec(command, callback);
};
var callbackServerStarter = startCallbackServer;
var profileFetcher = fetchProfile;
var usageFetcher = fetchUsage;
function sanitizeTokenErrorBody(body) {
  const bounded = body.slice(0, 200);
  return bounded.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer <redacted>").replace(/[A-Za-z0-9_-]{32,}/g, "<redacted>");
}
function buildTokenRequestError(url, details) {
  return new Error(`Anthropic token request failed. url=${url}; details=${sanitizeTokenErrorBody(details)}`);
}
function buildTokenInvalidJsonError(url, body, details) {
  return new Error(`Anthropic token request returned invalid JSON. url=${url}; body=${sanitizeTokenErrorBody(body)}; details=${sanitizeTokenErrorBody(details)}`);
}
function parseNodeTokenEnvelope(output, endpoint) {
  try {
    return JSON.parse(output);
  } catch (error) {
    const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    throw buildTokenInvalidJsonError(endpoint, output, details);
  }
}
function parseTokenResponseBody(body, endpoint) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    throw buildTokenInvalidJsonError(endpoint, body, details);
  }
  return v3.parse(TokenResponseSchema, parsed);
}
function getOpenBrowserCommand(url, platform2 = process.platform) {
  if (platform2 === "win32") {
    return `rundll32.exe url.dll,FileProtocolHandler ${JSON.stringify(url)}`;
  }
  if (platform2 === "darwin") {
    return `open ${JSON.stringify(url)}`;
  }
  return `xdg-open ${JSON.stringify(url)}`;
}
function openBrowser(url) {
  try {
    browserExec(getOpenBrowserCommand(url), () => {
    });
  } catch {
  }
}
function resolveStoredClaudeIdentity(tokens) {
  const localIdentity = claudeCodeIntegration.loadIdentity();
  const accountUuid = tokens.account?.uuid || localIdentity.accountUuid || randomUUID();
  const deviceId = localIdentity.deviceId || randomUUID();
  return {
    accountId: accountUuid,
    accountUuid,
    deviceId
  };
}
function buildAuthorizeUrl(params) {
  const url = new URL(params.authorizeUrl);
  url.searchParams.set("code", "true");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", params.scopes);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", params.state);
  return url.toString();
}
async function postTokenEndpoint(contentType, body, timeoutMs = TOKEN_REFRESH_TIMEOUT_MS, userAgent) {
  const derivedProfile = await claudeCodeIntegration.loadAuthProfile();
  const oauthConfig = derivedProfile.oauthConfig;
  const endpoint = oauthConfig.tokenUrl;
  const resolvedUserAgent = userAgent ?? derivedProfile.userAgent;
  let output;
  try {
    output = await runNodeTokenRequest({
      body,
      contentType,
      endpoint,
      executable: TOKEN_REQUEST_EXECUTABLE,
      timeoutMs,
      userAgent: resolvedUserAgent
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw buildTokenRequestError(endpoint, details);
  }
  const result = parseNodeTokenEnvelope(output, endpoint);
  if (result.ok) {
    return parseTokenResponseBody(result.body ?? "", endpoint);
  }
  if (result.error) {
    throw buildTokenRequestError(endpoint, result.error);
  }
  throw buildTokenRequestError(
    endpoint,
    `Error: HTTP request failed. status=${result.status ?? 0}; url=${endpoint}; body=${sanitizeTokenErrorBody(result.body ?? "")}`
  );
}
var CODE_EXCHANGE_TIMEOUT_MS = 3e4;
async function exchangeCodeForTokens(params) {
  const derivedProfile = await claudeCodeIntegration.loadAuthProfile();
  const oauthConfig = derivedProfile.oauthConfig;
  const body = JSON.stringify({
    grant_type: "authorization_code",
    client_id: oauthConfig.clientId,
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
    state: params.state
  });
  return postTokenEndpoint("application/json", body, CODE_EXCHANGE_TIMEOUT_MS);
}
async function loginWithOAuth(callbacks) {
  const { oauthConfig: cfg } = await claudeCodeIntegration.loadAuthProfile();
  const { verifier: codeVerifier, challenge: codeChallenge } = generatePKCE();
  const state = generateState();
  const { port, waitForCode, stop } = await callbackServerStarter({ expectedState: state });
  const redirectUri = `http://localhost:${port}/callback`;
  try {
    const authorizeUrl = buildAuthorizeUrl({
      authorizeUrl: cfg.authorizeUrl,
      clientId: cfg.clientId,
      scopes: cfg.scopes,
      redirectUri,
      codeChallenge,
      state
    });
    callbacks.onAuth({
      url: authorizeUrl,
      instructions: "Complete authorization in your browser."
    });
    openBrowser(authorizeUrl);
    callbacks.onProgress?.("Waiting for browser authorization...");
    const { code } = await waitForCode;
    callbacks.onProgress?.("Exchanging authorization code...");
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier,
      state,
      redirectUri
    });
    callbacks.onProgress?.("Fetching profile...");
    const profileResult = await profileFetcher(tokens.access_token);
    try {
      await usageFetcher(tokens.access_token);
    } catch {
    }
    const profileData = profileResult.ok ? profileResult.data : void 0;
    const now2 = Date.now();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: now2 + tokens.expires_in * 1e3,
      email: profileData?.email ?? tokens.account?.email_address,
      planTier: profileData?.planTier ?? "",
      addedAt: now2,
      lastUsed: now2,
      ...resolveStoredClaudeIdentity(tokens)
    };
  } catch (error) {
    stop();
    throw error;
  }
}
var REFRESH_TIMEOUT_MS = 15e3;
async function refreshWithOAuth(currentRefreshToken) {
  const { oauthConfig } = await claudeCodeIntegration.loadAuthProfile();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
    client_id: oauthConfig.clientId
  }).toString();
  const response = await postTokenEndpoint(
    "application/x-www-form-urlencoded",
    body,
    REFRESH_TIMEOUT_MS
  );
  const patch = {
    accessToken: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1e3
  };
  if (response.refresh_token) {
    patch.refreshToken = response.refresh_token;
  }
  if (response.account?.uuid) {
    patch.accountId = response.account.uuid;
    patch.accountUuid = response.account.uuid;
  }
  if (response.account?.email_address) {
    patch.email = response.account.email_address;
  }
  return patch;
}
var detectOAuthConfig2 = claudeCodeIntegration.detectOAuthConfig;

// src/oauth/token.ts
var PERMANENT_FAILURE_MESSAGE_PATTERNS = [
  /\binvalid_grant\b/i,
  /\binvalid_scope\b/i,
  /\bunauthorized_client\b/i,
  /\brefresh token\b.*\b(invalid|expired|revoked|no longer valid)\b/i,
  /\bauth(?:entication)?(?:[_\s-]+)?invalid\b/i
];
var refreshMutexByAccountId = /* @__PURE__ */ new Map();
function isTokenExpired(account) {
  if (!account.accessToken || !account.expiresAt) return true;
  return account.expiresAt <= Date.now() + TOKEN_EXPIRY_BUFFER_MS;
}
async function refreshToken(currentRefreshToken, accountId, client) {
  if (!currentRefreshToken) return { ok: false, permanent: true };
  const mutexKey = accountId === "unmapped" ? `unmapped:${createHash3("sha256").update(currentRefreshToken).digest("hex").slice(0, 16)}` : accountId;
  const inFlightRefresh = refreshMutexByAccountId.get(mutexKey);
  if (inFlightRefresh) return inFlightRefresh;
  const refreshPromise = (async () => {
    try {
      const patch = await refreshWithOAuth(currentRefreshToken);
      return { ok: true, patch };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isPermanent = PERMANENT_FAILURE_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
      const endpointMatch = /url=([^;]+);/.exec(message);
      const statusMatch = /status=(\d{3})/.exec(message);
      const classification = isPermanent ? "permanent" : "transient";
      await client.app.log({
        body: {
          service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
          level: isPermanent ? "error" : "warn",
          message: `Token refresh failed: ${message}${isPermanent ? " (permanent)" : ""}`,
          extra: {
            accountId,
            endpoint: endpointMatch?.[1],
            status: statusMatch?.[1] ? Number(statusMatch[1]) : void 0,
            classification
          }
        }
      }).catch(() => {
      });
      return { ok: false, permanent: isPermanent, message, status: statusMatch?.[1] ? Number(statusMatch[1]) : void 0 };
    } finally {
      refreshMutexByAccountId.delete(mutexKey);
    }
  })();
  refreshMutexByAccountId.set(mutexKey, refreshPromise);
  return refreshPromise;
}

// src/accounts/manager.ts
var AccountManager = createAccountManagerForProvider({
  providerAuthId: "anthropic",
  getConfig,
  isTokenExpired,
  isClaimedByOther,
  readClaims,
  refreshToken,
  writeClaim
});

// src/runtime/executor.ts
import { createExecutorForProvider as createExecutorForProvider2, getClearedOAuthBody } from "opencode-multi-account-core";

// src/accounts/rate-limit.ts
import { createRateLimitHandlers } from "opencode-multi-account-core";
var {
  fetchUsageLimits,
  getResetMsFromUsage,
  handleRateLimitResponse,
  retryAfterMsFromResponse
} = createRateLimitHandlers({
  fetchUsage: async (accessToken) => fetchUsage(accessToken),
  getConfig,
  formatWaitTime,
  getAccountLabel,
  showToast
});

// src/runtime/pool-chain.ts
import { createExecutorForProvider } from "opencode-multi-account-core";
function buildCascadePrompt(input, init) {
  if (typeof init?.body === "string" && init.body.length > 0) {
    return init.body;
  }
  const method = init?.method ?? "GET";
  return `${method}:${String(input)}`;
}
function createQueueAwareManager(manager, queue, cascadeStateManager) {
  return Object.create(manager, {
    selectAccount: { value: async function selectAccount(stickyKey) {
      await manager.refresh();
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) break;
        const account = manager.getAccounts().find((candidate) => candidate.uuid === next.accountUuid);
        if (!account?.uuid) continue;
        if (!account.enabled || account.isAuthDisabled) continue;
        if (manager.isRateLimited(account)) continue;
        cascadeStateManager.markAttempted(account.uuid);
        if (next.chainIndex !== void 0) {
          cascadeStateManager.markVisitedChainIndex(next.chainIndex);
        }
        return account;
      }
      return manager.selectAccount(stickyKey);
    } }
  });
}
async function executeWithPoolChainRotation(manager, runtimeFactory, poolManager, cascadeStateManager, poolChainConfig, client, input, init) {
  const cascadePrompt = buildCascadePrompt(input, init);
  const currentAccountUuid = manager.getActiveAccount()?.uuid;
  cascadeStateManager.startTurn(cascadePrompt, currentAccountUuid);
  const queue = [];
  const queuedAccountUuids = /* @__PURE__ */ new Set();
  const queueAwareManager = createQueueAwareManager(manager, queue, cascadeStateManager);
  const { executeWithAccountRotation: executeWithAccountRotation2 } = createExecutorForProvider("Anthropic", {
    handleRateLimitResponse: async (rawManager, rawClient, account, response) => {
      await handleRateLimitResponse(
        rawManager,
        rawClient,
        account,
        response
      );
      if (!account.uuid) return;
      poolManager.markExhausted(account.uuid);
      cascadeStateManager.markAttempted(account.uuid);
      const cascadeState = cascadeStateManager.ensureCascadeState(cascadePrompt, account.uuid);
      const failoverPlan = await poolManager.buildFailoverPlan(
        account,
        poolChainConfig,
        manager,
        {
          attemptedAccounts: cascadeState.attemptedAccounts,
          visitedChainIndexes: cascadeState.visitedChainIndexes
        }
      );
      for (const candidate of failoverPlan.candidates) {
        if (queuedAccountUuids.has(candidate.accountUuid)) continue;
        queue.push({
          accountUuid: candidate.accountUuid,
          chainIndex: candidate.chainIndex
        });
        queuedAccountUuids.add(candidate.accountUuid);
      }
    },
    formatWaitTime,
    sleep,
    showToast,
    getAccountLabel
  });
  try {
    return await executeWithAccountRotation2(
      queueAwareManager,
      runtimeFactory,
      client,
      input,
      init
    );
  } finally {
    cascadeStateManager.clearCascadeState();
  }
}

// src/runtime/executor.ts
var { executeWithAccountRotation: executeWithCoreAccountRotation } = createExecutorForProvider2("Anthropic", {
  handleRateLimitResponse: async (manager, client, account, response) => handleRateLimitResponse(
    manager,
    client,
    account,
    response
  ),
  formatWaitTime,
  sleep,
  showToast,
  getAccountLabel
});
function isAllAccountsTerminalError(error) {
  if (!(error instanceof Error)) return false;
  return error.message.includes("All Anthropic accounts");
}
async function clearAuthIfNoUsableAccount(manager, client) {
  await manager.refresh();
  if (manager.hasAnyUsableAccount()) return;
  await client.auth.set({
    path: { id: ANTHROPIC_OAUTH_ADAPTER.authProviderId },
    body: getClearedOAuthBody()
  }).catch(() => {
  });
}
function hasPoolChainEntries(config2) {
  return (config2.pools?.length ?? 0) > 0 || (config2.chains?.length ?? 0) > 0;
}
async function executeWithAccountRotation(manager, runtimeFactory, client, input, init, options) {
  try {
    if (!options || !hasPoolChainEntries(options.poolChainConfig)) {
      return await executeWithCoreAccountRotation(manager, runtimeFactory, client, input, init);
    }
    return await executeWithPoolChainRotation(
      manager,
      runtimeFactory,
      options.poolManager,
      options.cascadeStateManager,
      options.poolChainConfig,
      client,
      input,
      init
    );
  } catch (error) {
    if (isAllAccountsTerminalError(error)) {
      await clearAuthIfNoUsableAccount(manager, client);
    }
    throw error;
  }
}

// src/auth-ux/menu/ansi.ts
import {
  ANSI,
  isTTY,
  parseKey
} from "opencode-multi-account-core";

// src/auth-ux/menu/select.ts
import {
  select
} from "opencode-multi-account-core";

// src/auth-ux/menu/confirm.ts
import { confirm } from "opencode-multi-account-core";

// src/auth-ux/menu/menu.ts
function formatRelativeTime(timestamp) {
  if (!timestamp) return "never";
  const days = Math.floor((Date.now() - timestamp) / 864e5);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(timestamp).toLocaleDateString();
}
function formatDate(timestamp) {
  if (!timestamp) return "unknown";
  return new Date(timestamp).toLocaleDateString();
}
function getAccountStatus(account) {
  if (account.isAuthDisabled) return "auth-disabled";
  if (!account.enabled) return "disabled";
  if (account.cachedUsage) {
    const now2 = Date.now();
    const usage = account.cachedUsage;
    const hasEvaluableUsageTier = [usage.five_hour, usage.seven_day].some((tier) => tier != null);
    const exhaustedTiers = [usage.five_hour, usage.seven_day].filter(
      (tier) => tier && tier.utilization >= 100 && tier.resets_at != null && Date.parse(tier.resets_at) > now2
    );
    if (exhaustedTiers.length > 0) {
      return "rate-limited";
    }
    if (hasEvaluableUsageTier) {
      return "active";
    }
  }
  if (account.rateLimitResetAt && account.rateLimitResetAt > Date.now()) return "rate-limited";
  return "active";
}
var STATUS_BADGE = {
  "active": `${ANSI.green}[active]${ANSI.reset}`,
  "rate-limited": `${ANSI.yellow}[rate-limited]${ANSI.reset}`,
  "auth-disabled": `${ANSI.red}[auth-disabled]${ANSI.reset}`,
  "disabled": `${ANSI.red}[disabled]${ANSI.reset}`
};
function buildAccountMenuItem(account) {
  const label = getAccountLabel(account);
  const status = getAccountStatus(account);
  const badge = STATUS_BADGE[status];
  return {
    label: `${label} ${badge}`,
    hint: account.lastUsed ? `used ${formatRelativeTime(account.lastUsed)}` : "",
    value: account
  };
}
async function showAuthMenu(accounts) {
  const items = [
    { label: "Add new account", value: { type: "add" }, color: "green" },
    { label: "Check quotas", value: { type: "check-quotas" }, color: "cyan" },
    { label: "Manage accounts", value: { type: "manage" } },
    { label: "Load balancing", value: { type: "load-balancing" } },
    { label: "", value: { type: "cancel" }, separator: true },
    { label: "Delete all accounts", value: { type: "delete-all" }, color: "red" }
  ];
  while (true) {
    const subtitle = `${accounts.length} account(s) registered`;
    const result = await select(items, {
      message: "Claude Multi-Auth",
      subtitle
    });
    if (!result) return { type: "cancel" };
    if (result.type === "delete-all") {
      const confirmed = await confirm("Delete ALL accounts? This cannot be undone.");
      if (!confirmed) continue;
    }
    return result;
  }
}
async function showManageAccounts(accounts) {
  const items = [
    { label: "Back", value: null },
    { label: "", value: null, separator: true },
    ...accounts.map(buildAccountMenuItem)
  ];
  const selected = await select(items, {
    message: "Manage Accounts",
    subtitle: "Select an account to manage"
  });
  if (!selected) return { action: "back" };
  return showAccountDetails(selected);
}
async function showAccountDetails(account) {
  const label = getAccountLabel(account);
  const status = getAccountStatus(account);
  const badge = STATUS_BADGE[status];
  console.log("");
  console.log(`${ANSI.bold}Account: ${label} ${badge}${ANSI.reset}`);
  console.log(`${ANSI.dim}Added: ${formatDate(account.addedAt)}${ANSI.reset}`);
  console.log(`${ANSI.dim}Last used: ${formatRelativeTime(account.lastUsed)}${ANSI.reset}`);
  if (account.isAuthDisabled) {
    console.log(`${ANSI.red}Auth disabled: ${account.authDisabledReason ?? "unknown"}${ANSI.reset}`);
  }
  console.log("");
  while (true) {
    const toggleLabel = account.enabled ? "Disable account" : "Enable account";
    const toggleColor = account.enabled ? "yellow" : "green";
    const items = [
      { label: "Back", value: "back" }
    ];
    items.push({ label: toggleLabel, value: "toggle", color: toggleColor });
    items.push({ label: "Re-authenticate", value: "retry-auth", color: "cyan" });
    items.push({ label: "Delete this account", value: "delete", color: "red" });
    const result = await select(items, {
      message: "Account options",
      subtitle: label
    });
    if (result === "delete") {
      const confirmed = await confirm(`Delete ${label}?`);
      if (!confirmed) continue;
    }
    return { action: result ?? "cancel", account };
  }
}
function getUsageColor(utilization) {
  if (utilization >= 90) return ANSI.red;
  if (utilization >= 60) return ANSI.yellow;
  return ANSI.green;
}
function createProgressBar(utilization, width = 20) {
  const filled = Math.round(utilization / 100 * width);
  const empty = width - filled;
  const color = getUsageColor(utilization);
  return `${color}${"\u2588".repeat(filled)}${ANSI.reset}${"\u2591".repeat(empty)} ${color}${Math.round(utilization)}% used${ANSI.reset}`;
}
function formatResetTime(resetAt) {
  if (!resetAt) return "";
  const date = new Date(resetAt);
  const now2 = /* @__PURE__ */ new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeStr = date.toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit", hour12: true });
  const isSameDay = date.getFullYear() === now2.getFullYear() && date.getMonth() === now2.getMonth() && date.getDate() === now2.getDate();
  if (isSameDay) {
    return ` (resets ${timeStr}, ${tz})`;
  }
  const dateStr = date.toLocaleDateString(void 0, { month: "short", day: "numeric" });
  return ` (resets ${dateStr} ${timeStr}, ${tz})`;
}
function printUsageEntry(name, entry, isLast) {
  const connector = isLast ? "\u2514\u2500" : "\u251C\u2500";
  if (!entry) {
    console.log(`     ${connector} ${name.padEnd(16)} no data`);
    return;
  }
  const bar = createProgressBar(entry.utilization);
  const reset = entry.resets_at ? formatResetTime(entry.resets_at) : "";
  console.log(`     ${connector} ${name.padEnd(16)} ${bar}${reset}`);
}
function printQuotaReport(account, usage) {
  const label = getAccountLabel(account);
  const status = getAccountStatus(account);
  const badge = STATUS_BADGE[status];
  const planLabel = getPlanLabel(account) || "Free";
  console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
  console.log(`  ${label} ${badge}`);
  console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
  if (account.email) {
    console.log(`  \u{1F4E7} ${account.email}`);
  }
  console.log(`  \u{1F4CB} ${planLabel}`);
  console.log(`
  \u2514\u2500 Claude Quota`);
  printUsageEntry("Current session", usage.five_hour, false);
  printUsageEntry("Current week", usage.seven_day, !usage.seven_day_sonnet);
  if (usage.seven_day_sonnet) {
    printUsageEntry("Sonnet only", usage.seven_day_sonnet, true);
  }
  console.log("");
}
var STRATEGY_DESCRIPTIONS = {
  "sticky": "Same account until rate-limited",
  "round-robin": "Rotate every request",
  "hybrid": "Score-based (usage + health)"
};
async function showStrategySelect(current) {
  const strategies = ["sticky", "round-robin", "hybrid"];
  const items = strategies.map((s) => ({
    label: `${s}${s === current ? " (current)" : ""}`,
    hint: STRATEGY_DESCRIPTIONS[s],
    value: s
  }));
  return select(items, {
    message: "Load Balancing Strategy",
    subtitle: `Current: ${current}`
  });
}
function printQuotaError(account, error) {
  const label = getAccountLabel(account);
  console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
  console.log(`  ${label}`);
  if (account.email) {
    console.log(`  \u{1F4E7} ${account.email}`);
  }
  console.log(`\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`);
  console.log(`  ${ANSI.red}Error: ${error}${ANSI.reset}
`);
}

// src/accounts/store.ts
import {
  AccountStore as CoreAccountStore
} from "opencode-multi-account-core";
var AccountStore = class extends CoreAccountStore {
  constructor() {
    super(ACCOUNTS_FILENAME);
  }
};

// src/auth-ux/handler.ts
import { randomUUID as randomUUID2 } from "crypto";
function makeFailedFlowResult(message) {
  return {
    url: "",
    instructions: message,
    method: "auto",
    callback: async () => ({ type: "failed" })
  };
}
function toOAuthCredentials(result) {
  return { type: "oauth", refresh: result.refresh, access: result.access, expires: result.expires };
}
function asOAuthCallbackResponse(account) {
  if (!account.refreshToken || !account.accessToken || typeof account.expiresAt !== "number") {
    return { type: "failed" };
  }
  return {
    type: "success",
    refresh: account.refreshToken,
    access: account.accessToken,
    expires: account.expiresAt
  };
}
function extractAccountMetadata(account) {
  if (!account) return void 0;
  return {
    accountId: account.accountId,
    accountUuid: account.accountUuid,
    deviceId: account.deviceId,
    email: account.email,
    planTier: account.planTier
  };
}
async function startOAuthFlow() {
  try {
    const completedAccount = await loginWithOAuth({
      onAuth: (info) => {
        const instruction = info.instructions ?? "Complete authorization in your browser.";
        const urlLine = info.url ? `
Auth URL (manual fallback): ${info.url}` : "";
        console.log(`
${instruction}${urlLine}
`);
      }
    });
    const completedResult = asOAuthCallbackResponse(completedAccount);
    const accountEmail = completedAccount.email;
    return {
      url: "",
      instructions: "",
      method: "auto",
      callback: async () => completedResult,
      _email: accountEmail,
      _account: completedAccount
    };
  } catch {
    return makeFailedFlowResult("Failed to start OAuth flow");
  }
}
function wrapCallbackWithAccountReplace(result, manager, targetAccount) {
  const originalCallback = result.callback;
  return {
    ...result,
    callback: async function(code) {
      const callbackResult = await originalCallback(code);
      if (callbackResult.type === "success") {
        if (targetAccount.uuid) {
          await manager.replaceAccountCredentials(
            targetAccount.uuid,
            toOAuthCredentials(callbackResult),
            extractAccountMetadata(result._account)
          );
        }
        console.log(`
\u2705 ${getAccountLabel(targetAccount)} re-authenticated successfully.
`);
      }
      return callbackResult;
    }
  };
}
function wrapCallbackWithManagerSync(result, manager) {
  const originalCallback = result.callback;
  const email = result._email;
  return {
    ...result,
    callback: async function(code) {
      const callbackResult = await originalCallback(code);
      if (callbackResult.type === "success") {
        const auth = toOAuthCredentials(callbackResult);
        const metadata = extractAccountMetadata(result._account);
        if (manager) {
          const countBefore = manager.getAccounts().length;
          await manager.addAccount(auth, email, metadata);
          const countAfter = manager.getAccounts().length;
          const added = countAfter > countBefore;
          console.log(added ? `
\u2705 Account added to multi-auth pool (${countAfter} total).
` : `
\u2139\uFE0F  Account already exists in multi-auth pool (${countAfter} total).
`);
        } else {
          await persistFallback(auth, email, metadata);
          console.log("\n\u2705 Account saved.\n");
        }
      }
      return callbackResult;
    }
  };
}
async function persistFallback(auth, email, metadata) {
  try {
    const store = new AccountStore();
    const now2 = Date.now();
    const account = {
      uuid: randomUUID2(),
      email,
      refreshToken: auth.refresh,
      accessToken: auth.access,
      expiresAt: auth.expires,
      addedAt: now2,
      lastUsed: now2,
      enabled: true,
      planTier: "",
      consecutiveAuthFailures: 0,
      isAuthDisabled: false,
      accountId: metadata?.accountId,
      accountUuid: metadata?.accountUuid,
      deviceId: metadata?.deviceId
    };
    if (metadata?.planTier !== void 0) account.planTier = metadata.planTier;
    await store.addAccount(account);
    await store.setActiveUuid(account.uuid);
  } catch {
  }
}
async function handleAuthorize(manager, inputs, client) {
  if (!inputs || !isTTY()) {
    return wrapCallbackWithManagerSync(await startOAuthFlow(), manager);
  }
  const effectiveManager = manager ?? await loadManagerFromDisk(client);
  if (!effectiveManager || effectiveManager.getAccounts().length === 0) {
    return wrapCallbackWithManagerSync(await startOAuthFlow(), manager);
  }
  return runAccountManagementMenu(effectiveManager, client);
}
async function loadManagerFromDisk(client) {
  const store = new AccountStore();
  const stored = await store.load();
  if (stored.accounts.length === 0) return null;
  const emptyAuth = { type: "oauth", refresh: "", access: "", expires: 0 };
  return AccountManager.create(store, emptyAuth, client);
}
async function runAccountManagementMenu(manager, client) {
  while (true) {
    const allAccounts = manager.getAccounts();
    const menuAction = await showAuthMenu(allAccounts);
    switch (menuAction.type) {
      case "add":
        return wrapCallbackWithManagerSync(await startOAuthFlow(), manager);
      case "check-quotas":
        await handleCheckQuotas(manager, client);
        continue;
      case "manage": {
        const result = await showManageAccounts(allAccounts);
        if (result.action === "back" || result.action === "cancel") continue;
        const manageResult = await handleManageAction(manager, result.action, result.account, client);
        if (manageResult.triggerOAuth) {
          return wrapCallbackWithAccountReplace(await startOAuthFlow(), manager, manageResult.account);
        }
        continue;
      }
      case "load-balancing":
        await handleLoadBalancing();
        continue;
      case "delete-all":
        await manager.clearAllAccounts();
        console.log("\nAll accounts deleted.\n");
        return wrapCallbackWithManagerSync(await startOAuthFlow(), manager);
      case "cancel":
        return makeFailedFlowResult("Authentication cancelled");
    }
  }
}
async function handleCheckQuotas(manager, client) {
  await manager.refresh();
  const accounts = manager.getAccounts();
  const effectiveClient = client ?? createMinimalClient();
  if (client) manager.setClient(client);
  console.log(`
\u{1F4CA} Checking quotas for ${accounts.length} account(s)...
`);
  for (const account of accounts) {
    await checkAccountQuota(manager, account, effectiveClient);
  }
}
async function checkAccountQuota(manager, account, client) {
  if (account.isAuthDisabled || !account.accessToken || isTokenExpired(account)) {
    if (!account.uuid) {
      printQuotaError(account, "Missing account UUID");
      return;
    }
    const refreshResult = await manager.ensureValidToken(account.uuid, client);
    if (!refreshResult.ok) {
      await manager.markAuthFailure(account.uuid, refreshResult, account);
      await manager.refresh();
      const updatedAccount = manager.getAccounts().find((candidate) => candidate.uuid === account.uuid);
      if (!updatedAccount) {
        printQuotaError(account, refreshResult.permanent ? "Refresh failed permanently; account removed" : "Failed to refresh token");
        return;
      }
      printQuotaError(updatedAccount, updatedAccount.isAuthDisabled ? `${updatedAccount.authDisabledReason ?? "Auth disabled"} (refresh failed)` : "Failed to refresh token");
      return;
    }
    await manager.refresh();
  }
  const freshAccounts = manager.getAccounts();
  const freshAccount = freshAccounts.find((candidate) => candidate.uuid === account.uuid);
  if (!freshAccount?.accessToken) {
    printQuotaError(account, "No access token available");
    return;
  }
  const usageResult = await fetchUsage(freshAccount.accessToken);
  if (!usageResult.ok) {
    printQuotaError(freshAccount, `Failed to fetch usage: ${usageResult.reason}`);
    return;
  }
  if (freshAccount.uuid) {
    await manager.applyUsageCache(freshAccount.uuid, usageResult.data);
  }
  let reportAccount = freshAccount;
  const profileResult = await fetchProfile(freshAccount.accessToken);
  if (profileResult.ok) {
    if (freshAccount.uuid) {
      await manager.applyProfileCache(freshAccount.uuid, profileResult.data);
    }
    reportAccount = {
      ...freshAccount,
      email: profileResult.data.email ?? freshAccount.email,
      planTier: profileResult.data.planTier
    };
  }
  printQuotaReport(reportAccount, usageResult.data);
}
async function handleLoadBalancing() {
  const current = getConfig().account_selection_strategy;
  const selected = await showStrategySelect(current);
  if (!selected || selected === current) return;
  await updateConfigField("account_selection_strategy", selected);
  console.log(`
Load balancing strategy changed: ${current} \u2192 ${selected}
`);
}
async function handleManageAction(manager, action, account, client) {
  if (!account) return { triggerOAuth: false };
  const label = getAccountLabel(account);
  switch (action) {
    case "toggle":
      if (!account.uuid) break;
      await manager.toggleEnabled(account.uuid);
      await manager.refresh();
      {
        const updated = manager.getAccounts().find((candidate) => candidate.uuid === account.uuid);
        console.log(`
${label} ${updated?.enabled ? "enabled" : "disabled"}.
`);
      }
      break;
    case "delete":
      if (!account.uuid) break;
      {
        const removed = await manager.removeAccount(account.index);
        console.log(removed ? "\nAccount deleted.\n" : "\nFailed to delete account.\n");
      }
      break;
    case "retry-auth": {
      if (!account.uuid) break;
      const effectiveClient = client ?? createMinimalClient();
      console.log(`
Retrying authentication for ${label}...
`);
      const result = await manager.retryAuth(account.uuid, effectiveClient);
      if (result.ok) {
        console.log(`\u2705 ${label} re-authenticated successfully.
`);
      } else {
        console.log("Token refresh failed \u2014 starting OAuth flow...\n");
        return { triggerOAuth: true, account };
      }
      break;
    }
  }
  return { triggerOAuth: false };
}

// src/accounts/proactive-refresh.ts
import { createProactiveRefreshQueueForProvider } from "opencode-multi-account-core";
var ProactiveRefreshQueue = createProactiveRefreshQueueForProvider({
  providerAuthId: "anthropic",
  getConfig,
  isTokenExpired,
  refreshToken,
  debugLog
});

// src/runtime/factory.ts
import { TokenRefreshError } from "opencode-multi-account-core";

// src/request/transform.ts
import { randomUUID as randomUUID4 } from "crypto";

// src/model/config.ts
var FALLBACK_CREDIT_BETA = "fallback-credit-2026-06-01";
var MID_CONVERSATION_SYSTEM_BETA = "mid-conversation-system-2026-04-07";
var EFFORT_BETA = "effort-2025-11-24";
function splitBetaFlags(value) {
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}
var config = {
  baseBetas: splitBetaFlags(ANTHROPIC_OAUTH_ADAPTER.requestBetaHeader),
  longContextBetas: ["context-1m-2025-08-07", "context-management-2025-06-27"],
  modelOverrides: {
    fable: {
      add: [FALLBACK_CREDIT_BETA]
    },
    "opus-5": {
      add: [FALLBACK_CREDIT_BETA]
    },
    "sonnet-5": {
      add: [EFFORT_BETA]
    },
    sonnet: {
      exclude: [MID_CONVERSATION_SYSTEM_BETA],
      add: [EFFORT_BETA]
    },
    haiku: {
      exclude: [MID_CONVERSATION_SYSTEM_BETA, EFFORT_BETA]
    },
    "4-6": {
      add: [EFFORT_BETA]
    }
  }
};
function getRequiredBetas() {
  return splitBetaFlags(
    process.env.ANTHROPIC_BETA_FLAGS ?? claudeCodeIntegration.loadRequestProfile().betaHeader ?? config.baseBetas.join(",")
  );
}
function getModelOverride(modelId) {
  const lowerModelId = modelId.toLowerCase();
  for (const [pattern, override] of Object.entries(config.modelOverrides)) {
    if (lowerModelId.includes(pattern)) {
      return override;
    }
  }
  return null;
}

// src/request/betas.ts
var LONG_CONTEXT_BETAS = config.longContextBetas;
var OAUTH_BETA = "oauth-2025-04-20";
var excludedBetas = /* @__PURE__ */ new Map();
var lastBetaFlagsEnv = process.env.ANTHROPIC_BETA_FLAGS;
var lastModelId;
function getExcludedBetas(modelId) {
  const currentBetaFlags = process.env.ANTHROPIC_BETA_FLAGS;
  if (currentBetaFlags !== lastBetaFlagsEnv) {
    excludedBetas.clear();
    lastBetaFlagsEnv = currentBetaFlags;
  }
  if (lastModelId !== void 0 && lastModelId !== modelId) {
    excludedBetas.clear();
  }
  lastModelId = modelId;
  return excludedBetas.get(modelId) ?? /* @__PURE__ */ new Set();
}
function addExcludedBeta(modelId, beta) {
  const nextExcludedBetas = excludedBetas.get(modelId) ?? /* @__PURE__ */ new Set();
  nextExcludedBetas.add(beta);
  excludedBetas.set(modelId, nextExcludedBetas);
}
function isLongContextError(responseBody) {
  return responseBody.includes("Extra usage is required for long context requests") || responseBody.includes("long context beta is not yet available");
}
function isUnexpectedBetaError(responseBody) {
  return responseBody.includes("Unexpected value") && responseBody.includes("anthropic-beta");
}
function extractRejectedBetas(responseBody) {
  const match = /Unexpected value\(s\):\s*([^\n]+?)\s*for the anthropic-beta header/i.exec(responseBody);
  if (!match?.[1]) {
    return [];
  }
  return match[1].split(",").map((value) => value.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
}
function ensureOauthBeta(betas) {
  return betas.includes(OAUTH_BETA) ? betas : [OAUTH_BETA, ...betas];
}
function supports1mContext(modelId) {
  const lowerModelId = resolveClaudeCodeModelAlias(modelId).toLowerCase();
  if (isClaudeCode1mModelLabel(modelId)) {
    return lowerModelId.includes("fable") || lowerModelId.includes("opus") || lowerModelId.includes("sonnet");
  }
  if (!lowerModelId.includes("opus") && !lowerModelId.includes("sonnet") && !lowerModelId.includes("fable")) {
    return false;
  }
  const versionMatch = lowerModelId.match(/(opus|sonnet|fable)-(\d+)(?:-(\d+))?/);
  if (!versionMatch) {
    return false;
  }
  const major = Number.parseInt(versionMatch[2], 10);
  const minor = versionMatch[3] ? Number.parseInt(versionMatch[3], 10) : 0;
  const effectiveMinor = minor > 99 ? 0 : minor;
  return major > 4 || major === 4 && effectiveMinor >= 6;
}
function getModelBetas(modelId, excluded) {
  const normalizedModelId = resolveClaudeCodeModelAlias(modelId);
  const betas = [...getRequiredBetas()];
  const longContextBeta = config.longContextBetas[0];
  if (longContextBeta && (process.env.ANTHROPIC_ENABLE_1M_CONTEXT === "true" || isClaudeCode1mModelLabel(normalizedModelId)) && supports1mContext(normalizedModelId)) {
    betas.push(longContextBeta);
  }
  const override = getModelOverride(normalizedModelId);
  if (override?.exclude) {
    for (const excludedBeta of override.exclude) {
      const index = betas.indexOf(excludedBeta);
      if (index !== -1) {
        betas.splice(index, 1);
      }
    }
  }
  if (override?.add) {
    for (const addedBeta of override.add) {
      if (!betas.includes(addedBeta)) {
        betas.push(addedBeta);
      }
    }
  }
  if (!excluded || excluded.size === 0) {
    return betas;
  }
  return betas.filter((beta) => !excluded.has(beta));
}

// src/request/upstream-request.ts
import { randomUUID as randomUUID3 } from "crypto";

// src/model/capabilities.ts
var runtimeModelCapabilities = /* @__PURE__ */ new Map();
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function readNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function readBoolean(value) {
  return typeof value === "boolean" ? value : void 0;
}
function normalizeModelId(modelId) {
  const trimmed = modelId.trim().toLowerCase();
  const slashIndex = trimmed.indexOf("/");
  return slashIndex >= 0 ? trimmed.slice(slashIndex + 1) : trimmed;
}
function readProviderModels(provider) {
  return isRecord(provider.models) && !Array.isArray(provider.models) ? provider.models : {};
}
function readLimitOutput(raw) {
  const limit = isRecord(raw.limit) ? raw.limit : void 0;
  const capabilityLimit = isRecord(raw.capabilities) && isRecord(raw.capabilities.limit) ? raw.capabilities.limit : void 0;
  return readNumber(limit?.output) ?? readNumber(capabilityLimit?.output);
}
function readThinkingSupport(raw) {
  return readBoolean(raw.reasoning) ?? readBoolean(raw.thinking) ?? readBoolean(raw.supportsThinking) ?? (isRecord(raw.capabilities) ? readBoolean(raw.capabilities.reasoning) ?? readBoolean(raw.capabilities.thinking) ?? readBoolean(raw.capabilities.supportsThinking) : void 0);
}
function ingestProviderModelsCapabilities(models) {
  runtimeModelCapabilities.clear();
  if (!isRecord(models)) {
    return;
  }
  for (const [key, value] of Object.entries(models)) {
    if (!isRecord(value)) {
      continue;
    }
    const resolvedId = typeof value.id === "string" ? value.id : key;
    const capability = {
      maxOutputTokens: readLimitOutput(value),
      supportsThinking: readThinkingSupport(value)
    };
    runtimeModelCapabilities.set(normalizeModelId(resolvedId), capability);
    runtimeModelCapabilities.set(normalizeModelId(key), capability);
  }
}
function getRuntimeModelCapability(modelId) {
  return runtimeModelCapabilities.get(normalizeModelId(modelId));
}

// src/request/client-adapter.ts
var MAX_TOOL_RESULT_TEXT_LENGTH = 30 * 1024;
var TRUNCATION_SUFFIX = "[...truncated]";
var ORCHESTRATION_TAG_NAMES = [
  "system-reminder",
  "env",
  "system_information",
  "current_working_directory",
  "operating_system",
  "default_shell",
  "home_directory",
  "task_metadata",
  "directories",
  "thinking",
  "agent_persona",
  "agent_context",
  "tool_context",
  "persona",
  "tool_call"
];
var ORCHESTRATION_PATTERNS = ORCHESTRATION_TAG_NAMES.flatMap((tag) => [
  new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi"),
  new RegExp(`<${tag}\\b[^>]*/>`, "gi")
]);
var FRAMEWORK_PATTERNS = [
  /\b(roo[- ]?cline|roo[- ]?code|big[- ]?agi|claude[- ]?bridge|amazon\s+q)\b/gi,
  /\b(openclaw|hermes|aider|cursor|windsurf|cline|continue|copilot|cody)\b/gi,
  /\b(zed|plandex|tabby|opencode|daytona)\b/gi,
  /\b(librechat|typingmind)\b/gi,
  /\b(openai|gpt-4|gpt-3\.5)\b/gi,
  /powered by [a-z]+/gi,
  /\bgateway\b/gi,
  /\bsessions_[a-z_]+\b/gi
];
var CONTENT_FRAMEWORK_PATTERNS = [
  /\b(roo[- ]?cline|roo[- ]?code|big[- ]?agi|claude[- ]?bridge)\b/gi,
  /\b(librechat|typingmind)\b/gi
];
function normalizeAnthropicClientRequest(inputBody) {
  const body = structuredClone(inputBody);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const systemTexts = normalizeSystemTexts(body.system);
  stripCacheControl(body);
  const trailingMessage = messages.at(-1);
  const trailingUserBoundary = trailingMessage?.role === "user" && hasMeaningfulContent(trailingMessage.content) ? structuredClone(trailingMessage) : void 0;
  sanitizeMessages(body);
  const trailingUserBoundaryWasScrubbed = trailingUserBoundary !== void 0 && !hasMeaningfulContent(trailingMessage?.content);
  stripAssistantThinkingBlocks(messages);
  for (const message of messages) {
    if (typeof message.content === "string") {
      message.content = sanitizeAndScrubContent(message.content);
      continue;
    }
    if (!Array.isArray(message.content)) {
      continue;
    }
    for (const block of message.content) {
      sanitizeMessageBlock(block);
    }
  }
  compactMessageContent(messages);
  removeEmptyTurns(messages);
  trimTrailingEmptyTurns(messages);
  if (trailingUserBoundary && trailingUserBoundaryWasScrubbed && messages.at(-1)?.role === "assistant") {
    messages.push(trailingUserBoundary);
  }
  body.messages = messages;
  stripUnsupportedSamplingFields(body);
  stripThinkingControlFields(body);
  return {
    body,
    firstUserMessage: extractFirstUserMessage(messages),
    messages,
    systemTexts
  };
}
function sanitizeMessages(body) {
  const messages = body.messages;
  if (!Array.isArray(messages)) {
    return;
  }
  for (const message of messages) {
    if (!isRecord2(message)) {
      continue;
    }
    if (typeof message.content === "string") {
      message.content = sanitizeContent(message.content);
      continue;
    }
    if (!Array.isArray(message.content)) {
      continue;
    }
    for (const block of message.content) {
      if (isRecord2(block) && typeof block.text === "string") {
        block.text = sanitizeContent(block.text);
      }
    }
    message.content = message.content.filter((block) => {
      return !isRecord2(block) || block.type !== "text" || block.text !== "";
    });
  }
}
function scrubWithPatterns(text, patterns) {
  let result = text;
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, (match, ...args) => {
      const offset = args.at(-2);
      const source = args.at(-1);
      if (typeof offset !== "number" || typeof source !== "string") {
        return match;
      }
      const before = offset > 0 ? source[offset - 1] ?? "" : "";
      const after = offset + match.length < source.length ? source[offset + match.length] ?? "" : "";
      if (before === "." || before === "/" || before === "\\" || before === "-" || before === "_") {
        return match;
      }
      if (after === "/" || after === "\\") {
        return match;
      }
      return "";
    });
  }
  return result;
}
function scrubFrameworkIdentifiers(text) {
  return scrubWithPatterns(text, FRAMEWORK_PATTERNS);
}
function scrubFrameworkIdentifiersInContent(text) {
  return scrubWithPatterns(text, CONTENT_FRAMEWORK_PATTERNS);
}
function truncateToolResultText(text) {
  if (text.length <= MAX_TOOL_RESULT_TEXT_LENGTH) {
    return text;
  }
  return `${text.slice(0, MAX_TOOL_RESULT_TEXT_LENGTH)}${TRUNCATION_SUFFIX}`;
}
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function sanitizeContent(text) {
  let result = text;
  for (const pattern of ORCHESTRATION_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, "");
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}
function sanitizeAndScrubText(text) {
  return scrubFrameworkIdentifiers(sanitizeContent(text)).replace(/\n{3,}/g, "\n\n").trim();
}
function sanitizeAndScrubContent(text) {
  return scrubFrameworkIdentifiersInContent(sanitizeContent(text)).replace(/\n{3,}/g, "\n\n").trim();
}
function stripCacheControl(value) {
  if (Array.isArray(value)) {
    for (const item of value) {
      stripCacheControl(item);
    }
    return;
  }
  if (!isRecord2(value)) {
    return;
  }
  delete value.cache_control;
  for (const nested of Object.values(value)) {
    stripCacheControl(nested);
  }
}
function sanitizeMessageBlock(block) {
  if (typeof block.text === "string") {
    block.text = sanitizeAndScrubContent(block.text);
  }
  if (block.type !== "tool_result") {
    return;
  }
  if (typeof block.content === "string") {
    block.content = truncateToolResultText(sanitizeAndScrubContent(block.content));
    return;
  }
  if (!Array.isArray(block.content)) {
    return;
  }
  block.content = block.content.map((item) => {
    if (isRecord2(item) && typeof item.text === "string") {
      return {
        ...item,
        text: truncateToolResultText(sanitizeAndScrubContent(item.text))
      };
    }
    return item;
  }).filter((item) => !isRecord2(item) || typeof item.text !== "string" || item.text.trim().length > 0);
}
function stripAssistantThinkingBlocks(messages) {
  for (const message of messages) {
    if (message.role !== "assistant" || !Array.isArray(message.content)) {
      continue;
    }
    message.content = message.content.filter((block) => block.type !== "thinking");
  }
}
function hasMeaningfulContent(content) {
  if (typeof content === "string") {
    return content.trim().length > 0;
  }
  if (!Array.isArray(content)) {
    return false;
  }
  return content.some((block) => {
    if (!isRecord2(block)) {
      return false;
    }
    if (block.type === "tool_use" || block.type === "tool_result") {
      return true;
    }
    if (typeof block.text === "string" && block.text.trim().length > 0) {
      return true;
    }
    if (typeof block.content === "string" && block.content.trim().length > 0) {
      return true;
    }
    return false;
  });
}
function trimTrailingEmptyTurns(messages) {
  while (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || hasMeaningfulContent(lastMessage.content)) {
      return;
    }
    messages.pop();
  }
}
function removeEmptyTurns(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message && hasMeaningfulContent(message.content)) {
      continue;
    }
    messages.splice(index, 1);
  }
}
function compactMessageContent(messages) {
  for (const message of messages) {
    if (!Array.isArray(message.content)) {
      continue;
    }
    message.content = message.content.filter((block) => {
      if (!isRecord2(block)) {
        return false;
      }
      if (block.type === "text") {
        return typeof block.text === "string" && block.text.trim().length > 0;
      }
      return true;
    });
  }
}
function stripUnsupportedSamplingFields(body) {
  delete body.temperature;
  delete body.top_p;
  delete body.top_k;
}
function stripThinkingControlFields(body) {
  delete body.thinking;
  delete body.context_management;
  delete body.output_config;
}
function normalizeSystemTexts(system) {
  if (typeof system === "string") {
    const next = sanitizeAndScrubText(system);
    return next ? [next] : [];
  }
  if (!Array.isArray(system)) {
    return [];
  }
  const texts = [];
  for (const entry of system) {
    if (typeof entry === "string") {
      const next = sanitizeAndScrubText(entry);
      if (next) {
        texts.push(next);
      }
      continue;
    }
    if (isRecord2(entry) && typeof entry.text === "string") {
      const next = sanitizeAndScrubText(entry.text);
      if (next) {
        texts.push(next);
      }
    }
  }
  return texts;
}
function extractFirstUserMessage(messages) {
  if (!Array.isArray(messages)) {
    return "";
  }
  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }
    if (typeof message.content === "string") {
      return message.content;
    }
    if (!Array.isArray(message.content)) {
      return "";
    }
    const text = message.content.filter((block) => typeof block.text === "string").map((block) => block.text).join("\n\n").trim();
    return text;
  }
  return "";
}

// src/request/tool-adapter.ts
function selectOpenCodeNativeTools(input) {
  if (input.incomingTools.length > 0) {
    return {
      reason: "incoming-tools",
      tools: enrichIncomingToolsWithTemplateSchemas(input.incomingTools, input.templateTools)
    };
  }
  if (!hasCompleteToolSchemas(input.templateTools)) {
    return {
      reason: "no-tools",
      tools: []
    };
  }
  return {
    reason: "template-tools",
    tools: input.templateTools.map((tool) => ({ ...tool }))
  };
}
function hasCompleteToolSchemas(tools) {
  return tools.length > 0 && tools.every((tool) => typeof tool === "object" && tool !== null && "input_schema" in tool);
}
function enrichIncomingToolsWithTemplateSchemas(incomingTools, templateTools) {
  if (!hasCompleteToolSchemas(templateTools) || incomingTools.length !== templateTools.length) {
    return incomingTools;
  }
  return incomingTools.map((tool, index) => {
    if ("input_schema" in tool) {
      return tool;
    }
    const templateTool = templateTools[index];
    return templateTool && "input_schema" in templateTool ? { ...tool, input_schema: templateTool.input_schema } : tool;
  });
}

// src/request/upstream-request.ts
var SESSION_IDLE_ROTATE_MS = 15 * 60 * 1e3;
var DEFAULT_CONTEXT_MANAGEMENT = {};
var DEFAULT_OUTPUT_EFFORT = "high";
var VALID_OUTPUT_EFFORT_VALUES = /* @__PURE__ */ new Set(["low", "medium", "high", "xhigh", "ultracode", "max", "client"]);
var OPENCODE_OUTPUT_EFFORT_HEADER = "x-kyoli-opencode-effort";
var upstreamRequestTestOverrides = {};
var sessionId = randomUUID3();
var sessionLastUsed = 0;
function now() {
  return upstreamRequestTestOverrides.now?.() ?? Date.now();
}
function createSessionId() {
  return upstreamRequestTestOverrides.createSessionId?.() ?? randomUUID3();
}
function getActiveSessionId() {
  const currentTime = now();
  if (sessionLastUsed === 0 || currentTime - sessionLastUsed > SESSION_IDLE_ROTATE_MS) {
    sessionId = createSessionId();
  }
  sessionLastUsed = currentTime;
  return sessionId;
}
function getUpstreamSessionId() {
  return getActiveSessionId();
}
function isRecord3(value) {
  return typeof value === "object" && value !== null;
}
function readString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : void 0;
}
function readOutputEffortValue(value) {
  const normalized = readString(value)?.toLowerCase();
  return normalized && VALID_OUTPUT_EFFORT_VALUES.has(normalized) ? normalized : void 0;
}
function readOpenCodeVariantEffort(value) {
  const normalized = readString(value)?.toLowerCase();
  if (normalized === "minimal") return "low";
  return readOutputEffortValue(normalized);
}
function normalizeEffortForWire(effort) {
  return effort === "ultracode" ? "xhigh" : effort;
}
function readPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function effortFromThinkingBudget(thinking) {
  const budgetTokens = readPositiveNumber(thinking?.budget_tokens) ?? readPositiveNumber(thinking?.budgetTokens);
  if (budgetTokens === void 0) return void 0;
  if (budgetTokens >= 31999) return "max";
  if (budgetTokens >= 16e3) return "high";
  if (budgetTokens >= 8e3) return "medium";
  return "low";
}
function getConfiguredOutputEffort() {
  return upstreamRequestTestOverrides.outputEffort ?? readOutputEffortValue(process.env.CLAUDE_MULTI_ACCOUNT_EFFORT) ?? readOutputEffortValue(process.env.ANTHROPIC_MULTI_ACCOUNT_EFFORT);
}
function getClientOutputEffort(inputBody) {
  const outputConfig = isRecord3(inputBody.output_config) ? inputBody.output_config : void 0;
  const reasoning = isRecord3(inputBody.reasoning) ? inputBody.reasoning : void 0;
  const thinking = isRecord3(inputBody.thinking) ? inputBody.thinking : void 0;
  return readOutputEffortValue(outputConfig?.effort) ?? readOutputEffortValue(inputBody.effort) ?? readOutputEffortValue(reasoning?.effort) ?? readOutputEffortValue(inputBody.reasoning_effort) ?? readOutputEffortValue(inputBody.reasoningEffort) ?? readOutputEffortValue(thinking?.effort) ?? effortFromThinkingBudget(thinking);
}
function resolveOutputEffort(inputBody, configuredEffort = getConfiguredOutputEffort(), modelId) {
  if (configuredEffort && configuredEffort !== "client") {
    return normalizeEffortForWire(configuredEffort);
  }
  const clientEffort = getClientOutputEffort(inputBody);
  return normalizeEffortForWire(clientEffort ?? DEFAULT_OUTPUT_EFFORT);
}
function isHaikuModel(modelId) {
  return resolveClaudeCodeModelAlias(modelId).toLowerCase().includes("haiku");
}
function collectToolUseIds(message) {
  if (!Array.isArray(message.content)) {
    return [];
  }
  return message.content.filter((block) => isRecord3(block) && block.type === "tool_use" && typeof block.id === "string").map((block) => String(block.id));
}
function collectToolResultIds(message) {
  if (!Array.isArray(message.content)) {
    return /* @__PURE__ */ new Set();
  }
  return new Set(
    message.content.filter((block) => isRecord3(block) && block.type === "tool_result" && typeof block.tool_use_id === "string").map((block) => String(block.tool_use_id))
  );
}
function getDanglingToolUseError(messages) {
  for (let index = 0; index < messages.length; index += 1) {
    const current = messages[index];
    if (!current || current.role !== "assistant") {
      continue;
    }
    const toolUseIds = collectToolUseIds(current);
    if (toolUseIds.length === 0) {
      continue;
    }
    const next = messages[index + 1];
    if (!next || next.role !== "user") {
      return `Dangling tool_use after assistant turn ${index}: ${toolUseIds.join(", ")}`;
    }
    const toolResultIds = collectToolResultIds(next);
    const missing = toolUseIds.filter((toolUseId) => !toolResultIds.has(toolUseId));
    if (missing.length > 0) {
      return `Missing tool_result for assistant turn ${index}: ${missing.join(", ")}`;
    }
  }
  return null;
}
var ADAPTIVE_THINKING_MODEL_MATCHERS = [
  (modelId) => /claude-sonnet-(?:[5-9]|\d{2,})(?:[-._]\d+)?(?:\[1m\])?$/.test(modelId),
  (modelId) => modelId.includes("claude-sonnet-4-6") || modelId.includes("claude-sonnet-4.6"),
  (modelId) => modelId.includes("claude-opus-4-6") || modelId.includes("claude-opus-4.6"),
  (modelId) => /claude-opus-4[-._]([7-9]|\d{2,})/.test(modelId),
  (modelId) => /claude-opus-(?:[5-9]|\d{2,})(?:[-._]\d+)?(?:\[1m\])?$/.test(modelId),
  (modelId) => /claude-fable-(?:[5-9]|\d{2,})(?:[-._]\d+)?(?:\[1m\])?$/.test(modelId)
];
var DEFAULT_MAX_OUTPUT_TOKENS = 32e3;
function supportsAdaptiveThinking(modelId) {
  const runtimeCapability = getRuntimeModelCapability(modelId);
  if (typeof runtimeCapability?.supportsThinking === "boolean") {
    return runtimeCapability.supportsThinking;
  }
  const normalized = resolveClaudeCodeModelAlias(modelId).toLowerCase();
  if (normalized.includes("haiku")) {
    return false;
  }
  return ADAPTIVE_THINKING_MODEL_MATCHERS.some((matches) => matches(normalized));
}
function resolveMaxTokens(requestedMaxTokens) {
  if (typeof requestedMaxTokens !== "number" || !Number.isFinite(requestedMaxTokens)) {
    return DEFAULT_MAX_OUTPUT_TOKENS;
  }
  const normalized = Math.floor(requestedMaxTokens);
  if (normalized <= 0) {
    return DEFAULT_MAX_OUTPUT_TOKENS;
  }
  return Math.min(normalized, DEFAULT_MAX_OUTPUT_TOKENS);
}
function filterInjectedSystemTexts(systemTexts, template, billingHeader) {
  const promptVariants = new Set(Object.values(getClaudeCodeSystemPromptVariants(template)));
  return systemTexts.filter((entry) => entry !== billingHeader && entry !== template.agent_identity && entry !== template.system_prompt && !promptVariants.has(entry) && !entry.startsWith("x-anthropic-billing-header:"));
}
function getCcVersion(template) {
  return template?.cc_version ?? claudeCodeIntegration.detectCliVersion();
}
function buildBillingHeader(firstUserMessage, template) {
  const version = getCcVersion(template);
  return composeClaudeCodeBillingSystemEntry(firstUserMessage, version);
}
function getReverseName(name, reverseLookup) {
  if (!reverseLookup) {
    return name;
  }
  if (reverseLookup instanceof Map) {
    return reverseLookup.get(name) ?? name;
  }
  return typeof reverseLookup[name] === "string" ? reverseLookup[name] : name;
}
function reverseMapToolUseNames(value, reverseLookup) {
  if (Array.isArray(value)) {
    return value.map((item) => reverseMapToolUseNames(item, reverseLookup));
  }
  if (!isRecord3(value)) {
    return value;
  }
  const cloned = {};
  for (const [key, nested] of Object.entries(value)) {
    cloned[key] = reverseMapToolUseNames(nested, reverseLookup);
  }
  if (cloned.type === "tool_use" && typeof cloned.name === "string") {
    cloned.name = getReverseName(cloned.name, reverseLookup);
  }
  return cloned;
}
function remapSseLine(line, reverseLookup) {
  if (!line.startsWith("data:")) {
    return line;
  }
  const payload = line.slice(5).trimStart();
  if (payload.length === 0 || payload === "[DONE]") {
    return line;
  }
  try {
    const parsed = JSON.parse(payload);
    return `data: ${JSON.stringify(reverseMapResponse(parsed, reverseLookup))}`;
  } catch {
    return line;
  }
}
function buildUpstreamRequest(inputBody, identity, template, options) {
  const cacheControl = resolveClaudeCodeCacheControl(inputBody);
  const { body, firstUserMessage, systemTexts } = normalizeAnthropicClientRequest(inputBody);
  const activeSessionId = options?.sessionId ?? getActiveSessionId();
  const configuredEffort = getConfiguredOutputEffort() ?? options?.outputEffort;
  const incomingTools = Array.isArray(body.tools) ? body.tools : [];
  const selectedTools = selectOpenCodeNativeTools({
    incomingTools,
    templateTools: template.tools
  });
  body.tools = selectedTools.tools;
  const modelId = typeof body.model === "string" ? resolveClaudeCodeModelAlias(body.model) : "";
  if (typeof body.model === "string") {
    body.model = toClaudeCodeWireModelId(body.model);
  }
  if (isClaudeFableModel(modelId) && incomingTools.length === 0 && selectedTools.tools.length > 0) {
    body.tool_choice = { type: "none" };
  }
  if (supportsAdaptiveThinking(modelId)) {
    body.thinking = { type: "adaptive", display: "omitted" };
    body.context_management = DEFAULT_CONTEXT_MANAGEMENT;
  }
  if (modelId && !isHaikuModel(modelId)) {
    body.output_config = { effort: resolveOutputEffort(inputBody, configuredEffort, modelId) };
  }
  body.max_tokens = resolveMaxTokens(body.max_tokens);
  return applyClaudeCodeUpstreamBodyFields(body, {
    agentIdentity: template.agent_identity,
    bodyFieldOrder: template.body_field_order,
    cacheControl,
    ccVersion: getCcVersion(template),
    firstUserMessage,
    identity: {
      accountUuid: identity.accountUuid,
      deviceId: identity.deviceId
    },
    sessionId: activeSessionId,
    systemPrompt: selectClaudeCodeSystemPrompt(template, modelId),
    systemTexts: filterInjectedSystemTexts(
      systemTexts,
      template,
      buildBillingHeader(firstUserMessage, template)
    )
  });
}
function reverseMapResponse(response, reverseLookup) {
  return reverseMapToolUseNames(response, reverseLookup);
}
function createStreamingReverseMapper(response, reverseLookup) {
  if (!response.body) {
    return response;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            if (buffer) {
              const lines2 = buffer.split("\n").map((line) => remapSseLine(line, reverseLookup));
              controller.enqueue(encoder.encode(lines2.join("\n")));
              buffer = "";
            }
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          if (lines.length > 0) {
            const remapped = `${lines.map((line) => remapSseLine(line, reverseLookup)).join("\n")}
`;
            controller.enqueue(encoder.encode(remapped));
            return;
          }
        }
      } catch (error) {
        try {
          await reader.cancel();
        } catch {
        }
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    }
  });
  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

// src/tools/flow.ts
import { createHash as createHash4 } from "crypto";
var TOOL_MASK_PREFIX = "tool_";
function isRecord4(value) {
  return typeof value === "object" && value !== null;
}
function shouldMaskToolName(name, claudeToolNames, options) {
  if (!name) {
    return false;
  }
  return !claudeToolNames.has(name) && !name.startsWith("mcp__") && (!options.preserveToolPrefix || !name.startsWith(TOOL_MASK_PREFIX));
}
function buildMaskedToolName(toolName, length = 8) {
  const digest = createHash4("sha256").update(`tool-mask:${toolName}`).digest("hex").slice(0, length);
  return `${TOOL_MASK_PREFIX}${digest}`;
}
function isOutgoingNameAvailable(name, registry) {
  return !registry.usedOutgoing.has(name) && !registry.reservedOriginals.has(name);
}
function buildAvailableMaskedToolName(toolName, registry) {
  for (let length = 8; length <= 64; length += 2) {
    const masked = buildMaskedToolName(toolName, length);
    if (isOutgoingNameAvailable(masked, registry)) {
      return masked;
    }
  }
  const fullDigestName = buildMaskedToolName(toolName, 64);
  for (let suffix = 1; suffix <= 1024; suffix += 1) {
    const masked = `${fullDigestName}_${suffix}`;
    if (isOutgoingNameAvailable(masked, registry)) {
      return masked;
    }
  }
  return `${fullDigestName}_${registry.usedOutgoing.size + registry.reservedOriginals.size}`;
}
function collectCurrentToolNames(parsed) {
  const names = /* @__PURE__ */ new Set();
  if (Array.isArray(parsed.tools)) {
    for (const tool of parsed.tools) {
      if (isRecord4(tool) && typeof tool.name === "string") {
        names.add(tool.name);
      }
    }
  }
  return [...names];
}
function collectReferencedToolNames(parsed) {
  const names = /* @__PURE__ */ new Set();
  if (Array.isArray(parsed.messages)) {
    for (const message of parsed.messages) {
      if (!isRecord4(message) || !Array.isArray(message.content)) {
        continue;
      }
      for (const block of message.content) {
        if (isRecord4(block) && block.type === "tool_use" && typeof block.name === "string") {
          names.add(block.name);
        }
      }
    }
  }
  if (isRecord4(parsed.tool_choice) && parsed.tool_choice.type === "tool" && typeof parsed.tool_choice.name === "string") {
    names.add(parsed.tool_choice.name);
  }
  return [...names];
}
function buildClaudeToolNameSet(claudeToolNames) {
  return /* @__PURE__ */ new Set([
    ...claudeToolNames.filter((name) => typeof name === "string" && name.length > 0),
    ...CLAUDE_CODE_CONFIG_SCOPED_TOOL_NAMES
  ]);
}
function buildToolFlowLookup(parsed, claudeToolNames) {
  const originalToOutgoing = /* @__PURE__ */ new Map();
  const outgoingToOriginal = /* @__PURE__ */ new Map();
  const registry = {
    usedOutgoing: /* @__PURE__ */ new Set(),
    reservedOriginals: new Set(collectCurrentToolNames(parsed))
  };
  const claudeToolSet = buildClaudeToolNameSet(claudeToolNames);
  const registerCurrent = (originalName) => {
    if (originalToOutgoing.has(originalName)) {
      return;
    }
    if (!shouldMaskToolName(originalName, claudeToolSet, { preserveToolPrefix: false })) {
      originalToOutgoing.set(originalName, originalName);
      outgoingToOriginal.set(originalName, originalName);
      registry.usedOutgoing.add(originalName);
      return;
    }
    const masked = buildAvailableMaskedToolName(originalName, registry);
    originalToOutgoing.set(originalName, masked);
    outgoingToOriginal.set(masked, originalName);
    registry.usedOutgoing.add(masked);
  };
  const registerReference = (originalName) => {
    if (originalToOutgoing.has(originalName) || outgoingToOriginal.has(originalName)) {
      return;
    }
    if (!shouldMaskToolName(originalName, claudeToolSet, { preserveToolPrefix: true })) {
      originalToOutgoing.set(originalName, originalName);
      outgoingToOriginal.set(originalName, originalName);
      registry.usedOutgoing.add(originalName);
      return;
    }
    const masked = buildAvailableMaskedToolName(originalName, registry);
    originalToOutgoing.set(originalName, masked);
    outgoingToOriginal.set(masked, originalName);
    registry.usedOutgoing.add(masked);
  };
  for (const originalName of collectCurrentToolNames(parsed)) {
    registerCurrent(originalName);
  }
  for (const originalName of collectReferencedToolNames(parsed)) {
    registerReference(originalName);
  }
  return { originalToOutgoing, outgoingToOriginal };
}
function getOutgoingName(name, lookup) {
  if (!name) {
    return name;
  }
  if (lookup.outgoingToOriginal.has(name)) {
    return name;
  }
  return lookup.originalToOutgoing.get(name) ?? name;
}
function rewriteToolUseNames(value, lookup) {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteToolUseNames(item, lookup));
  }
  if (!isRecord4(value)) {
    return value;
  }
  const cloned = {};
  for (const [key, nested] of Object.entries(value)) {
    cloned[key] = rewriteToolUseNames(nested, lookup);
  }
  if (cloned.type === "tool_use" && typeof cloned.name === "string") {
    cloned.name = getOutgoingName(cloned.name, lookup);
  }
  return cloned;
}
function applyOutboundToolFlow(parsed, claudeToolNames) {
  const lookup = buildToolFlowLookup(parsed, claudeToolNames);
  const next = { ...parsed };
  if (Array.isArray(parsed.tools)) {
    next.tools = parsed.tools.map((tool) => ({
      ...tool,
      name: getOutgoingName(tool.name, lookup)
    }));
  }
  if (Array.isArray(parsed.messages)) {
    next.messages = parsed.messages.map((message) => {
      if (!isRecord4(message) || !Array.isArray(message.content)) {
        return message;
      }
      return {
        ...message,
        content: rewriteToolUseNames(message.content, lookup)
      };
    });
  }
  if (isRecord4(parsed.tool_choice) && parsed.tool_choice.type === "tool") {
    next.tool_choice = {
      ...parsed.tool_choice,
      name: getOutgoingName(parsed.tool_choice.name, lookup)
    };
  }
  return {
    body: JSON.stringify(next),
    reverseLookup: lookup.outgoingToOriginal
  };
}

// src/request/headers.ts
var STAINLESS_PACKAGE_VERSION = "0.81.0";
var BILLABLE_BETA_PREFIXES = ["extended-cache-ttl-"];
function getStaticHeaders() {
  const profile = claudeCodeIntegration.loadRequestProfile();
  return createClaudeCodeStaticHeaders({
    headerValues: profile.template.header_values,
    packageVersion: STAINLESS_PACKAGE_VERSION,
    userAgent: profile.userAgent,
    xApp: profile.xApp
  });
}
function getPerRequestHeaders(sessionId2) {
  return createClaudeCodePerRequestHeaders({
    anthropicVersion: getAnthropicVersion(),
    sessionId: sessionId2
  });
}
function getAnthropicVersion() {
  return claudeCodeIntegration.loadRequestProfile().anthropicVersion;
}
function getBetaHeader() {
  return claudeCodeIntegration.loadRequestProfile().betaHeader;
}
function orderHeadersForOutbound(headers, overrideHeaderOrder) {
  const { template } = claudeCodeIntegration.loadRequestProfile();
  return orderClaudeCodeHeadersForOutbound(headers, overrideHeaderOrder ?? template.header_order);
}
function filterBillableBetas(betas) {
  return betas.split(",").map((beta) => beta.trim()).filter(
    (beta) => beta.length > 0 && !BILLABLE_BETA_PREFIXES.some((prefix) => beta.startsWith(prefix))
  ).join(",");
}

// src/request/transform.ts
function applyRequestToolMasking(parsed, claudeToolNames) {
  return applyOutboundToolFlow(parsed, claudeToolNames);
}
function extractModelIdFromBody(body) {
  if (typeof body !== "string") {
    return "unknown";
  }
  try {
    const parsed = JSON.parse(body);
    return typeof parsed.model === "string" ? resolveClaudeCodeModelAlias(parsed.model) : "unknown";
  } catch {
    return "unknown";
  }
}
function transformRequestUrl(input) {
  let url = null;
  try {
    if (typeof input === "string" || input instanceof URL) {
      url = new URL(input.toString());
    } else if (input instanceof Request) {
      url = new URL(input.url);
    }
  } catch {
    return input;
  }
  if (ANTHROPIC_OAUTH_ADAPTER.transform.enableMessagesBetaQuery && url && url.pathname === "/v1/messages" && !url.searchParams.has("beta")) {
    url.searchParams.set("beta", "true");
    return input instanceof Request ? new Request(url.toString(), input) : url;
  }
  return input;
}
function extractToolNamesFromRequestBody(body) {
  if (!body) {
    return [];
  }
  try {
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed.tools)) {
      return [];
    }
    return parsed.tools.map((tool) => typeof tool.name === "string" ? tool.name : null).filter((toolName) => Boolean(toolName));
  } catch {
    return [];
  }
}

// src/tools/observation.ts
import { promises as fs } from "fs";
import { dirname as dirname2, join as join3 } from "path";
var OBSERVED_TOOL_FILE = "anthropic-observed-tools.json";
var FILE_MODE = 384;
function getObservedToolPath() {
  return join3(getConfigDir(), OBSERVED_TOOL_FILE);
}
async function loadObservedToolInventory() {
  try {
    const content = await fs.readFile(getObservedToolPath(), "utf8");
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed && typeof parsed.observedTools === "object" ? parsed : { observedTools: {} };
  } catch {
    return { observedTools: {} };
  }
}
async function saveObservedToolInventory(inventory) {
  const targetPath = getObservedToolPath();
  await fs.mkdir(dirname2(targetPath), { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(inventory, null, 2)}
`, { mode: FILE_MODE });
  await fs.chmod(targetPath, FILE_MODE).catch(() => {
  });
}
async function recordObservedToolNames(toolNames) {
  if (toolNames.length === 0) {
    return;
  }
  const inventory = await loadObservedToolInventory();
  const now2 = (/* @__PURE__ */ new Date()).toISOString();
  for (const toolName of toolNames) {
    const entry = inventory.observedTools[toolName];
    if (!entry) {
      inventory.observedTools[toolName] = {
        count: 1,
        firstSeenAt: now2,
        lastSeenAt: now2
      };
      continue;
    }
    entry.count += 1;
    entry.lastSeenAt = now2;
  }
  await saveObservedToolInventory(inventory);
}

// src/shared/error-utils.ts
function sanitizeError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/sk-ant-[a-zA-Z0-9_-]+/g, "[REDACTED]").replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, "[REDACTED_JWT]").replace(/Bearer\s+[^\s,;]+/gi, "Bearer [REDACTED]");
}
function enrich429(body, headers) {
  try {
    const parsed = JSON.parse(body);
    const error = parsed.error;
    if (error && (error.message === "Error" || !error.message)) {
      const claim = headers.get("anthropic-ratelimit-unified-representative-claim") || "unknown";
      const status = headers.get("anthropic-ratelimit-unified-status") || "rejected";
      const util5h = headers.get("anthropic-ratelimit-unified-5h-utilization");
      const util7d = headers.get("anthropic-ratelimit-unified-7d-utilization");
      const reset = headers.get("anthropic-ratelimit-unified-reset");
      const parts = [`Rate limited (${status}). Limiting window: ${claim}`];
      if (util5h) {
        const parsedUtil5h = Number.parseFloat(util5h);
        if (Number.isFinite(parsedUtil5h)) {
          parts.push(`5h utilization: ${Math.round(parsedUtil5h * 100)}%`);
        }
      }
      if (util7d) {
        const parsedUtil7d = Number.parseFloat(util7d);
        if (Number.isFinite(parsedUtil7d)) {
          parts.push(`7d utilization: ${Math.round(parsedUtil7d * 100)}%`);
        }
      }
      if (reset) {
        const parsedReset = Number.parseInt(reset, 10);
        if (Number.isFinite(parsedReset)) {
          const resetDate = new Date(parsedReset * 1e3);
          const minutesUntilReset = Math.max(0, Math.round((resetDate.getTime() - Date.now()) / 6e4));
          parts.push(`resets in ${minutesUntilReset}m`);
        }
      }
      error.message = parts.join(". ");
    }
    return JSON.stringify(parsed);
  } catch {
    return body;
  }
}

// src/runtime/pacing.ts
function pickNonNegativeInt(...values) {
  for (const v4 of values) {
    if (v4 === void 0) continue;
    const n = typeof v4 === "number" ? v4 : Number.parseInt(v4, 10);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return void 0;
}
function computePacingDelay(now2, lastRequestTime, cfg, rng = Math.random) {
  if (lastRequestTime <= 0) return 0;
  const minGap = Math.max(0, cfg.minGapMs);
  const jitter = Math.max(0, cfg.jitterMs);
  const jitterAdd = jitter > 0 ? Math.floor(rng() * jitter) : 0;
  const effectiveGap = minGap + jitterAdd;
  const elapsed = now2 - lastRequestTime;
  if (elapsed >= effectiveGap) return 0;
  return effectiveGap - elapsed;
}
function resolvePacingConfig(explicit = {}, env = process.env) {
  const minGap = pickNonNegativeInt(explicit.minGapMs, env.ANTHROPIC_PACE_MIN_MS, env.MIN_REQUEST_INTERVAL_MS) ?? 500;
  const jitter = pickNonNegativeInt(explicit.jitterMs, env.ANTHROPIC_PACE_JITTER_MS) ?? 0;
  return { minGapMs: minGap, jitterMs: jitter };
}

// src/runtime/factory.ts
var TOKEN_REFRESH_PERMANENT_FAILURE_STATUS = 401;
var ASSISTANT_PREFILL_UNSUPPORTED_MESSAGE = "This model does not support assistant message prefill";
var NON_SUBSCRIPTION_BILLING_BACKOFF_MS = 24 * 60 * 60 * 1e3;
function mergeHeaders(target, headers) {
  if (!headers) {
    return;
  }
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      target[key.toLowerCase()] = value;
    });
    return;
  }
  if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      target[String(key).toLowerCase()] = String(value);
    }
    return;
  }
  for (const [key, value] of Object.entries(headers)) {
    if (value !== void 0) {
      target[key.toLowerCase()] = String(value);
    }
  }
}
function extractIncomingHeaders(input, init) {
  const headers = {};
  if (input instanceof Request) {
    mergeHeaders(headers, input.headers);
  }
  mergeHeaders(headers, init?.headers);
  return headers;
}
function isRecord5(value) {
  return typeof value === "object" && value !== null;
}
function readHeaderOutputEffort(headers) {
  return readOpenCodeVariantEffort(headers[OPENCODE_OUTPUT_EFFORT_HEADER]);
}
function messageHasToolUse(message) {
  return Array.isArray(message.content) && message.content.some((block) => isRecord5(block) && block.type === "tool_use");
}
function removeTrailingAssistantPrefillBody(body) {
  if (typeof body !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(body);
    if (!isRecord5(parsed) || !Array.isArray(parsed.messages)) {
      return null;
    }
    const messages = parsed.messages;
    const originalLength = messages.length;
    while (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.role !== "assistant" || messageHasToolUse(lastMessage)) {
        break;
      }
      messages.pop();
    }
    return messages.length === originalLength ? null : JSON.stringify(parsed);
  } catch {
    return null;
  }
}
async function isAssistantPrefillUnsupportedResponse(response) {
  if (response.status !== 400) {
    return false;
  }
  return (await response.clone().text()).includes(ASSISTANT_PREFILL_UNSUPPORTED_MESSAGE);
}
function splitBetaValues(value) {
  if (!value) {
    return [];
  }
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}
function deduplicateBetas(values) {
  return [...new Set(values.filter(Boolean))];
}
function excludeBetas(values, excludedBetas2) {
  if (excludedBetas2.size === 0) {
    return values;
  }
  return values.filter((beta) => !excludedBetas2.has(beta));
}
function transformBodyToUpstream(body, identity, sessionId2, outputEffort) {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { body, reverseLookup: /* @__PURE__ */ new Map(), validationError: null };
    }
    const template = claudeCodeIntegration.loadTemplate();
    const upstreamRequest = buildUpstreamRequest(
      parsed,
      identity,
      template,
      { sessionId: sessionId2, outputEffort }
    );
    const validationError = getDanglingToolUseError(
      Array.isArray(upstreamRequest.messages) ? upstreamRequest.messages : []
    );
    const maskedRequest = applyRequestToolMasking(upstreamRequest, template.tool_names);
    return {
      ...maskedRequest,
      validationError
    };
  } catch {
    return { body, reverseLookup: /* @__PURE__ */ new Map(), validationError: null };
  }
}
function resolveAccountIdentity(storedAccount, fallback) {
  return {
    deviceId: storedAccount.deviceId || fallback.deviceId,
    accountUuid: storedAccount.accountUuid || storedAccount.accountId || fallback.accountUuid || storedAccount.uuid || ""
  };
}
async function applyResponseReverseLookup(response, reverseLookup) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream")) {
    return createStreamingReverseMapper(response, reverseLookup);
  }
  if (!contentType.includes("application/json") || reverseLookup.size === 0) {
    return response;
  }
  try {
    const payload = await response.clone().json();
    const remapped = reverseMapResponse(payload, reverseLookup);
    return new Response(JSON.stringify(remapped), {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });
  } catch {
    return response;
  }
}
async function enrichRateLimitResponse(response) {
  if (response.status !== 429) {
    return response;
  }
  const body = await response.clone().text();
  const enrichedBody = enrich429(body, response.headers);
  if (enrichedBody === body) {
    return response;
  }
  return new Response(enrichedBody, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers)
  });
}
function isNonSubscriptionBillingClaim(claim) {
  if (!claim || claim === "unknown") return false;
  const normalized = claim.toLowerCase();
  return normalized === "api" || normalized.startsWith("api_") || normalized === "overage" || normalized.startsWith("overage_") || normalized.includes("credit") || normalized.startsWith("sdk");
}
async function blockNonSubscriptionBillingClaim(response) {
  const claim = response.headers.get("anthropic-ratelimit-unified-representative-claim");
  if (!isNonSubscriptionBillingClaim(claim)) {
    return response;
  }
  await response.body?.cancel().catch(() => void 0);
  const headers = new Headers(response.headers);
  headers.set("content-type", "application/json");
  headers.set("retry-after-ms", String(NON_SUBSCRIPTION_BILLING_BACKOFF_MS));
  headers.set("x-kyoli-non-subscription-billing-claim", claim);
  return new Response(
    JSON.stringify({
      error: {
        type: "non_subscription_billing_claim",
        message: `Claude Code response used non-subscription billing claim '${claim}'. Kyoli blocked this account to avoid API/credit billing bleed.`
      }
    }),
    {
      status: 429,
      headers
    }
  );
}
var AccountRuntimeFactory = class {
  constructor(store, client, identity = claudeCodeIntegration.loadIdentity()) {
    this.store = store;
    this.client = client;
    this.identity = identity;
  }
  store;
  client;
  identity;
  runtimes = /* @__PURE__ */ new Map();
  initLocks = /* @__PURE__ */ new Map();
  effortSupportByModel = /* @__PURE__ */ new Map();
  lastRequestTime = 0;
  pacingGate = Promise.resolve();
  pacingTestOverrides = {};
  tokenRefreshLocks = /* @__PURE__ */ new Map();
  setPacingTestOverrides(overrides) {
    this.pacingTestOverrides = overrides;
  }
  resetPacingForTest() {
    this.lastRequestTime = 0;
    this.pacingGate = Promise.resolve();
    this.pacingTestOverrides = {};
  }
  async getRuntime(uuid) {
    const cached = this.runtimes.get(uuid);
    if (cached) return cached;
    const existing = this.initLocks.get(uuid);
    if (existing) return existing;
    const initPromise = this.createRuntime(uuid);
    this.initLocks.set(uuid, initPromise);
    try {
      const runtime = await initPromise;
      this.runtimes.set(uuid, runtime);
      return runtime;
    } finally {
      this.initLocks.delete(uuid);
    }
  }
  invalidate(uuid) {
    this.runtimes.delete(uuid);
  }
  invalidateAll() {
    this.runtimes.clear();
  }
  async ensureFreshToken(storedAccount, uuid) {
    const existingRefresh = this.tokenRefreshLocks.get(uuid);
    if (existingRefresh) return existingRefresh;
    const refreshPromise = this.refreshAndPersistToken(storedAccount, uuid);
    this.tokenRefreshLocks.set(uuid, refreshPromise);
    try {
      return await refreshPromise;
    } finally {
      this.tokenRefreshLocks.delete(uuid);
    }
  }
  async refreshAndPersistToken(storedAccount, uuid) {
    const latestStorage = await this.store.load();
    const latestAccount = latestStorage.accounts.find((account) => account.uuid === uuid);
    const accountToRefresh = latestAccount ?? storedAccount;
    const latestAccessToken = accountToRefresh.accessToken;
    if (latestAccessToken && accountToRefresh.expiresAt && !isTokenExpired({ accessToken: latestAccessToken, expiresAt: accountToRefresh.expiresAt })) {
      return { accessToken: latestAccessToken, expiresAt: accountToRefresh.expiresAt };
    }
    const { result, account: refreshedAccount } = await this.store.refreshAccountCredentials(
      uuid,
      accountToRefresh,
      (refreshTokenValue) => refreshToken(refreshTokenValue, uuid, this.client)
    );
    if (!result.ok) {
      throw new TokenRefreshError(
        result.permanent,
        result.permanent ? TOKEN_REFRESH_PERMANENT_FAILURE_STATUS : void 0
      );
    }
    if (!refreshedAccount?.accessToken || !refreshedAccount.expiresAt) {
      throw new TokenRefreshError(false);
    }
    this.client.auth.set({
      path: { id: ANTHROPIC_OAUTH_ADAPTER.authProviderId },
      body: {
        type: "oauth",
        refresh: refreshedAccount.refreshToken,
        access: refreshedAccount.accessToken,
        expires: refreshedAccount.expiresAt
      }
    }).catch(() => {
    });
    return { accessToken: refreshedAccount.accessToken, expiresAt: refreshedAccount.expiresAt };
  }
  buildOutboundHeaders(incomingHeaders, sessionId2, accessToken, modelId, excludedBetas2) {
    const mergedBetas = deduplicateBetas(ensureOauthBeta([
      ...getModelBetas(modelId, excludedBetas2),
      ...excludeBetas(splitBetaValues(incomingHeaders["anthropic-beta"]), excludedBetas2)
    ])).join(",");
    const outbound = {
      ...incomingHeaders,
      ...getStaticHeaders(),
      ...getPerRequestHeaders(sessionId2),
      "authorization": `Bearer ${accessToken}`,
      "anthropic-beta": filterBillableBetas(mergedBetas)
    };
    delete outbound["x-api-key"];
    return orderHeadersForOutbound(outbound);
  }
  async executeTransformedFetch(input, init, accessToken, identity) {
    const transformedInput = transformRequestUrl(input);
    const modelId = extractModelIdFromBody(init?.body);
    const excludedBetas2 = getExcludedBetas(modelId);
    const incomingHeaders = extractIncomingHeaders(transformedInput, init);
    const sessionId2 = incomingHeaders["x-claude-code-session-id"] ?? getUpstreamSessionId();
    const outputEffort = readHeaderOutputEffort(incomingHeaders);
    delete incomingHeaders[OPENCODE_OUTPUT_EFFORT_HEADER];
    const headers = this.buildOutboundHeaders(
      incomingHeaders,
      sessionId2,
      accessToken,
      modelId,
      excludedBetas2
    );
    if (typeof init?.body === "string") {
      void recordObservedToolNames(extractToolNamesFromRequestBody(init.body)).catch(() => {
      });
    }
    const transformedRequest = typeof init?.body === "string" ? transformBodyToUpstream(init.body, identity, sessionId2, outputEffort) : { body: init?.body, reverseLookup: /* @__PURE__ */ new Map(), validationError: null };
    if (transformedRequest.validationError) {
      return new Response(JSON.stringify({
        error: {
          message: transformedRequest.validationError,
          type: "invalid_request_error"
        }
      }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const pacingCfg = resolvePacingConfig();
    const getNow = this.pacingTestOverrides.now ?? Date.now;
    const sleepFn = this.pacingTestOverrides.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    const reservePacingSlot = async () => {
      let releaseGate;
      const previousGate = this.pacingGate;
      this.pacingGate = new Promise((resolve) => {
        releaseGate = resolve;
      });
      await previousGate;
      try {
        const delay = computePacingDelay(getNow(), this.lastRequestTime, pacingCfg);
        if (delay > 0) {
          await sleepFn(delay);
        }
        this.lastRequestTime = getNow();
      } finally {
        releaseGate?.();
      }
    };
    const performFetch = async (requestHeaders, requestBody) => {
      await reservePacingSlot();
      const stampedBody = typeof requestBody === "string" ? stampClaudeCodeCch(requestBody) : requestBody;
      try {
        const response2 = await fetch(transformedInput, {
          ...init,
          headers: requestHeaders,
          body: stampedBody
        });
        return await enrichRateLimitResponse(await blockNonSubscriptionBillingClaim(response2));
      } catch (error) {
        debugLog(this.client, "Anthropic upstream fetch failed", {
          error: sanitizeError(error)
        });
        throw error;
      }
    };
    let outboundBody = clampUnsupportedEffortInBody(
      transformedRequest.body,
      this.effortSupportByModel
    ).body;
    const retryEffortCapability = async (currentResponse, requestHeaders) => {
      if (currentResponse.status !== 400) {
        return currentResponse;
      }
      const responseBody = await currentResponse.clone().text().catch(() => "");
      const rejection = parseEffortCapabilityRejection(responseBody);
      if (!rejection) {
        return currentResponse;
      }
      const clamped = clampEffortAfterRejection(
        outboundBody,
        rejection,
        this.effortSupportByModel
      );
      if (!clamped.changed) {
        return currentResponse;
      }
      outboundBody = clamped.body;
      return performFetch(requestHeaders, outboundBody);
    };
    let response = await performFetch(headers, outboundBody);
    response = await retryEffortCapability(response, headers);
    if (await isAssistantPrefillUnsupportedResponse(response)) {
      const retryBody = removeTrailingAssistantPrefillBody(outboundBody);
      if (retryBody) {
        outboundBody = retryBody;
        response = await performFetch(headers, outboundBody);
        response = await retryEffortCapability(response, headers);
      }
    }
    for (let attempt = 0; attempt < LONG_CONTEXT_BETAS.length; attempt += 1) {
      if (response.status !== 400 && response.status !== 429) {
        break;
      }
      const responseBody = await response.clone().text();
      if (!isLongContextError(responseBody) && !isUnexpectedBetaError(responseBody)) {
        break;
      }
      if (isUnexpectedBetaError(responseBody)) {
        const rejectedBetas = extractRejectedBetas(responseBody);
        if (rejectedBetas.length === 0) {
          break;
        }
        for (const rejectedBeta of rejectedBetas) {
          addExcludedBeta(modelId, rejectedBeta);
        }
      } else {
        const betasToExclude = LONG_CONTEXT_BETAS.filter((beta) => !getExcludedBetas(modelId).has(beta));
        if (betasToExclude.length === 0) {
          break;
        }
        for (const beta of betasToExclude) {
          addExcludedBeta(modelId, beta);
        }
      }
      const retryHeaders = this.buildOutboundHeaders(
        incomingHeaders,
        sessionId2,
        accessToken,
        modelId,
        getExcludedBetas(modelId)
      );
      response = await performFetch(retryHeaders, outboundBody);
      response = await retryEffortCapability(response, retryHeaders);
    }
    return applyResponseReverseLookup(response, transformedRequest.reverseLookup);
  }
  async createRuntime(uuid) {
    const fetchWithAccount = async (input, init) => {
      const storage = await this.store.load();
      const storedAccount = storage.accounts.find((account) => account.uuid === uuid);
      if (!storedAccount) {
        throw new Error(`No credentials found for account ${uuid}`);
      }
      let accessToken = storedAccount.accessToken;
      if (!accessToken || !storedAccount.expiresAt || isTokenExpired({ accessToken, expiresAt: storedAccount.expiresAt })) {
        ({ accessToken } = await this.ensureFreshToken(storedAccount, uuid));
      }
      if (!accessToken) {
        throw new Error(`No access token available for account ${uuid}`);
      }
      return this.executeTransformedFetch(
        input,
        init,
        accessToken,
        resolveAccountIdentity(storedAccount, this.identity)
      );
    };
    debugLog(this.client, `Runtime created for account ${uuid.slice(0, 8)}`);
    return { fetch: fetchWithAccount };
  }
};

// src/oauth/bootstrap.ts
import {
  __openCodeNativeBootstrapAuthTestUtils,
  syncOpenCodeNativeBootstrapAuth
} from "opencode-multi-account-core";
function syncBootstrapAuth(client, store) {
  return syncOpenCodeNativeBootstrapAuth({
    client,
    store,
    providerId: ANTHROPIC_OAUTH_ADAPTER.authProviderId
  });
}

// src/session-heartbeat.ts
var DEFAULT_HEARTBEAT_INTERVAL_MS = 3e4;
var CLIENT_PLATFORM = "cli";
var testOverrides = {};
function presenceUrl(sessionId2) {
  return `${claudeCodeIntegration.loadRequestProfile().baseApiUrl}/v1/code/sessions/${sessionId2}/client/presence`;
}
function fetchFn() {
  return testOverrides.fetch ?? globalThis.fetch;
}
function startHeartbeat(options) {
  testOverrides.onStart?.(options);
  const {
    sessionId: sessionId2,
    deviceId,
    accessToken,
    intervalMs = DEFAULT_HEARTBEAT_INTERVAL_MS
  } = options;
  let activeController = null;
  let stopped = false;
  const sendPresence = async () => {
    if (stopped) return;
    const controller = new AbortController();
    activeController = controller;
    try {
      await fetchFn()(presenceUrl(sessionId2), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "anthropic-version": getAnthropicVersion(),
          "anthropic-client-platform": CLIENT_PLATFORM,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: deviceId,
          connected_at: (/* @__PURE__ */ new Date()).toISOString()
        }),
        signal: controller.signal
      });
    } catch {
    } finally {
      if (activeController === controller) {
        activeController = null;
      }
    }
  };
  const timer = setInterval(sendPresence, intervalMs);
  if (typeof timer === "object" && "unref" in timer && typeof timer.unref === "function") {
    timer.unref();
  }
  return {
    stop() {
      if (stopped) return;
      stopped = true;
      clearInterval(timer);
      activeController?.abort();
      activeController = null;
    }
  };
}
function getSessionId() {
  return getUpstreamSessionId();
}

// src/v241/integration-registration.ts
var INTEGRATION_ID = "anthropic";
var METHOD_ID = "claude-multi-auth";
var METHOD_LABEL = "Claude Multi-Auth";
async function registerIntegrationMethod(ctx, deps) {
  await ctx.integration.transform((editor) => {
    const registration = {
      integrationID: INTEGRATION_ID,
      method: { id: METHOD_ID, type: "oauth", label: METHOD_LABEL },
      authorize: (answer) => deps.authorize(answer),
      refresh: (credential) => deps.refresh(credential)
    };
    editor.method.update(registration);
  });
}

// src/v241/authorize.ts
var CODE_MODE_REDIRECT_URI = "https://console.anthropic.com/oauth/code/callback";
function splitPastedCode(raw, expectedState) {
  const value = raw.trim();
  const hashIndex = value.indexOf("#");
  if (hashIndex === -1) {
    return { code: value, state: expectedState };
  }
  const code = value.slice(0, hashIndex);
  const state = value.slice(hashIndex + 1);
  if (state && state !== expectedState) {
    throw new Error(`OAuth state mismatch: expected the pasted code in code#state form for state ${expectedState}`);
  }
  return { code, state: state || expectedState };
}
function createAuthorize(deps = {}) {
  const loadOAuthConfig = deps.loadOAuthConfig ?? (async () => await detectOAuthConfig2());
  const exchangeCode = deps.exchangeCode ?? exchangeCodeForTokens;
  const client = deps.client ?? createMinimalClient();
  return async function authorize() {
    const config2 = await loadOAuthConfig();
    const { verifier, challenge } = generatePKCE();
    const state = generateState();
    const url = buildAuthorizeUrl({
      authorizeUrl: config2.authorizeUrl,
      clientId: config2.clientId,
      scopes: config2.scopes,
      redirectUri: CODE_MODE_REDIRECT_URI,
      codeChallenge: challenge,
      state
    });
    return {
      url,
      instructions: "Open the URL in a browser, sign in to the account to add, approve access, and paste the authorization code shown after approval (code#state).",
      mode: "code",
      callback: async (rawCode) => {
        const { code, state: pastedState } = splitPastedCode(rawCode, state);
        const tokens = await exchangeCode({
          code,
          codeVerifier: verifier,
          state: pastedState,
          redirectUri: CODE_MODE_REDIRECT_URI
        });
        const credential = {
          type: "oauth",
          // Required by the v2.4.1 Credential.OAuth schema; the host's auto-refresh
          // lookup keys on this value (core/src/integration.ts).
          methodID: METHOD_ID,
          access: tokens.access_token,
          refresh: tokens.refresh_token ?? "",
          // The fork stores epoch ms: now + expires_in (seconds) * 1000 (src/oauth/anthropic-oauth.ts loginWithOAuth).
          expires: Date.now() + tokens.expires_in * 1e3
        };
        if (credential.refresh) {
          const metadata = {
            accountId: tokens.account?.uuid,
            accountUuid: tokens.account?.uuid
          };
          const emptyAuth = {
            type: "oauth",
            methodID: METHOD_ID,
            refresh: "",
            access: "",
            expires: 0
          };
          const store = new AccountStore();
          const manager = await AccountManager.create(store, emptyAuth, client);
          await manager.addAccount(credential, tokens.account?.email_address, metadata);
        } else {
          await client.app.log({
            body: {
              service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
              level: "warn",
              message: "Token exchange returned no refresh_token; the account was NOT added to the pool and cannot be rotated. Re-run the login with an approved client.",
              extra: { accountId: tokens.account?.uuid ?? "unmapped" }
            }
          }).catch(() => {
          });
        }
        return credential;
      }
    };
  };
}
function createRefresh(deps = {}) {
  const refreshTokenFn = deps.refreshTokenFn ?? refreshToken;
  const client = deps.client ?? createMinimalClient();
  return async function refresh(credential) {
    const store = new AccountStore();
    const storage = await store.load();
    const existing = storage.accounts.find((account) => account.refreshToken === credential.refresh);
    const accountId = existing?.uuid ?? "unmapped";
    const result = await refreshTokenFn(credential.refresh, accountId, client);
    if (!result.ok) {
      throw new Error(
        `Token refresh failed (status=${result.status ?? "unknown"}; class=${result.permanent ? "permanent" : "transient"}): ${result.message ?? "no detail"}`
      );
    }
    const patch = result.patch;
    if (existing?.uuid) {
      await store.mutateAccount(existing.uuid, (account) => {
        account.accessToken = patch.accessToken;
        account.expiresAt = patch.expiresAt;
        if (patch.refreshToken) {
          account.refreshToken = patch.refreshToken;
        }
        account.consecutiveAuthFailures = 0;
      });
    }
    return {
      type: "oauth",
      methodID: METHOD_ID,
      access: patch.accessToken,
      refresh: patch.refreshToken ?? credential.refresh,
      expires: patch.expiresAt
    };
  };
}

// src/v241/request-seam.ts
function deleteHeaderCaseInsensitive(headers, name) {
  for (const existing of Object.keys(headers)) {
    if (existing.toLowerCase() === name.toLowerCase()) {
      delete headers[existing];
    }
  }
}
function overrideHeadersCaseInsensitive(headers, additions) {
  for (const [key, value] of Object.entries(additions)) {
    deleteHeaderCaseInsensitive(headers, key);
    headers[key] = value;
  }
}
function defaultForkHeaders() {
  const sessionId2 = getUpstreamSessionId();
  return {
    ...getStaticHeaders(),
    ...getPerRequestHeaders(sessionId2),
    "anthropic-beta": getBetaHeader()
  };
}
function createModelRequestHandler(deps) {
  return async (event) => {
    const token = await deps.getActiveAccessToken();
    if (!token) return;
    deleteHeaderCaseInsensitive(event.headers, "authorization");
    event.headers.authorization = `Bearer ${token}`;
    deleteHeaderCaseInsensitive(event.headers, "x-api-key");
    overrideHeadersCaseInsensitive(event.headers, deps.buildHeaders?.() ?? defaultForkHeaders());
  };
}
function createHttpResponseHandler(deps) {
  return async (event) => {
    const status = event.response.status;
    if (status !== 401 && status !== 429) return;
    await deps.rotateOnFailure?.(status);
  };
}
function registerRequestSeam(ctx, deps) {
  const options = { providerID: "anthropic" };
  return Promise.all([
    ctx.session.hook("model.request", createModelRequestHandler(deps), options),
    ctx.session.hook("http.response", createHttpResponseHandler(deps), options)
  ]).then(() => void 0);
}
function createPoolAccessors(deps = {}) {
  const client = deps.client ?? createMinimalClient();
  let managerPromise = null;
  function loadManager() {
    managerPromise ??= (async () => {
      const emptyAuth = { type: "oauth", refresh: "", access: "", expires: 0 };
      return AccountManager.create(new AccountStore(), emptyAuth, client);
    })();
    return managerPromise;
  }
  return {
    getActiveAccessToken: async () => {
      const manager = await loadManager();
      await manager.refresh();
      const active = manager.getActiveAccount();
      if (!active || active.isAuthDisabled) return null;
      return active.accessToken ?? null;
    },
    rotateOnFailure: async (status) => {
      const manager = await loadManager();
      await manager.refresh();
      const active = manager.getActiveAccount();
      if (!active?.uuid) return;
      if (status === 401) {
        await manager.markAuthFailure(active.uuid, { ok: false, permanent: false });
        await manager.markRateLimited(active.uuid);
      } else if (status === 429) {
        await manager.markRateLimited(active.uuid);
      } else {
        return;
      }
      await manager.selectAccount();
    }
  };
}

// src/v241/seed.ts
import { migrateFromAuthJson } from "opencode-multi-account-core";
function seedPoolFromStoredCredential(store) {
  return migrateFromAuthJson(ANTHROPIC_OAUTH_ADAPTER.authProviderId, store);
}

// src/v241/coexistence.ts
function createCoexistenceCheck(deps) {
  return async () => {
    let integrations;
    try {
      integrations = await deps.listIntegrations();
    } catch {
      return;
    }
    const anthropic = integrations.find((integration) => integration.id === "anthropic");
    const hasKeyConnection = (anthropic?.connections ?? []).some(
      (connection) => connection.method === "key"
    );
    if (!hasKeyConnection) return;
    await deps.log({
      level: "warn",
      message: "An API-key credential exists on the anthropic integration alongside the multi-account pool. Remove the key credential so the pool serves the lane: a key path invites paid billing instead of the subscription. (opencode auth logout anthropic, or delete the key connection.)",
      extra: { integrationID: "anthropic", condition: "api-key coexistence" }
    });
  };
}
function defaultListIntegrations(ctx) {
  return async () => {
    const domain = ctx.integration;
    const raw = await domain.list?.();
    const items = Array.isArray(raw) ? raw : [];
    return items.map((item) => {
      const record = item;
      const connections = Array.isArray(record.connections) ? record.connections : void 0;
      return { id: record.id ?? "", connections };
    });
  };
}
function clientLog(client) {
  return async (entry) => {
    await client.app.log({
      body: {
        service: "claude-multiauth",
        level: entry.level,
        message: entry.message,
        extra: entry.extra
      }
    }).catch(() => {
    });
  };
}

// src/v241/definition.ts
if (process.env.CLAUDE_MULTI_ACCOUNT_TRACE_PLUGIN === "1") {
  console.error("[anthropic-multi-account] v241 module loaded");
}
var v241Definition = {
  id: "anthropic-multi-account",
  setup: async (ctx) => {
    await registerIntegrationMethod(ctx, {
      authorize: createAuthorize(),
      refresh: createRefresh()
    });
    await registerRequestSeam(ctx, createPoolAccessors());
    await seedPoolFromStoredCredential(new AccountStore());
    await createCoexistenceCheck({
      listIntegrations: defaultListIntegrations(ctx),
      log: clientLog(createMinimalClient())
    })();
  }
};

// src/index.ts
if (process.env.CLAUDE_MULTI_ACCOUNT_TRACE_PLUGIN === "1") {
  console.error("[anthropic-multi-account] module loaded");
}
function extractFirstUserText(input) {
  try {
    const raw = input;
    const messages = raw.messages ?? raw.request?.messages;
    if (!Array.isArray(messages)) return "";
    for (const msg of messages) {
      if (msg.role !== "user") continue;
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === "text" && block.text) return block.text;
        }
      }
    }
  } catch {
  }
  return "";
}
function composeBillingSystemEntry(firstUserMessage, version) {
  return composeClaudeCodeBillingSystemEntry(firstUserMessage, version);
}
function prependMissingSystemEntries(output, entries) {
  output.system ??= [];
  for (const entry of entries.toReversed()) {
    if (entry && !output.system.includes(entry)) {
      output.system.unshift(entry);
    }
  }
}
function applyOrderedHeaders(output, headers) {
  const orderedHeaders = orderHeadersForOutbound(headers);
  output.headers = Array.isArray(orderedHeaders) ? Object.fromEntries(orderedHeaders) : orderedHeaders;
}
function getMessageVariant(input) {
  return input.message?.model?.variant;
}
function isAnthropicChatHook(input) {
  return input.provider?.info?.id === ANTHROPIC_OAUTH_ADAPTER.authProviderId || input.model?.providerID === ANTHROPIC_OAUTH_ADAPTER.authProviderId;
}
var ClaudeMultiAuthPlugin = async (ctx) => {
  if (process.env.CLAUDE_MULTI_ACCOUNT_TRACE_PLUGIN === "1") {
    console.error("[anthropic-multi-account] plugin function called");
  }
  const { client } = ctx;
  await loadConfig();
  const requestProfile = claudeCodeIntegration.loadRequestProfile();
  const template = requestProfile.template;
  const claudeIdentity = claudeCodeIntegration.loadIdentity();
  const claudeCodeVersion = template.cc_version ?? requestProfile.cliVersion;
  const upstreamAgentIdentity = template.agent_identity;
  const upstreamSystemPrompt = template.system_prompt;
  let heartbeatHandle = null;
  let heartbeatToken = null;
  let heartbeatSessionId = null;
  const outputEffortBySession = /* @__PURE__ */ new Map();
  const stopHeartbeat = () => {
    heartbeatHandle?.stop();
    heartbeatHandle = null;
    heartbeatToken = null;
    heartbeatSessionId = null;
  };
  const getHeartbeatDeviceId = (account) => account?.deviceId || claudeIdentity.deviceId;
  const ensureHeartbeat = (accessToken, account) => {
    const deviceId = getHeartbeatDeviceId(account);
    if (!accessToken || !deviceId) {
      stopHeartbeat();
      return;
    }
    const sessionId2 = getSessionId();
    if (heartbeatHandle && heartbeatToken === accessToken && heartbeatSessionId === sessionId2) {
      return;
    }
    stopHeartbeat();
    heartbeatToken = accessToken;
    heartbeatSessionId = sessionId2;
    heartbeatHandle = startHeartbeat({
      sessionId: sessionId2,
      deviceId,
      accessToken
    });
  };
  const startupDrift = claudeCodeIntegration.detectDrift(template);
  if (startupDrift.drifted) {
    client.app.log({
      body: {
        service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
        level: "warn",
        message: startupDrift.message,
        extra: {
          cachedVersion: startupDrift.cachedVersion,
          installedVersion: startupDrift.installedVersion
        }
      }
    }).catch(() => {
    });
  }
  const compat = claudeCodeIntegration.checkCompat();
  if (compat.status !== "ok" && compat.status !== "unknown") {
    client.app.log({
      body: {
        service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
        level: "warn",
        message: compat.message,
        extra: {
          installedVersion: compat.installedVersion,
          range: compat.range
        }
      }
    }).catch(() => {
    });
  }
  void claudeCodeIntegration.refreshLiveFingerprint({ silent: true }).then((refreshedTemplate) => {
    const refreshedDrift = claudeCodeIntegration.detectDrift(refreshedTemplate ?? template);
    if (!refreshedDrift.drifted) {
      return;
    }
    return client.app.log({
      body: {
        service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
        level: "warn",
        message: refreshedDrift.message,
        extra: {
          cachedVersion: refreshedDrift.cachedVersion,
          installedVersion: refreshedDrift.installedVersion
        }
      }
    }).catch(() => {
    });
  }).catch((error) => {
    client.app.log({
      body: {
        service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
        level: "debug",
        message: "live fingerprint refresh failed",
        extra: {
          error: sanitizeError(error)
        }
      }
    }).catch(() => {
    });
  });
  const store = new AccountStore();
  const syncBootstrapAuthForPhase = async (phase) => {
    try {
      const synced = await syncBootstrapAuth(client, store);
      debugLog(client, "Bootstrap auth sync completed", { phase, synced });
      return synced;
    } catch (error) {
      client.app.log({
        body: {
          service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
          level: "debug",
          message: "bootstrap auth sync failed",
          extra: {
            phase,
            error: sanitizeError(error)
          }
        }
      }).catch(() => {
      });
      return false;
    }
  };
  await syncBootstrapAuthForPhase("plugin-init");
  let poolManager = null;
  let cascadeStateManager = null;
  let poolChainConfig = { pools: [], chains: [] };
  async function ensurePoolInfrastructure() {
    poolChainConfig = await loadPoolChainConfig();
    poolManager ??= new PoolManager();
    poolManager.loadPools(poolChainConfig.pools);
    cascadeStateManager ??= new CascadeStateManager();
  }
  const lifecycle = createOpenCodeNativePluginLifecycle({
    store,
    client,
    managerClass: AccountManager,
    createRuntimeFactory: () => new AccountRuntimeFactory(store, client, claudeIdentity),
    createRefreshQueue: (_client, _store, onInvalidate) => new ProactiveRefreshQueue(client, store, (uuid) => {
      onInvalidate(uuid);
      void lifecycle.getManager()?.refresh();
    }),
    executeWithAccountRotation: async (activeManager, activeRuntimeFactory, _client, input, init) => {
      const activeAccount = activeManager.getActiveAccount();
      ensureHeartbeat(activeAccount?.accessToken, activeAccount);
      await ensurePoolInfrastructure();
      return executeWithAccountRotation(
        activeManager,
        activeRuntimeFactory,
        client,
        input,
        init,
        {
          poolManager,
          cascadeStateManager,
          poolChainConfig
        }
      );
    },
    migrateFromAuthJson: migrateFromAuthJson2,
    afterManagerInitialized: async (activeManager) => {
      activeManager.setClient(client);
      const activeAccount = activeManager.getActiveAccount();
      ensureHeartbeat(activeAccount?.accessToken, activeAccount);
    },
    afterOAuthLoad: (credentials, activeManager) => {
      const activeAccount = activeManager.getActiveAccount?.();
      ensureHeartbeat(activeAccount?.accessToken ?? credentials.access, activeAccount);
    },
    createFetch: ({ getManager, getRuntimeFactory, defaultFetch }) => async (input, init) => {
      const activeManager = getManager();
      const activeRuntimeFactory = getRuntimeFactory();
      if (!activeManager || !activeRuntimeFactory) {
        stopHeartbeat();
        return fetch(input, init);
      }
      if (activeManager.getAccountCount() === 0) {
        stopHeartbeat();
      }
      return defaultFetch(input, init);
    },
    createLoaderExtras: async () => {
      const authProfile = await claudeCodeIntegration.loadAuthProfile();
      return {
        baseURL: authProfile.apiV1BaseUrl,
        "chat.headers": async (input, output) => {
          if (input.provider?.info?.id !== ANTHROPIC_OAUTH_ADAPTER.authProviderId) return;
          const sessionId2 = getUpstreamSessionId();
          applyOrderedHeaders(output, {
            ...output.headers,
            ...getStaticHeaders(),
            ...getPerRequestHeaders(sessionId2),
            "anthropic-beta": getBetaHeader()
          });
        }
      };
    },
    authJsonProviderKey: "anthropic",
    oauthApiKey: "",
    noAccountsMessage: "No Anthropic accounts configured. Run `opencode auth login` to add an account.",
    getAccountLabel
  });
  const authLoader = createOpenCodeNativeAuthLoader({
    lifecycle,
    debugLog: (message, extra) => debugLog(client, message, extra),
    beforeAuth: (provider) => {
      const providerModels = readProviderModels(provider);
      ingestProviderModelsCapabilities(providerModels);
    },
    beforeLoad: async ({ auth }) => {
      if (auth.type === "oauth") {
        return;
      }
      await syncBootstrapAuthForPhase("loader-recovery");
    },
    afterLoad: ({ auth, manager, runtimeFactory, result }) => {
      if (auth.type !== "oauth") {
        if (!manager?.getAccountCount() || !runtimeFactory) {
          stopHeartbeat();
          return { apiKey: "", fetch };
        }
        return result;
      }
      if (!manager) {
        return { apiKey: "", fetch };
      }
      return result;
    }
  });
  await lifecycle.load({ type: "api" }).catch(() => {
  });
  const hooks = {
    "chat.params": async (input, output) => {
      if (!isAnthropicChatHook(input)) return;
      const outputEffort = getClientOutputEffort(output.options) ?? readOpenCodeVariantEffort(getMessageVariant(input));
      if (!outputEffort || outputEffort === "client") {
        outputEffortBySession.delete(input.sessionID);
        return;
      }
      outputEffortBySession.set(input.sessionID, outputEffort);
    },
    "chat.headers": async (input, output) => {
      if (!isAnthropicChatHook(input)) return;
      const outputEffort = outputEffortBySession.get(input.sessionID) ?? readOpenCodeVariantEffort(getMessageVariant(input));
      if (!outputEffort || outputEffort === "client") return;
      output.headers[OPENCODE_OUTPUT_EFFORT_HEADER] = outputEffort;
    },
    "experimental.chat.system.transform": async (input, output) => {
      const billingHeader = composeBillingSystemEntry(extractFirstUserText(input), claudeCodeVersion);
      prependMissingSystemEntries(output, [
        billingHeader,
        upstreamAgentIdentity,
        upstreamSystemPrompt
      ]);
    },
    provider: {
      id: ANTHROPIC_OAUTH_ADAPTER.authProviderId,
      models: zeroCostProviderModels
    },
    auth: {
      provider: ANTHROPIC_OAUTH_ADAPTER.authProviderId,
      methods: createOpenCodeNativeAuthMethods({
        oauthLabel: ANTHROPIC_OAUTH_ADAPTER.authMethodLabel,
        authorize: (inputs) => handleAuthorize(lifecycle.getManager(), inputs, client)
      }),
      loader: authLoader
    }
  };
  return hooks;
};
export {
  ClaudeMultiAuthPlugin,
  v241Definition as default
};
//# sourceMappingURL=index.js.map