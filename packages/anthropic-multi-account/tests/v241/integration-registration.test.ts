import { describe, expect, test, vi } from "vitest";
import type { IntegrationEditor, OAuthMethodRegistration, PluginContext } from "../../src/v241/types";

// v2.4.1 contract (opencode-plugin/plugin/src/effect/integration.ts + promise/adapter.ts):
// `ctx.integration.transform((editor) => editor.method.update({ integrationID, method, authorize, refresh? }))`
// registers an OAuth connect method on an integration. The promise adapter treats the
// callback's return as promises (adapter.ts wraps `authorize`/`refresh` with Effect.promise).

function createRecordingEditor() {
  return {
    method: {
      update: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(() => []),
    },
  };
}

function createMockCtx() {
  const integrationTransformCbs: Array<(editor: IntegrationEditor) => void> = [];
  const sessionHookCalls: Array<{ name: string; callback: unknown; options: unknown }> = [];
  const ctx: PluginContext = {
    integration: {
      transform: vi.fn(async (callback: (editor: IntegrationEditor) => void) => {
        integrationTransformCbs.push(callback);
      }),
    },
    session: {
      hook: vi.fn(async (name: string, callback: unknown, options?: unknown) => {
        sessionHookCalls.push({ name, callback, options });
      }),
    },
  } as PluginContext;
  return { ctx, integrationTransformCbs, sessionHookCalls };
}

describe("registerIntegrationMethod", () => {
  test("registers the claude-multi-auth oauth method on the anthropic integration", async () => {
    const { registerIntegrationMethod } = await import("../../src/v241/integration-registration");
    const { ctx, integrationTransformCbs } = createMockCtx();
    const deps = {
      authorize: vi.fn(async () => {
        throw new Error("authorize must only be invoked by the host");
      }),
      refresh: vi.fn(async () => {
        throw new Error("refresh must only be invoked by the host");
      }),
    };

    await registerIntegrationMethod(ctx, deps);

    expect(ctx.integration.transform).toHaveBeenCalledTimes(1);
    expect(integrationTransformCbs).toHaveLength(1);

    const editor = createRecordingEditor();
    integrationTransformCbs[0]!(editor);

    expect(editor.method.update).toHaveBeenCalledTimes(1);
    const registration = editor.method.update.mock.calls[0]![0] as OAuthMethodRegistration;
    expect(registration.integrationID).toBe("anthropic");
    expect(registration.method).toEqual({
      id: "claude-multi-auth",
      type: "oauth",
      label: "Claude Multi-Auth",
    });
    expect(typeof registration.authorize).toBe("function");
    expect(typeof registration.refresh).toBe("function");
  });

  test("v241Definition.setup performs the integration registration", async () => {
    const mod = await import("../../src/index");
    const definition = mod.default as { id: string; setup: (ctx: PluginContext) => Promise<unknown> };
    expect(definition.id).toBe("anthropic-multi-account");

    const { ctx, integrationTransformCbs } = createMockCtx();
    await definition.setup(ctx);

    expect(integrationTransformCbs.length).toBe(1);
    const editor = createRecordingEditor();
    integrationTransformCbs[0]!(editor);

    expect(editor.method.update).toHaveBeenCalledTimes(1);
    const registration = editor.method.update.mock.calls[0]![0] as OAuthMethodRegistration;
    expect(registration.integrationID).toBe("anthropic");
    expect(registration.method.id).toBe("claude-multi-auth");
    expect(typeof registration.authorize).toBe("function");
    expect(typeof registration.refresh).toBe("function");
  });
});
