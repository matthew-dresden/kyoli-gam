/**
 * Structural types for the opencode v2.4.1 plugin host contract (AzDO #2863 PoC).
 *
 * Mirrored read-only from the v2.4.1 sources; this fork does not depend on the
 * v2.4.1 packages:
 * - opencode-core/src/plugin/module.ts: the default export must be `{ id, effect? } | { id, setup? }`.
 * - opencode-plugin/plugin/src/promise/integration.ts: integration editor and OAuth authorization shapes.
 * - opencode-plugin/plugin/src/promise/registration.ts: session hook options (`{ providerID }`).
 * - opencode-plugin/plugin/src/promise/adapter.ts: promise plugin context domains.
 * - @opencode/schema/credential: `Credential.OAuth`.
 */

/** opencode v2.4.1 `Credential.OAuth`; `expires` is epoch milliseconds. */
export interface CredentialOAuth {
  type: "oauth";
  /**
   * Required by the v2.4.1 schema (@opencode/schema/credential.ts: `methodID` is part of
   * Credential.OAuth) and by core's credential decode: the host brands the value with
   * `MethodID.make(value.methodID)` without validation, and every later row read decodes
   * via CredentialLegacy.Value, which throws when methodID is missing. The auto-refresh
   * lookup also keys on `credential.value.methodID` (core/src/integration.ts).
   */
  methodID: string;
  access: string;
  refresh: string;
  /** Epoch milliseconds, non-negative integer (core convention: Date.now()-based ms). */
  expires: number;
}

export interface IntegrationOAuthMethod {
  id: string;
  type: "oauth";
  label: string;
}

/** promise/integration.ts `IntegrationOAuthAuthorization`; the PoC uses "code" mode. */
export type IntegrationOAuthAuthorization = {
  url: string;
  instructions: string;
  expiresAt?: number;
} & (
  | {
      mode: "auto";
      callback: Promise<CredentialOAuth>;
      submit?: (redirect: string) => Promise<void>;
    }
  | {
      mode: "code";
      callback: (code: string) => Promise<CredentialOAuth>;
    }
);

export interface OAuthMethodRegistration {
  integrationID: string;
  method: IntegrationOAuthMethod;
  authorize: (answer?: Record<string, unknown>) => Promise<IntegrationOAuthAuthorization>;
  refresh?: (credential: CredentialOAuth) => Promise<CredentialOAuth>;
}

export interface IntegrationEditor {
  method: {
    list(integrationID: string): unknown[];
    update(input: OAuthMethodRegistration): void;
    remove(integrationID: string, method: { id: string; type: string }): void;
  };
}

export interface IntegrationDomain {
  transform(callback: (editor: IntegrationEditor) => void): Promise<unknown>;
}

/** promise/registration.ts `SessionModelRequest` (subset used by the adapter). */
export interface ModelRequestEvent {
  sessionID: string;
  agent: string;
  model: { providerID: string; modelID: string };
  kind: string;
  baseURL?: string;
  headers: Record<string, string>;
}

/** promise/session.ts `SessionHttpResponse` (subset used by the adapter). */
export interface HttpResponseEvent {
  sessionID: string;
  agent: string;
  model: { providerID: string; modelID: string };
  kind: string;
  request: Request;
  response: Response;
}

export interface SessionHookOptions {
  providerID?: string;
}

export interface SessionDomain {
  hook(
    name: "model.request",
    callback: (event: ModelRequestEvent) => void | Promise<void>,
    options?: SessionHookOptions,
  ): Promise<unknown>;
  hook(
    name: "http.response",
    callback: (event: HttpResponseEvent) => void | Promise<void>,
    options?: SessionHookOptions,
  ): Promise<unknown>;
  hook(
    name: string,
    callback: (event: never) => void | Promise<void>,
    options?: SessionHookOptions,
  ): Promise<unknown>;
}

/** Subset of the v2.4.1 promise plugin context (promise/adapter.ts `PromiseContext`). */
export interface PluginContext {
  integration: IntegrationDomain;
  session: SessionDomain;
}
