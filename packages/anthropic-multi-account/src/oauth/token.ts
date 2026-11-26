import { createHash } from "node:crypto";
import {
  ANTHROPIC_OAUTH_ADAPTER,
  TOKEN_EXPIRY_BUFFER_MS,
} from "../shared/constants";
import { refreshWithOAuth } from "./anthropic-oauth";
import type {
  ManagedAccount,
  PluginClient,
  TokenRefreshResult,
} from "../shared/types";

const PERMANENT_FAILURE_MESSAGE_PATTERNS = [
  /\binvalid_grant\b/i,
  /\binvalid_scope\b/i,
  /\bunauthorized_client\b/i,
  /\brefresh token\b.*\b(invalid|expired|revoked|no longer valid)\b/i,
  /\bauth(?:entication)?(?:[_\s-]+)?invalid\b/i,
];
const refreshMutexByAccountId = new Map<string, Promise<TokenRefreshResult>>();

export function isTokenExpired(account: Pick<ManagedAccount, "accessToken" | "expiresAt">): boolean {
  if (!account.accessToken || !account.expiresAt) return true;
  return account.expiresAt <= Date.now() + TOKEN_EXPIRY_BUFFER_MS;
}

export async function refreshToken(
  currentRefreshToken: string,
  accountId: string,
  client: PluginClient,
): Promise<TokenRefreshResult> {
  if (!currentRefreshToken) return { ok: false, permanent: true };

  // P4 #2870: the "unmapped" sentinel (pool-miss) must not become a shared mutex key -
  // two concurrent refreshes of DIFFERENT credentials would otherwise receive each
  // other's patch. Key unmapped entries by a token hash (privacy-preserving) so
  // identical tokens still deduplicate while distinct credentials stay independent.
  const mutexKey =
    accountId === "unmapped"
      ? `unmapped:${createHash("sha256").update(currentRefreshToken).digest("hex").slice(0, 16)}`
      : accountId;
  const inFlightRefresh = refreshMutexByAccountId.get(mutexKey);
  if (inFlightRefresh) return inFlightRefresh;

  const refreshPromise = (async (): Promise<TokenRefreshResult> => {
    try {
      const patch = await refreshWithOAuth(currentRefreshToken);
      return { ok: true, patch };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isPermanent = PERMANENT_FAILURE_MESSAGE_PATTERNS
        .some((pattern) => pattern.test(message));
      // P2 #2870: surface the refusal class with its endpoint and HTTP status so
      // transient-vs-permanent is provable. Structured single line; never a token value.
      const endpointMatch = /url=([^;]+);/.exec(message);
      const statusMatch = /status=(\d{3})/.exec(message);
      const classification = isPermanent ? "permanent" : "transient";

      await client.app
        .log({
          body: {
            service: ANTHROPIC_OAUTH_ADAPTER.serviceLogName,
            level: isPermanent ? "error" : "warn",
            message: `Token refresh failed: ${message}${isPermanent ? " (permanent)" : ""}`,
            extra: {
              accountId,
              endpoint: endpointMatch?.[1],
              status: statusMatch?.[1] ? Number(statusMatch[1]) : undefined,
              classification,
            },
          },
        })
        .catch(() => {});

      return { ok: false, permanent: isPermanent, message, status: statusMatch?.[1] ? Number(statusMatch[1]) : undefined };
    } finally {
      refreshMutexByAccountId.delete(mutexKey);
    }
  })();

  refreshMutexByAccountId.set(mutexKey, refreshPromise);
  return refreshPromise;
}

export function clearRefreshMutex(accountId?: string): void {
  if (accountId) {
    refreshMutexByAccountId.delete(accountId);
    return;
  }

  refreshMutexByAccountId.clear();
}
