import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

// Public client settings (not secrets). Override per environment with VITE_OIDC_* vars.
const authority = import.meta.env.VITE_OIDC_AUTHORITY ?? 'http://localhost:8180/realms/bimgis';
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID ?? 'bimgis-web';

export const CALLBACK_PATH = '/auth/callback';

/**
 * Authorization Code + PKCE against the platform's OIDC provider (Keycloak in dev).
 * Kept outside Pinia: the store only holds the plain user profile.
 */
export const userManager = new UserManager({
  authority,
  client_id: clientId,
  redirect_uri: `${window.location.origin}${CALLBACK_PATH}`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});
