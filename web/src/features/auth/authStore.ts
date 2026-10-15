import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { User } from 'oidc-client-ts';

import { userManager } from './oidc';

export type Role = 'citizen' | 'official' | 'moderator';

/** The signed-in user as plain data. `username` is the public, pseudonymous display name. */
export interface AuthUser {
  id: string;
  username: string;
  email: string | null;
  roles: Role[];
}

interface ReturnState {
  returnTo?: string;
}

const KNOWN_ROLES: readonly Role[] = ['citizen', 'official', 'moderator'];

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const ready = ref(false);

  const isAuthenticated = computed(() => user.value !== null);

  function hasRole(role: Role): boolean {
    return user.value?.roles.includes(role) ?? false;
  }

  /** Restores a session from storage and keeps the store in sync with token renewals. */
  async function init(): Promise<void> {
    userManager.events.addUserLoaded((u) => {
      user.value = toAuthUser(u);
    });
    userManager.events.addUserUnloaded(() => {
      user.value = null;
    });
    userManager.events.addSilentRenewError(() => {
      user.value = null;
    });

    const existing = await userManager.getUser();
    user.value = existing && !existing.expired ? toAuthUser(existing) : null;
    ready.value = true;
  }

  function login(returnTo = currentPath()): Promise<void> {
    return userManager.signinRedirect({ state: { returnTo } satisfies ReturnState });
  }

  /** Opens the provider's registration page (OIDC `prompt=create`). */
  function register(returnTo = currentPath()): Promise<void> {
    return userManager.signinRedirect({ prompt: 'create', state: { returnTo } satisfies ReturnState });
  }

  /** Completes the redirect flow; returns where the user was before logging in. */
  async function completeLogin(): Promise<string> {
    const u = await userManager.signinRedirectCallback();
    user.value = toAuthUser(u);
    return (u.state as ReturnState | undefined)?.returnTo ?? '/';
  }

  function logout(): Promise<void> {
    return userManager.signoutRedirect();
  }

  return { user, ready, isAuthenticated, hasRole, init, login, register, completeLogin, logout };
});

function toAuthUser(u: User): AuthUser {
  const claims = u.profile;
  const roles = Array.isArray(claims.roles) ? claims.roles : [];
  return {
    id: claims.sub,
    username: claims.preferred_username ?? claims.sub,
    email: claims.email ?? null,
    roles: roles.filter((r): r is Role => KNOWN_ROLES.includes(r as Role)),
  };
}

function currentPath(): string {
  return window.location.pathname + window.location.search;
}
