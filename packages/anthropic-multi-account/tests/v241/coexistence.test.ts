import { describe, test, expect } from "vitest";
import { createCoexistenceCheck } from "../../src/v241/coexistence";
import { createMockClient } from "../helpers";

describe("api-key coexistence alert (FIX 4, #2870 no-money directive)", () => {
  const anthropicWithKey = [
    { id: "anthropic", connections: [{ method: "key", label: "sk-fixture-secret" }] },
  ];
  const anthropicPoolOnly = [
    { id: "anthropic", connections: [{ method: "oauth" }] },
  ];

  test("a key-shape credential on anthropic fires a warn with remediation, never the key value", async () => {
    const client = createMockClient();
    const check = createCoexistenceCheck({
      listIntegrations: async () => anthropicWithKey,
      log: (entry) => client.app.log({ body: { service: "claude-multiauth", ...entry } }),
    });
    await check();
    expect(client.logs.length).toBe(1);
    expect(client.logs[0]?.level).toBe("warn");
    const line = JSON.stringify(client.logs[0]);
    expect(line.toLowerCase()).toContain("api-key");
    expect(line.toLowerCase()).toContain("remove");
    expect(line.toLowerCase()).toContain("pool");
    expect(line).not.toContain("sk-fixture-secret");
  });

  test("pool-only (oauth) does not warn", async () => {
    const client = createMockClient();
    const check = createCoexistenceCheck({
      listIntegrations: async () => anthropicPoolOnly,
      log: (entry) => client.app.log({ body: { service: "claude-multiauth", ...entry } }),
    });
    await check();
    expect(client.logs.length).toBe(0);
  });

  test("a key on a non-anthropic integration does not warn", async () => {
    const client = createMockClient();
    const check = createCoexistenceCheck({
      listIntegrations: async () => [{ id: "openai", connections: [{ method: "key" }] }],
      log: (entry) => client.app.log({ body: { service: "claude-multiauth", ...entry } }),
    });
    await check();
    expect(client.logs.length).toBe(0);
  });

  test("listing failures are swallowed (best-effort at setup)", async () => {
    const client = createMockClient();
    const check = createCoexistenceCheck({
      listIntegrations: async () => {
        throw new Error("host unavailable");
      },
      log: (entry) => client.app.log({ body: { service: "claude-multiauth", ...entry } }),
    });
    await expect(check()).resolves.toBeUndefined();
  });
});
