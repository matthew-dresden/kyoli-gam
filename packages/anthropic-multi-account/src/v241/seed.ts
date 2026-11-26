import { migrateFromAuthJson } from "opencode-multi-account-core";
import type { AccountStore } from "../accounts/store";
import { ANTHROPIC_OAUTH_ADAPTER } from "../shared/constants";

/**
 * Seeds the pool store from the stored opencode auth.json credential when the pool has
 * no accounts, reusing the fork's own migration routine
 * (packages/multi-account-core/src/auth-migration.ts). This covers owner credentials
 * from pre-existing `opencode auth login` runs; the v2.4.1 authorize flow writes the
 * pool store itself (authorize.ts), so no separate credential-read seam is needed.
 */
export function seedPoolFromStoredCredential(store: AccountStore): Promise<boolean> {
  return migrateFromAuthJson(ANTHROPIC_OAUTH_ADAPTER.authProviderId, store);
}
