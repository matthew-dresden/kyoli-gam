import { describe, expect, test } from "vitest";
import { createMockClient, setupTestEnv } from "../helpers";
import { AccountStore } from "../../src/accounts/store";
import { ACCOUNTS_FILENAME } from "../../src/shared/constants";
import type { CredentialOAuth } from "../../src/v241/types";

// Authorize/refresh adapt the fork's existing PKCE + exchange + pool machinery to the
// opencode v2.4.1 integration OAuth contract (opencode-plugin/plugin/src/promise/integration.ts):
// `authorize` returns `{ url, instructions, mode: "code", callback }` and `callback(code)`
// returns a `Credential.OAuth { type, access, refresh, expires }` (epoch-ms `expires`,
// @opencode/schema/credential), while recording the exchanged account into the pool store.

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

  test("callback exchanges the code and maps the token payload to Credential.OAuth (epoch-ms expires)", async () => {
    const { createAuthorize } = await import("../../src/v241/authorize");
    const fake = createFakeExchange();

    const authorize = createAuthorize({
      loadOAuthConfig: async () => FIXTURE_OAUTH_CONFIG,
      exchangeCode: fake.exchange,
      client: createMockClient(),
    });

    const authorization = await authorize();
    const before = Date.now();
    const credential = await authorization.callback("fixture-code");
    const after = Date.now();

    expect(credential.type).toBe("oauth");
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
    const testEnv = await setupTestEnv();
    try {
      const { createAuthorize } = await import("../../src/v241/authorize");
      const fake = createFakeExchange();

      const authorize = createAuthorize({
        loadOAuthConfig: async () => FIXTURE_OAUTH_CONFIG,
        exchangeCode: fake.exchange,
        client: createMockClient(),
      });

      const authorization = await authorize();
      const credential = await authorization.callback("fixture-code");

      const storage = await readStorageFile(testEnv.dir);
      expect(storage.accounts).toHaveLength(1);
      const stored = storage.accounts[0]!;
      expect(stored.accessToken).toBe(credential.access);
      expect(stored.refreshToken).toBe(credential.refresh);
      expect(stored.expiresAt).toBe(credential.expires);
      expect(stored.email).toBe("fixture@example.com");
      expect(storage.activeAccountUuid).toBe(stored.uuid);
    } finally {
      await testEnv.cleanup();
    }
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
    const testEnv = await setupTestEnv();
    try {
      await seedPoolStore();
      const { createRefresh } = await import("../../src/v241/authorize");
      const fake = createFakeRefresh();

      const refresh = createRefresh({ refreshTokenFn: fake.refreshTokenFn, client: createMockClient() });
      const credential: CredentialOAuth = {
        type: "oauth",
        access: "old-access-token",
        refresh: "fixture-refresh-token",
        expires: 1,
      };

      const next = await refresh(credential);

      expect(next.type).toBe("oauth");
      expect(next.access).toBe("new-access-token");
      expect(next.refresh).toBe("new-refresh-token");
      expect(next.expires).toBeGreaterThan(Date.now());
      expect(fake.calls).toHaveLength(1);
      expect(fake.calls[0]!.refreshToken).toBe("fixture-refresh-token");
      expect(fake.calls[0]!.accountId).toBe("uuid-1");
    } finally {
      await testEnv.cleanup();
    }
  });

  test("refresh updates the matching pool store entry", async () => {
    const testEnv = await setupTestEnv();
    try {
      await seedPoolStore();
      const { createRefresh } = await import("../../src/v241/authorize");
      const fake = createFakeRefresh();

      const refresh = createRefresh({ refreshTokenFn: fake.refreshTokenFn, client: createMockClient() });
      await refresh({ type: "oauth", access: "old-access-token", refresh: "fixture-refresh-token", expires: 1 });

      const storage = await readStorageFile(testEnv.dir);
      expect(storage.accounts).toHaveLength(1);
      expect(storage.accounts[0]!.accessToken).toBe("new-access-token");
      expect(storage.accounts[0]!.refreshToken).toBe("new-refresh-token");
    } finally {
      await testEnv.cleanup();
    }
  });

  test("refresh of a credential missing from the pool still returns the refreshed mapping (fail-soft)", async () => {
    const testEnv = await setupTestEnv();
    try {
      const { createRefresh } = await import("../../src/v241/authorize");
      const fake = createFakeRefresh();

      const refresh = createRefresh({ refreshTokenFn: fake.refreshTokenFn, client: createMockClient() });
      const next = await refresh({
        type: "oauth",
        access: "orphan-access",
        refresh: "orphan-refresh-token",
        expires: 1,
      });

      expect(next.access).toBe("new-access-token");
      expect(next.refresh).toBe("new-refresh-token");
      const storage = await readStorageFile(testEnv.dir);
      expect(storage.accounts).toHaveLength(0);
    } finally {
      await testEnv.cleanup();
    }
  });
});
