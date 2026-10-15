import { userManager } from '@/features/auth/oidc';

/** fetch() that attaches the user's access token, if signed in. Backends validate it via OIDC. */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const user = await userManager.getUser();
  const headers = new Headers(init.headers);
  if (user && !user.expired) {
    headers.set('Authorization', `Bearer ${user.access_token}`);
  }
  return fetch(input, { ...init, headers });
}
