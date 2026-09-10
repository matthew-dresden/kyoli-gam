import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Regression guard for the fingerprint capture environment.
 *
 * The capture spawns Claude Code with ANTHROPIC_BASE_URL pointed at a local
 * capture server. That variable only redirects Claude Code's direct Anthropic
 * API path; under CLAUDE_CODE_USE_BEDROCK (or the Vertex, Foundry and gateway
 * equivalents) it is ignored, so the throwaway "hi" prompt reaches the real
 * backend and bills the user once per capture.
 *
 * Observed against 0.3.4: with CLAUDE_CODE_USE_BEDROCK=1 in
 * ~/.claude/settings.json, every session start spawned
 * `claude --print -p hi --model claude-opus-4-8` against AWS Bedrock. 127
 * captures over four days cost 9.79 USD, almost all of it prompt-cache writes,
 * because each capture is a fresh session.
 *
 * runClaudeCapture is module-private and spawns a real process, so this test
 * asserts on the source: the child environment must strip the alternate
 * backend switches. Kept as a source assertion rather than exporting internals
 * purely for testing.
 */
describe("fingerprint capture environment", () => {
  const source = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "../src/fingerprint-capture.ts",
    ),
    "utf8",
  );

  // The full set Claude Code 2.1.247 checks in its alternate-backend branch.
  const alternateBackendVars = [
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
    "CLAUDE_CODE_USE_FOUNDRY",
    "CLAUDE_CODE_USE_GATEWAY",
    "CLAUDE_CODE_USE_ANTHROPIC_AWS",
    "CLAUDE_CODE_USE_ANTHROPIC_GOOGLE_CLOUD",
    "CLAUDE_CODE_USE_MANTLE",
  ];

  it("strips every alternate-backend switch from the capture child env", () => {
    for (const variable of alternateBackendVars) {
      expect(
        source.includes(`"${variable}"`),
        `${variable} must be removed from the capture environment`,
      ).toBe(true);
    }
  });

  it("still redirects the capture at the local server", () => {
    expect(source).toContain("ANTHROPIC_BASE_URL: params.baseUrl");
  });

  it("deletes the switches instead of mutating the caller's environment", () => {
    expect(source).toContain("delete captureEnv[alternateBackendVar]");
    expect(source).not.toContain("delete process.env.CLAUDE_CODE_USE_BEDROCK");
  });
});
