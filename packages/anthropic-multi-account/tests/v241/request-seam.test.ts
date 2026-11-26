import { describe, expect, test, vi } from "vitest";
import { createMockClient, setupTestEnv } from "../helpers";
import { AccountStore } from "../../src/accounts/store";
import { ACCOUNTS_FILENAME } from "../../src/shared/constants";
import type { HttpResponseEvent, ModelRequestEvent, PluginContext } from "../../src/v241/types";

// v2.4.1 contract (opencode-plugin/plugin/src/promise/registration.ts + core
// src/session/model-request.ts): the "model.request" hook's FINAL `event.headers`
// become the request headers, so the adapter must preserve base keys it does not
// own. Both session hooks are registered with `{ providerID: "anthropic" }` like the
// built-in claude provider does (core src/plugin/provider/claude-agent/session.ts).

type HookCallback = (event: never) => Promise<void>;

function createMockCtx() {
  const sessionHookCalls: Array<{ name: string; callback: HookCallback; options?: { providerID?: string } }> = [];
  const ctx = {
    integration: { transform: vi.fn(async () => undefined) },
    session: {
      hook: vi.fn(async (name: string, callback: HookCallback, options?: { providerID?: string }) => {
        sessionHookCalls.push({ name, callback, options });
      }),
    },
  };
  return { ctx: ctx as unknown as PluginContext, sessionHookCalls };
}

async function readStorageFile(dir: string) {
  const { promises: fs } = await import("node:fs");
  const { join } = await import("node:path");
  const raw = await fs.readFile(join(dir, ACCOUNTS_FILENAME), "utf-8");
  return JSON.parse(raw) as {
    accounts: Array<{ uuid?: string; refreshToken: string; rateLimitResetAt?: number; consecutiveAuthFailures?: number }>;
    activeAccountUuid?: string;
  };
}

async function waitForStorage(
  dir: string,
  predicate: (storage: Awaited<ReturnType<typeof readStorageFile>>) => boolean,
): Promise<Awaited<ReturnType<typeof readStorageFile>>> {
  const { promises: fs } = await import("node:fs");
  const { join } = await import("node:path");
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const storage = JSON.parse(await fs.readFile(join(dir, ACCOUNTS_FILENAME), "utf-8"));
      if (predicate(storage)) return storage;
    } catch {
      // file may not exist yet; keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("pool store did not reach the expected state");
}

describe("registerRequestSeam", () => {
  test("registers model.request and http.response hooks filtered to the anthropic provider", async () => {
    const { registerRequestSeam } = await import("../../src/v241/request-seam");
    const { ctx, sessionHookCalls } = createMockCtx();

    await registerRequestSeam(ctx, {
      getActiveAccessToken: async () => null,
      rotateOnFailure: async () => {},
      buildHeaders: () => ({}),
    });

    expect(sessionHookCalls.map((call) => call.name).sort()).toEqual(["http.response", "model.request"]);
    for (const call of sessionHookCalls) {
      expect(call.options).toEqual({ providerID: "anthropic" });
    }
  });

  test("model.request handler injects Authorization, fork headers, and preserves base headers", async () => {
    const { registerRequestSeam } = await import("../../src/v241/request-seam");
    const { ctx, sessionHookCalls } = createMockCtx();

    await registerRequestSeam(ctx, {
      getActiveAccessToken: async () => "fixture-access-token",
      rotateOnFailure: async () => {},
      buildHeaders: () => ({ "x-fork-static": "fixture-static", "anthropic-beta": "fixture-beta" }),
    });

    const handler = sessionHookCalls.find((call) => call.name === "model.request")!.callback;
    const event = {
      sessionID: "s-1",
      agent: "build",
      model: { providerID: "anthropic", modelID: "claude-x" },
      kind: "primary",
      headers: { "x-base": "keep-me", authorization: "stale-key" },
    } as ModelRequestEvent;

    await handler(event as never);

    expect(event.headers.authorization).toBe("Bearer fixture-access-token");
    expect(event.headers["anthropic-beta"]).toBe("fixture-beta");
    expect(event.headers["x-fork-static"]).toBe("fixture-static");
    expect(event.headers["x-base"]).toBe("keep-me"); // base keys the fork does not own survive
  });

  test("model.request handler leaves headers untouched when the pool has no active account", async () => {
    const { registerRequestSeam } = await import("../../src/v241/request-seam");
    const { ctx, sessionHookCalls } = createMockCtx();

    await registerRequestSeam(ctx, {
      getActiveAccessToken: async () => null,
      rotateOnFailure: async () => {},
      buildHeaders: () => ({ "x-fork": "would-leak" }),
    });

    const handler = sessionHookCalls.find((call) => call.name === "model.request")!.callback;
    const event = {
      sessionID: "s-1",
      agent: "build",
      model: { providerID: "anthropic", modelID: "claude-x" },
      kind: "primary",
      headers: { "x-base": "keep-me" },
    } as ModelRequestEvent;

    await handler(event as never);

    expect(event.headers).toEqual({ "x-base": "keep-me" });
  });

  test("http.response handler triggers rotation on 401 and 429 only", async () => {
    const { registerRequestSeam } = await import("../../src/v241/request-seam");
    const { ctx, sessionHookCalls } = createMockCtx();
    const rotateOnFailure = vi.fn(async () => {});

    await registerRequestSeam(ctx, {
      getActiveAccessToken: async () => null,
      rotateOnFailure,
    });

    const handler = sessionHookCalls.find((call) => call.name === "http.response")!.callback;
    const makeEvent = (status: number) =>
      ({
        sessionID: "s-1",
        agent: "build",
        model: { providerID: "anthropic", modelID: "claude-x" },
        kind: "primary",
        request: new Request("https://fixture.example/v1/messages"),
        response: new Response(null, { status }),
      }) as HttpResponseEvent;

    await handler(makeEvent(401) as never);
    await handler(makeEvent(429) as never);
    await handler(makeEvent(200) as never);

    expect(rotateOnFailure).toHaveBeenCalledTimes(2);
    expect(rotateOnFailure.mock.calls[0]![0]).toBe(401);
    expect(rotateOnFailure.mock.calls[1]![0]).toBe(429);
  });
});

describe("createPoolAccessors (default wiring against the real pool store)", () => {
  async function seedPoolStore() {
    const store = new AccountStore();
    const base = {
      planTier: "",
      addedAt: 1,
      lastUsed: 1,
      enabled: true,
      consecutiveAuthFailures: 0,
      isAuthDisabled: false,
    };
    await store.addAccount({ ...base, uuid: "uuid-1", email: "one@example.com", refreshToken: "refresh-1", accessToken: "fixture-access-token", expiresAt: Date.now() + 3_600_000 });
    await store.addAccount({ ...base, uuid: "uuid-2", email: "two@example.com", refreshToken: "refresh-2", accessToken: "fixture-access-token-2", expiresAt: Date.now() + 3_600_000 });
    await store.setActiveUuid("uuid-1");
  }

  test("exposes the active account access token", async () => {
    const testEnv = await setupTestEnv();
    try {
      await seedPoolStore();
      const { createPoolAccessors } = await import("../../src/v241/request-seam");

      const accessors = createPoolAccessors({ client: createMockClient() });
      await expect(accessors.getActiveAccessToken()).resolves.toBe("fixture-access-token");
    } finally {
      await testEnv.cleanup();
    }
  });

  test("rotateOnFailure(401) marks the active account unhealthy and swaps the active account", async () => {
    const testEnv = await setupTestEnv();
    try {
      await seedPoolStore();
      const { createPoolAccessors } = await import("../../src/v241/request-seam");

      const accessors = createPoolAccessors({ client: createMockClient() });
      await accessors.rotateOnFailure(401);

      const storage = await waitForStorage(testEnv.dir, (current) => current.activeAccountUuid !== "uuid-1");
      const failed = storage.accounts.find((account) => account.uuid === "uuid-1")!;
      expect(failed.consecutiveAuthFailures).toBe(1);
      expect(failed.rateLimitResetAt).toBeGreaterThan(Date.now());
      expect(storage.activeAccountUuid).toBe("uuid-2");
    } finally {
      await testEnv.cleanup();
    }
  });
});
