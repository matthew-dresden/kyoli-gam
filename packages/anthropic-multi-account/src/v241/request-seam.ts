import { AccountManager } from "../accounts/manager";
import { AccountStore } from "../accounts/store";
import { getBetaHeader, getPerRequestHeaders, getStaticHeaders } from "../request/headers";
import { getUpstreamSessionId } from "../request/upstream-request";
import type { PluginClient } from "../shared/types";
import { createMinimalClient } from "../shared/utils";
import type {
  HttpResponseEvent,
  ModelRequestEvent,
  PluginContext,
  SessionHookOptions,
} from "./types";

/**
 * Decision on the v2.4.1 "retry" hook: NOT registered. The fork's rotation/retry
 * semantics live inside executeWithAccountRotation (the fetch executor wrapping each
 * request; src/runtime/executor.ts), and the built-in claude provider's
 * `decision.retry = false` rationale (Claude Code retries internally; core
 * src/plugin/provider/claude-agent/session.ts) does not apply to this plugin. The
 * http.response seam below is the narrow rotation hook for the PoC.
 */

export interface RequestSeamDeps {
  /** Pool active access token; null when no account is usable (fail-soft). */
  getActiveAccessToken: () => Promise<string | null>;
  /** Called for 401/429 responses; swaps the pool active account. */
  rotateOnFailure?: (status: number) => Promise<void>;
  /** Auth-independent, fork-owned headers (static + per-request + beta). */
  buildHeaders?: () => Record<string, string>;
}

function defaultForkHeaders(): Record<string, string> {
  const sessionId = getUpstreamSessionId();
  return {
    ...getStaticHeaders(),
    ...getPerRequestHeaders(sessionId),
    "anthropic-beta": getBetaHeader(),
  };
}

/**
 * model.request handler. The hook result's headers REPLACE the request headers
 * (opencode-core/src/session/model-request.ts), and `event.headers` starts as the
 * base headers: mutate it, overriding only the keys this plugin owns, so base keys
 * survive. No active pool account -> leave headers untouched (API key path keeps working).
 */
export function createModelRequestHandler(
  deps: RequestSeamDeps,
): (event: ModelRequestEvent) => Promise<void> {
  return async (event) => {
    const token = await deps.getActiveAccessToken();
    if (!token) return;

    event.headers.authorization = `Bearer ${token}`;
    Object.assign(event.headers, deps.buildHeaders?.() ?? defaultForkHeaders());
  };
}

/** http.response handler: rotate on auth/rate-limit failures; other statuses pass through. */
export function createHttpResponseHandler(
  deps: RequestSeamDeps,
): (event: HttpResponseEvent) => Promise<void> {
  return async (event) => {
    const status = event.response.status;
    if (status !== 401 && status !== 429) return;
    await deps.rotateOnFailure?.(status);
  };
}

/** Registers both session hooks on the plugin's provider, matching the built-in claude provider. */
export function registerRequestSeam(ctx: PluginContext, deps: RequestSeamDeps): Promise<void> {
  const options: SessionHookOptions = { providerID: "anthropic" };
  return Promise.all([
    ctx.session.hook("model.request", createModelRequestHandler(deps), options),
    ctx.session.hook("http.response", createHttpResponseHandler(deps), options),
  ]).then(() => undefined);
}

export interface PoolAccessors {
  getActiveAccessToken: () => Promise<string | null>;
  rotateOnFailure: (status: number) => Promise<void>;
}

export interface PoolAccessorDeps {
  client?: PluginClient;
}

/**
 * Default RequestSeamDeps over the fork's real pool machinery (AccountStore +
 * AccountManager). The manager is created lazily and reloaded from the store on each
 * use, so accounts added later (e.g. via the v2.4.1 authorize flow) are picked up.
 */
export function createPoolAccessors(deps: PoolAccessorDeps = {}): PoolAccessors {
  const client = deps.client ?? createMinimalClient();
  let managerPromise: Promise<AccountManager> | null = null;

  function loadManager(): Promise<AccountManager> {
    managerPromise ??= (async () => {
      const emptyAuth = { type: "oauth" as const, refresh: "", access: "", expires: 0 };
      return AccountManager.create(new AccountStore(), emptyAuth, client);
    })();
    return managerPromise;
  }

  return {
    getActiveAccessToken: async () => {
      const manager = await loadManager();
      await manager.refresh();
      return manager.getActiveAccount()?.accessToken ?? null;
    },

    rotateOnFailure: async (status) => {
      const manager = await loadManager();
      await manager.refresh();
      const active = manager.getActiveAccount();
      if (!active?.uuid) return;

      if (status === 401) {
        // Count the auth failure (fork semantics: the account is disabled after
        // max_consecutive_auth_failures) and add a rate-limit cooldown so the
        // selection below moves to another account immediately.
        await manager.markAuthFailure(active.uuid, { ok: false, permanent: false });
        await manager.markRateLimited(active.uuid);
      } else if (status === 429) {
        await manager.markRateLimited(active.uuid);
      } else {
        return;
      }

      await manager.selectAccount();
    },
  };
}
