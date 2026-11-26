import type {
  CredentialOAuth,
  IntegrationEditor,
  IntegrationOAuthAuthorization,
  OAuthMethodRegistration,
  PluginContext,
} from "./types";

/**
 * The built-in "anthropic" integration currently exposes only the API-key connect
 * method; there is no built-in OAuth method with this id, and the separate
 * "claude-agent" provider (external claude CLI login) does not collide with it.
 */
export const INTEGRATION_ID = "anthropic";
export const METHOD_ID = "claude-multi-auth";
export const METHOD_LABEL = "Claude Multi-Auth";

export interface IntegrationRegistrationDeps {
  authorize: (answer?: Record<string, unknown>) => Promise<IntegrationOAuthAuthorization>;
  refresh: (credential: CredentialOAuth) => Promise<CredentialOAuth>;
}

/**
 * Registers the plugin's OAuth connect method on the v2.4.1 "anthropic" integration
 * (opencode-plugin/plugin/src/effect/integration.ts `IntegrationEditor.method.update`).
 * Reuses the authorize/refresh handlers built in authorize.ts on the fork's existing
 * PKCE/exchange/refresh machinery.
 */
export async function registerIntegrationMethod(
  ctx: PluginContext,
  deps: IntegrationRegistrationDeps,
): Promise<void> {
  await ctx.integration.transform((editor: IntegrationEditor) => {
    const registration: OAuthMethodRegistration = {
      integrationID: INTEGRATION_ID,
      method: { id: METHOD_ID, type: "oauth", label: METHOD_LABEL },
      authorize: (answer?: Record<string, unknown>) => deps.authorize(answer),
      refresh: (credential: CredentialOAuth) => deps.refresh(credential),
    };
    editor.method.update(registration);
  });
}
