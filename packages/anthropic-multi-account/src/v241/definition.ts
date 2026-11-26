import { AccountStore } from "../accounts/store";
import { createAuthorize, createRefresh } from "./authorize";
import { registerIntegrationMethod } from "./integration-registration";
import { createPoolAccessors, registerRequestSeam } from "./request-seam";
import { seedPoolFromStoredCredential } from "./seed";
import { createCoexistenceCheck, clientLog, defaultListIntegrations } from "./coexistence";
import { createMinimalClient } from "../shared/utils";
import type { PluginContext } from "./types";

if (process.env.CLAUDE_MULTI_ACCOUNT_TRACE_PLUGIN === "1") {
  console.error("[anthropic-multi-account] v241 module loaded");
}

/**
 * v2.4.1 plugin definition (AzDO #2863 PoC).
 *
 * The v2.4.1 loader validates exactly this shape (opencode-core/src/plugin/module.ts):
 * `{ id: string, setup: function }`. The v2.4.1 promise adapter ignores v1-style hooks
 * objects returned from `setup` (only a returned function is treated as cleanup;
 * opencode-plugin/plugin/src/promise/adapter.ts), so `setup` wires everything through
 * the ctx domains instead of returning hooks.
 */
export const v241Definition = {
  id: "anthropic-multi-account",
  setup: async (ctx: PluginContext): Promise<void> => {
    // OAuth connect method on the "anthropic" integration, backed by the fork's
    // existing PKCE/exchange/refresh machinery (authorize.ts).
    await registerIntegrationMethod(ctx, {
      authorize: createAuthorize(),
      refresh: createRefresh(),
    });

    // Header injection + 401/429 rotation over the pool (lazy pool accessors).
    await registerRequestSeam(ctx, createPoolAccessors());

    // Seed the pool from the stored auth.json credential when the pool is empty
    // (pre-existing owner logins); the v2.4.1 authorize flow writes the pool itself.
    await seedPoolFromStoredCredential(new AccountStore());

    // FIX 4 (#2870, no-money directive): warn loudly if an API-key credential
    // coexists with the pool on the anthropic integration (paid-billing risk).
    await createCoexistenceCheck({
      listIntegrations: defaultListIntegrations(ctx),
      log: clientLog(createMinimalClient()),
    })();
  },
};

export default v241Definition;
