import { createRouter, createWebHistory } from 'vue-router';

import MainLayout from './layouts/MainLayout.vue';
import { MODES, type ModeId } from './modes';
import AuthCallback from '@/features/auth/AuthCallback.vue';
import { CALLBACK_PATH } from '@/features/auth/oidc';

declare module 'vue-router' {
  interface RouteMeta {
    mode?: ModeId;
  }
}

/** The views are children of one layout, so the 3D viewer stays mounted when switching. */
const View = { render: () => null };

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', redirect: MODES.discover.path },
        { path: MODES.discover.path.slice(1), component: View, meta: { mode: 'discover' } },
        { path: MODES.participate.path.slice(1), component: View, meta: { mode: 'participate' } },
      ],
    },
    { path: CALLBACK_PATH, component: AuthCallback },
    { path: '/:pathMatch(.*)*', redirect: MODES.discover.path },
  ],
});
