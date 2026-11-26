import { beforeEach, afterEach, describe, expect, test } from "vitest";
import { createMockClient, setupTestEnv } from "../helpers";
import { AccountStore } from "../../src/accounts/store";
import { ACCOUNTS_FILENAME } from "../../src/shared/constants";
import type { CredentialOAuth } from "../../src/v241/types";

// Authorize/refresh adapt the fork's existing PKCE + exchange + pool machinery to the
// opencode v2.4.1 integration OAuth contract (opencode-plugin/plugin/src/promise/integration.ts):
// `authorize` returns `{ url, instructions, mode: "code", callback }` and `callback(code)`
// returns a `Credential.OAuth { type, methodID, access, refresh, expires }` (epoch-ms
// `expires`, required `methodID`; @opencode/schema/credential v2.4.1), while recording
// the exchanged account into the pool store.

// ISOLATION: every test in this file can invoke the authorize/refresh callbacks, and the
// callbacks write the pool store when a refresh token is present. Without
// OPENCODE_CONFIG_DIR, AccountStore falls back to the machine's real
// ~/.config/opencode (multi-account-core config.ts), so a fresh temp dir is installed
// for EVERY test below and restored afterwards.
let testEnv: Awaited<ReturnType<typeof setupTestEnv>> | null = null;
let testDir: string;

beforeEach(async () => {
  testEnv = await setupTestEnv();
  testDir = testEnv.dir;
  // Guard: store touchpoints must resolve under the sandbox dir, never the real config dir.
  expect(process.env.OPENCODE_CONFIG_DIR).toBe(testDir);
});

afterEach(async () => {
  await testEnv?.cleanup();
  testEnv = null;
});

const FIXTURE_OAUTH_CONFIG = {
  clientId: "fixture-client-id",
  authorizeUrl: "https://fixture.example/authorize",
  tokenUrl: "https://fixture.example/token",
  scopes: "fixture:scope",
  baseApiUrl: "https://fixture.example",
  source: "fallback" as const,
};

function createFakeExchange() {
  const calls: Array<{ code: string; codeVerifier: string; state: string; redirectUri: string }> = [];
  const exchange = async (params: {
    code: string;
    codeVerifier: string;
    state: string;
    redirectUri: string;
  }) => {
    calls.push(params);
    return {
      access_token: "fixture-access-token",
      refresh_token: "fixture-refresh-token",
      expires_in: 3600,
      account: { uuid: "fixture-account-uuid", email_address: "fixture@example.com" },
    };
  };
  return { calls, exchange };
}

async function readStorageFile(dir: string) {
  const { promises: fs } = await import("node:fs");
  const { join } = await import("node:path");
  let raw: string;
  try {
    raw = await fs.readFile(join(dir, ACCOUNTS_FILENAME), "utf-8");
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT") {
      return { accounts: [] as Array<{ uuid?: string }>, activeAccountUuid: undefined };
    }
    throw error;
  }
  return JSON.parse(raw) as {
    accounts: Array<{
      uuid?: string;
      email?: string;
      refreshToken: string;
      accessToken?: string;
      expiresAt?: number;
      activeAccountUuid?: string;
    }>;
    activeAccountUuid?: string;
  };
}

describe("v241 authorize", () => {
  test("returns the v2.4.1 code-mode authorization shape with a PKCE authorize URL", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const fake = createFakeExchange();

    const authorize = createAuthorize({
      loadOAuthConfig: async () => FIXTURE_OAUTH_CONFIG,
      exchangeCode: fake.exchange,
      client: createMockClient(),
    });

    const authorization = await authorize();

    expect(authorization.mode).toBe("code");
    expect(typeof authorization.instructions).toBe("string");
    expect(authorization.instructions.length).toBeGreaterThan(0);
    expect(typeof authorization.callback).toBe("function");

    const url = new URL(authorization.url);
    expect(url.origin + url.pathname).toBe(FIXTURE_OAUTH_CONFIG.authorizeUrl);
    expect(url.searchParams.get("client_id")).toBe(FIXTURE_OAUTH_CONFIG.clientId);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe(FIXTURE_OAUTH_CONFIG.scopes);
    expect(url.searchParams.get("code_challenge")).toBeTruthy();
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("state")).toBeTruthy();
  });

  test("callback exchanges the code and maps the token payload to Credential.OAuth (epoch-ms expires, methodID)", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const fake = createFakeExchange();

    const authorize = createAuthorize({
      loadOAuthConfig: async () => FIXTURE_OAUTH_CONFIG,
      exchangeCode: fake.exchange,
      client: createMockClient(),
    });

    const authorization = await authorize();
    // Guard: the callback writes the pool store; it must stay in the sandbox dir.
    expect(process.env.OPENCODE_CONFIG_DIR).toBe(testDir);
    const before = Date.now();
    const credential = await authorization.callback("fixture-code");
    const after = Date.now();

    expect(credential.type).toBe("oauth");
    expect(credential.methodID).toBe("claude-multi-auth");
    expect(credential.access).toBe("fixture-access-token");
    expect(credential.refresh).toBe("fixture-refresh-token");
    // expires_in is seconds; the fork stores epoch ms (now + expires_in * 1000).
    expect(credential.expires).toBeGreaterThanOrEqual(before + 3600 * 1000 - 1500);
    expect(credential.expires).toBeLessThanOrEqual(after + 3600 * 1000 + 1500);

    expect(fake.calls).toHaveLength(1);
    const exchangeCall = fake.calls[0]!;
    expect(exchangeCall.code).toBe("fixture-code");
    expect(exchangeCall.codeVerifier).toBeTruthy();
    expect(exchangeCall.redirectUri).toBe("https://console.anthropic.com/oauth/code/callback");
    const authorizeUrl = new URL(authorization.url);
    expect(exchangeCall.state).toBe(authorizeUrl.searchParams.get("state"));
  });

  test("callback records the exchanged account into the pool store as the active account", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const fake = createFakeExchange();

    const authorize = createAuthorize({
      loadOAuthConfig: async () => FIXTURE_OAUTH_CONFIG,
      exchangeCode: fake.exchange,
      client: createMockClient(),
    });

    const authorization = await authorize();
    const credential = await authorization.callback("fixture-code");

    // Reading the store under the sandbox dir and finding the account proves the
    // resolved store path stayed under OPENCODE_CONFIG_DIR for this callback.
    const storage = await readStorageFile(testDir);
    expect(storage.accounts).toHaveLength(1);
    const stored = storage.accounts[0]!;
    expect(stored.accessToken).toBe(credential.access);
    expect(stored.refreshToken).toBe(credential.refresh);
    expect(stored.expiresAt).toBe(credential.expires);
    expect(stored.email).toBe("fixture@example.com");
    expect(storage.activeAccountUuid).toBe(stored.uuid);
  });

  test("callback accepts the console paste format code#state and rejects a mismatched state", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const fake = createFakeExchange();

    const authorize = createAuthorize({
      loadOAuthConfig: async () => FIXTURE_OAUTH_CONFIG,
      exchangeCode: fake.exchange,
      client: createMockClient(),
    });

    const authorization = await authorize();
    const state = new URL(authorization.url).searchParams.get("state")!;

    const credential = await authorization.callback(`fixture-code#${state}`);
    expect(credential.access).toBe("fixture-access-token");
    expect(credential.methodID).toBe("claude-multi-auth");
    expect(fake.calls[0]!.code).toBe("fixture-code");

    await expect(authorization.callback("fixture-code#tampered-state")).rejects.toThrow(/state/i);
    expect(fake.calls).toHaveLength(1); // rejected paste never reached the exchange
  });
});

describe("v241 refresh", () => {
  function createFakeRefresh() {
    const calls: Array<{ refreshToken: string; accountId: string }> = [];
    const refreshTokenFn = async (refreshTokenValue: string, accountId: string) => {
      calls.push({ refreshToken: refreshTokenValue, accountId });
      return {
        ok: true as const,
        patch: {
          accessToken: "new-access-token",
          expiresAt: Date.now() + 7200 * 1000,
          refreshToken: "new-refresh-token",
        },
      };
    };
    return { calls, refreshTokenFn };
  }

  async function seedPoolStore() {
    const store = new AccountStore();
    await store.addAccount({
      uuid: "uuid-1",
      email: "owner@example.com",
      planTier: "",
      refreshToken: "fixture-refresh-token",
      accessToken: "old-access-token",
      expiresAt: 1,
      addedAt: 1,
      lastUsed: 1,
      enabled: true,
      consecutiveAuthFailures: 0,
      isAuthDisabled: false,
    });
    await store.setActiveUuid("uuid-1");
    return store;
  }

  test("refresh maps the fork refresh patch to a new Credential.OAuth", async () => {
    await seedPoolStore();
    const { createRefresh } = await import("../../src/v241/authorize");
    const fake = createFakeRefresh();

    const refresh = createRefresh({ refreshTokenFn: fake.refreshTokenFn, client: createMockClient() });
    const credential: CredentialOAuth = {
      type: "oauth",
      methodID: "claude-multi-auth",
      access: "old-access-token",
      refresh: "fixture-refresh-token",
      expires: 1,
    };

    const next = await refresh(credential);

    expect(next.type).toBe("oauth");
    expect(next.methodID).toBe("claude-multi-auth");
    expect(next.access).toBe("new-access-token");
    expect(next.refresh).toBe("new-refresh-token");
    expect(next.expires).toBeGreaterThan(Date.now());
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]!.refreshToken).toBe("fixture-refresh-token");
    expect(fake.calls[0]!.accountId).toBe("uuid-1");
  });

  test("refresh updates the matching pool store entry", async () => {
    await seedPoolStore();
    const { createRefresh } = await import("../../src/v241/authorize");
    const fake = createFakeRefresh();

    const refresh = createRefresh({ refreshTokenFn: fake.refreshTokenFn, client: createMockClient() });
    await refresh({
      type: "oauth",
      methodID: "claude-multi-auth",
      access: "old-access-token",
      refresh: "fixture-refresh-token",
      expires: 1,
    });

    const storage = await readStorageFile(testDir);
    expect(storage.accounts).toHaveLength(1);
    expect(storage.accounts[0]!.accessToken).toBe("new-access-token");
    expect(storage.accounts[0]!.refreshToken).toBe("new-refresh-token");
  });

  test("refresh of a credential missing from the pool still returns the refreshed mapping (fail-soft)", async () => {
    const { createRefresh } = await import("../../src/v241/authorize");
    const fake = createFakeRefresh();

    const refresh = createRefresh({ refreshTokenFn: fake.refreshTokenFn, client: createMockClient() });
    const next = await refresh({
      type: "oauth",
      methodID: "claude-multi-auth",
      access: "orphan-access",
      refresh: "orphan-refresh-token",
      expires: 1,
    });

    expect(next.access).toBe("new-access-token");
    expect(next.refresh).toBe("new-refresh-token");
    const storage = await readStorageFile(testDir);
    expect(storage.accounts).toHaveLength(0);
  });
});

describe("v241 refresh - classified refusal surface (P2 #2870)", () => {
  test("refresh error carries status and class from the classified result", async () => {
    const { createRefresh } = await import("../../src/v241/authorize");
    const refresh = createRefresh({
      refreshTokenFn: async () => ({
        ok: false,
        permanent: false,
        status: 429,
        message: "Anthropic token request failed. url=https://platform.claude.com/v1/oauth/token; details=status=429",
      }),
      client: { app: { log: async () => {} } } as never,
    });
    await expect(
      refresh({ type: "oauth", methodID: "claude-multi-auth", access: "a", refresh: "r", expires: Date.now() }),
    ).rejects.toThrow(/status=429.*transient/s);
  });
});

describe("v241 authorize - pool expiry units convention pin (P2 #2870)", () => {
  test("pool store receives credential.expires verbatim in epoch ms (no re-multiplication)", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const exchangeCode = async () => ({
      access_token: "at-fixture",
      refresh_token: "rt-fixture",
      expires_in: 28_733,
      account: { uuid: "acct-1", email_address: "pin@example.com" },
    });
    const loadOAuthConfig = async () => ({
      authorizeUrl: "https://claude.ai/oauth/authorize",
      clientId: "fixture-client-id",
      scopes: "user:profile",
      source: "fixture" as const,
    });
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v241-units-pin-"));
    const originalEnv = process.env.OPENCODE_CONFIG_DIR;
    process.env.OPENCODE_CONFIG_DIR = dir;
    try {
      const authorize = createAuthorize({ exchangeCode, loadOAuthConfig } as never);
      const authorization = await authorize();
      const credential = await (
        authorization as { callback: (code: string) => Promise<{ expires: number }> }
      ).callback("pin-code");
      // convention source: credential.expires is epoch ms = now + expires_in(seconds) * 1000
      expect(credential.expires).toBeGreaterThan(Date.now() + 28_000_000);
      expect(credential.expires).toBeLessThan(Date.now() + 29_500_000);
      // verbatim storage: pool expiresAt must equal credential.expires exactly (no *1000 anywhere)
      const { ACCOUNTS_FILENAME } = await import("../../src/shared/constants");
      const storePath = path.join(dir, ACCOUNTS_FILENAME);
      const stored = JSON.parse(fs.readFileSync(storePath, "utf8")) as { accounts: Array<{ expiresAt: number }> };
      expect(stored.accounts[0]?.expiresAt).toBe(credential.expires);
    } finally {
      if (originalEnv === undefined) delete process.env.OPENCODE_CONFIG_DIR;
      else process.env.OPENCODE_CONFIG_DIR = originalEnv;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("v241 refresh - accountId is never a credential value (FIX 1, MAJOR #2870)", () => {
  test("pool-miss refresh failure logs a non-credential accountId sentinel", async () => {
    const { createRefresh } = await import("../../src/v241/authorize");
    const anthropicOAuth = await import("../../src/oauth/anthropic-oauth");
    const { refreshToken } = await import("../../src/oauth/token");
    const { createMockClient } = await import("../helpers");
    const vi = (await import("vitest")).vi;
    const REFRESH_TOKEN = "rt-live-fixture-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const client = createMockClient();
    const spy = vi.spyOn(anthropicOAuth, "refreshWithOAuth").mockRejectedValue(
      new Error(
        `Anthropic token request failed. url=https://platform.claude.com/v1/oauth/token; details=Error: HTTP request failed. status=400; url=https://platform.claude.com/v1/oauth/token; body={"error":"invalid_grant"}`,
      ),
    );
    try {
      const refresh = createRefresh({
        refreshTokenFn: (rt, accountId, c) => refreshToken(rt, accountId, c),
        client,
      });
      // credential ABSENT from the pool (fresh isolated store): exercises the fallback
      await expect(
        refresh({ type: "oauth", methodID: "claude-multi-auth", access: "a", refresh: REFRESH_TOKEN, expires: Date.now() }),
      ).rejects.toThrow(/Token refresh failed/);
      expect(client.logs.length).toBe(1);
      const serialized = JSON.stringify(client.logs[0]);
      expect(serialized).not.toContain(REFRESH_TOKEN);
      expect(client.logs[0]?.extra).toMatchObject({ accountId: "unmapped" });
    } finally {
      spy.mockRestore();
    }
  });
});

describe("v241 authorize - no-refresh-token exchange is logged (FIX 7, #2870)", () => {
  test("a refresh_token-less exchange emits a warn naming condition and consequence", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const { createMockClient } = await import("../helpers");
    const client = createMockClient();
    const exchangeCode = async () => ({
      access_token: "at-fixture",
      // no refresh_token: the pool write is skipped
      expires_in: 3_600,
      account: { uuid: "acct-1", email_address: "norefresh@example.com" },
    });
    const loadOAuthConfig = async () => ({
      authorizeUrl: "https://claude.ai/oauth/authorize",
      clientId: "fixture-client-id",
      scopes: "user:profile",
      source: "fixture" as const,
    });
    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "v241-norefresh-"));
    const originalEnv = process.env.OPENCODE_CONFIG_DIR;
    process.env.OPENCODE_CONFIG_DIR = dir;
    try {
      const authorize = createAuthorize({ exchangeCode, loadOAuthConfig, client } as never);
      const authorization = await authorize();
      await (authorization as { callback: (code: string) => Promise<unknown> }).callback("norefresh-code");
      expect(client.logs.length).toBeGreaterThanOrEqual(1);
      const line = JSON.stringify(client.logs[0]);
      expect(client.logs[0]?.level).toBe("warn");
      expect(line).toContain("refresh");
      expect(line.toLowerCase()).toContain("pool");
    } finally {
      if (originalEnv === undefined) delete process.env.OPENCODE_CONFIG_DIR;
      else process.env.OPENCODE_CONFIG_DIR = originalEnv;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
