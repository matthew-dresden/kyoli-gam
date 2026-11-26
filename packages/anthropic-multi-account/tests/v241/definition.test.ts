import { describe, expect, test } from "vitest";

// The exact contract opencode v2.4.1 enforces on a plugin's default export
// (opencode-core/src/plugin/module.ts, `Schema.Struct({ default: Schema.Union([...]) })`,
// ~lines 78-94): the default export must be an OBJECT carrying a string `id` plus an
// `effect` or `setup` function. A bare function default (the v1 `ClaudeMultiAuthPlugin`
// shape) fails to load with LoadError "Plugin must export a default definition with an
// id and an effect or setup function".
const mod = await import("../../src/index");
const definition = mod.default as { id?: unknown; setup?: unknown } | undefined;

describe("v2.4.1 plugin definition (package default export)", () => {
  test("is an object, not a function", () => {
    expect(definition).toBeTypeOf("object");
    expect(definition).not.toBeNull();
    expect(definition).not.toBeTypeOf("function");
  });

  test("has a string id", () => {
    expect(typeof definition?.id).toBe("string");
    expect(definition?.id).toBe("anthropic-multi-account");
  });

  test("has a setup function", () => {
    expect(typeof definition?.setup).toBe("function");
  });

  test("named v1 export ClaudeMultiAuthPlugin is preserved for older hosts", () => {
    expect(typeof mod.ClaudeMultiAuthPlugin).toBe("function");
  });
});
