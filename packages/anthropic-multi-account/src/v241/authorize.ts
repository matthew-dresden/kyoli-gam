import { AccountManager } from "../accounts/manager";
import { AccountStore } from "../accounts/store";
import {
  buildAuthorizeUrl,
  detectOAuthConfig,
  exchangeCodeForTokens,
} from "../oauth/anthropic-oauth";
import { generatePKCE, generateState } from "../oauth/pkce";
import { refreshToken } from "../oauth/token";
import type { AccountMetadataPatch } from "opencode-multi-account-core";
import type {
  PluginClient,
  TokenResponse,
  TokenRefreshResult,
} from "../shared/types";
import { createMinimalClient } from "../shared/utils";
import type { CredentialOAuth, IntegrationOAuthAuthorization } from "./types";

/**
 * Redirect used for the "code" flow: the Claude console callback page displays the
 * authorization code (as `code#state`) for the user to paste into the host dialog.
 */
const CODE_MODE_REDIRECT_URI = "https://console.anthropic.com/oauth/code/callback";

export interface AuthorizeDeps {
  /** Defaults to the fork's detected Claude Code OAuth config. */
  loadOAuthConfig?: () => Promise<{ clientId: string; authorizeUrl: string; scopes: string }>;
  /** Defaults to the fork's PKCE code exchange (src/oauth/anthropic-oauth.ts). */
  exchangeCode?: (params: {
    code: string;
    codeVerifier: string;
    state: string;
    redirectUri: string;
  }) => Promise<TokenResponse>;
  client?: PluginClient;
}

function splitPastedCode(raw: string, expectedState: string): { code: string; state: string } {
  const value = raw.trim();
  const hashIndex = value.indexOf("#");
  if (hashIndex === -1) {
    return { code: value, state: expectedState };
  }

  const code = value.slice(0, hashIndex);
  const state = value.slice(hashIndex + 1);
  if (state && state !== expectedState) {
    throw new Error(`OAuth state mismatch: expected the pasted code in code#state form for state ${expectedState}`);
  }
  return { code, state: state || expectedState };
}

/**
 * Builds the v2.4.1 `authorize` handler. Reuses the fork's PKCE primitives and the
 * existing code-exchange routine; the exchanged account enters the pool store through
 * the fork's `AccountManager.addAccount` path (same route as the v1 auth UX).
 */
export function createAuthorize(deps: AuthorizeDeps = {}): () => Promise<IntegrationOAuthAuthorization> {
  const loadOAuthConfig = deps.loadOAuthConfig ?? (async () => await detectOAuthConfig());
  const exchangeCode = deps.exchangeCode ?? exchangeCodeForTokens;
  const client = deps.client ?? createMinimalClient();

  return async function authorize(): Promise<IntegrationOAuthAuthorization> {
    const config = await loadOAuthConfig();
    const { verifier, challenge } = generatePKCE();
    const state = generateState();

    const url = buildAuthorizeUrl({
      authorizeUrl: config.authorizeUrl,
      clientId: config.clientId,
      scopes: config.scopes,
      redirectUri: CODE_MODE_REDIRECT_URI,
      codeChallenge: challenge,
      state,
    });

    return {
      url,
      instructions:
        "Open the URL in a browser, sign in to the account to add, approve access, and paste the authorization code shown after approval (code#state).",
      mode: "code",
      callback: async (rawCode: string): Promise<CredentialOAuth> => {
        const { code, state: pastedState } = splitPastedCode(rawCode, state);

        const tokens = await exchangeCode({
          code,
          codeVerifier: verifier,
          state: pastedState,
          redirectUri: CODE_MODE_REDIRECT_URI,
        });

        const credential: CredentialOAuth = {
          type: "oauth",
          access: tokens.access_token,
          refresh: tokens.refresh_token ?? "",
          // The fork stores epoch ms: now + expires_in (seconds) * 1000 (src/oauth/anthropic-oauth.ts loginWithOAuth).
          expires: Date.now() + tokens.expires_in * 1000,
        };

        // Enter the pool through the fork's own account-creation path (owner login writes
        // the pool store; the credential surface is returned to the host from this value).
        // The manager is created with empty auth: `initialize` seeds `currentAuth` as a
        // bare account on an empty store, which would dedupe the addAccount below and
        // lose the email/metadata (multi-account-core account-manager initialize L137-143).
        if (credential.refresh) {
          const metadata: AccountMetadataPatch = {
            accountId: tokens.account?.uuid,
            accountUuid: tokens.account?.uuid,
          };
          const emptyAuth: CredentialOAuth = { type: "oauth", refresh: "", access: "", expires: 0 };
          const store = new AccountStore();
          const manager = await AccountManager.create(store, emptyAuth, client);
          await manager.addAccount(credential, tokens.account?.email_address, metadata);
        }

        return credential;
      },
    };
  };
}

export interface RefreshDeps {
  /** Defaults to the fork's mutex-guarded refresh routine (src/oauth/token.ts). */
  refreshTokenFn?: (
    currentRefreshToken: string,
    accountId: string,
    client: PluginClient,
  ) => Promise<TokenRefreshResult>;
  client?: PluginClient;
}

/**
 * Maps a v2.4.1 `Credential.OAuth` through the fork's refresh routine and updates the
 * matching pool store entry (fail-soft when the credential is not in the pool).
 */
export function createRefresh(deps: RefreshDeps = {}): (credential: CredentialOAuth) => Promise<CredentialOAuth> {
  const refreshTokenFn = deps.refreshTokenFn ?? refreshToken;
  const client = deps.client ?? createMinimalClient();

  return async function refresh(credential: CredentialOAuth): Promise<CredentialOAuth> {
    const store = new AccountStore();
    const storage = await store.load();
    const existing = storage.accounts.find((account) => account.refreshToken === credential.refresh);
    const accountId = existing?.uuid ?? credential.refresh;

    const result = await refreshTokenFn(credential.refresh, accountId, client);
    if (!result.ok) {
      throw new Error(`Token refresh failed${result.permanent ? " (permanent)" : ""}`);
    }

    const patch = result.patch;
    if (existing?.uuid) {
      await store.mutateAccount(existing.uuid, (account) => {
        account.accessToken = patch.accessToken;
        account.expiresAt = patch.expiresAt;
        if (patch.refreshToken) {
          account.refreshToken = patch.refreshToken;
        }
        account.consecutiveAuthFailures = 0;
      });
    }

    return {
      type: "oauth",
      access: patch.accessToken,
      refresh: patch.refreshToken ?? credential.refresh,
      expires: patch.expiresAt,
    };
  };
}
