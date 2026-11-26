import type { PluginClient } from "../shared/types";

/**
 * FIX 4 (#2870, the no-money directive): an API-key credential on the anthropic
 * integration alongside the multi-account pool means paid billing can silently
 * replace the subscription lane. The adapter warns once at setup, naming the
 * condition and the remediation. Only the connection's METHOD is read - never any
 * key material.
 */

export interface IntegrationSnapshot {
  id: string;
  connections?: ReadonlyArray<{ method?: string; label?: string }>;
}

export interface CoexistenceLogEntry {
  level: "warn" | "error" | "info";
  message: string;
  extra?: Record<string, unknown>;
}

export interface CoexistenceDeps {
  /** Enumerates integrations with their connections (host API; method field per Connection.CredentialInfo). */
  listIntegrations: () => Promise<ReadonlyArray<IntegrationSnapshot>>;
  /** The structured log channel (client.app.log). */
  log: (entry: CoexistenceLogEntry) => Promise<void>;
}

export function createCoexistenceCheck(deps: CoexistenceDeps): () => Promise<void> {
  return async () => {
    let integrations: ReadonlyArray<IntegrationSnapshot>;
    try {
      integrations = await deps.listIntegrations();
    } catch {
      // best-effort at setup: a listing failure must not break plugin activation.
      return;
    }

    const anthropic = integrations.find((integration) => integration.id === "anthropic");
    const hasKeyConnection = (anthropic?.connections ?? []).some(
      (connection) => connection.method === "key",
    );
    if (!hasKeyConnection) return;

    await deps.log({
      level: "warn",
      message:
        "An API-key credential exists on the anthropic integration alongside the multi-account pool. Remove the key credential so the pool serves the lane: a key path invites paid billing instead of the subscription. (opencode auth logout anthropic, or delete the key connection.)",
      extra: { integrationID: "anthropic", condition: "api-key coexistence" },
    });
  };
}

/** Best-effort default enumeration over the host's promise context integration domain. */
export function defaultListIntegrations(ctx: {
  integration: { list?: (...args: unknown[]) => Promise<unknown> };
}): () => Promise<ReadonlyArray<IntegrationSnapshot>> {
  return async () => {
    const raw = await ctx.integration.list?.();
    const items = Array.isArray(raw) ? raw : [];
    return items.map((item) => {
      const record = item as { id?: string; connections?: unknown };
      const connections = Array.isArray(record.connections)
        ? (record.connections as Array<{ method?: string; label?: string }>)
        : undefined;
      return { id: record.id ?? "", connections };
    });
  };
}

/** Logs through the fork's client channel (client.app.log); failures are swallowed. */
export function clientLog(
  client: PluginClient,
): (entry: CoexistenceLogEntry) => Promise<void> {
  return async (entry) => {
    await client.app
      .log({
        body: {
          service: "claude-multiauth",
          level: entry.level,
          message: entry.message,
          extra: entry.extra,
        },
      })
      .catch(() => {});
  };
}
