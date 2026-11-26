import { promises as fs } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { setupTestEnv } from "../helpers";
import { AccountStore } from "../../src/accounts/store";
import { ACCOUNTS_FILENAME } from "../../src/shared/constants";
import type { StoredAccount } from "../../src/shared/types";

// The pool is seeded from the stored opencode auth.json credential when the pool store
// has no accounts, reusing the fork's own migrateFromAuthJson routine
// (packages/multi-account-core/src/auth-migration.ts). The v2.4.1 authorize flow also
// writes the pool store directly, so this covers pre-existing owner logins.

function makeAccount(uuid: string, refreshToken: string): StoredAccount {
  return {
    uuid,
    email: `${uuid}@example.com`,
    planTier: "",
    refreshToken,
    accessToken: `access-${uuid}`,
    expiresAt: Date.now() + 3_600_000,
    addedAt: 1,
    lastUsed: 1,
    enabled: true,
    consecutiveAuthFailures: 0,
    isAuthDisabled: false,
  };
}

async function readStorage(dir: string) {
  const raw = await fs.readFile(join(dir, ACCOUNTS_FILENAME), "utf-8");
  return JSON.parse(raw) as { accounts: Array<{ uuid?: string; refreshToken: string }>; activeAccountUuid?: string };
}

describe("seedPoolFromStoredCredential", () => {
  test("seeds the pool store from the auth.json credential when the pool is empty", async () => {
    const testEnv = await setupTestEnv();
    try {
      // Owner credential previously written by `opencode auth login` (auth.json).
      await fs.writeFile(
        join(testEnv.dir, "auth.json"),
        JSON.stringify({
          anthropic: { type: "oauth", refresh: "authjson-refresh-token", access: "authjson-access-token", expires: Date.now() + 3_600_000 },
        }),
        "utf-8",
      );

      const { seedPoolFromStoredCredential } = await import("../../src/v241/seed");
      const seeded = await seedPoolFromStoredCredential(new AccountStore());

      expect(seeded).toBe(true);
      const storage = await readStorage(testEnv.dir);
      expect(storage.accounts).toHaveLength(1);
      expect(storage.accounts[0]!.refreshToken).toBe("authjson-refresh-token");
      expect(storage.activeAccountUuid).toBe(storage.accounts[0]!.uuid);
    } finally {
      await testEnv.cleanup();
    }
  });

  test("leaves a populated pool store untouched", async () => {
    const testEnv = await setupTestEnv();
    try {
      await fs.writeFile(
        join(testEnv.dir, "auth.json"),
        JSON.stringify({
          anthropic: { type: "oauth", refresh: "authjson-refresh-token", access: "authjson-access-token", expires: Date.now() + 3_600_000 },
        }),
        "utf-8",
      );
      const store = new AccountStore();
      await store.addAccount(makeAccount("existing-1", "pool-refresh-token"));
      await store.setActiveUuid("existing-1");

      const { seedPoolFromStoredCredential } = await import("../../src/v241/seed");
      const seeded = await seedPoolFromStoredCredential(new AccountStore());

      expect(seeded).toBe(false);
      const storage = await readStorage(testEnv.dir);
      expect(storage.accounts).toHaveLength(1);
      expect(storage.accounts[0]!.refreshToken).toBe("pool-refresh-token");
      expect(storage.activeAccountUuid).toBe("existing-1");
    } finally {
      await testEnv.cleanup();
    }
  });

  test("does nothing when no auth.json credential exists", async () => {
    const testEnv = await setupTestEnv();
    try {
      const { seedPoolFromStoredCredential } = await import("../../src/v241/seed");
      const seeded = await seedPoolFromStoredCredential(new AccountStore());

      expect(seeded).toBe(false);
      await expect(readStorage(testEnv.dir)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await testEnv.cleanup();
    }
  });
});
