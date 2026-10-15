import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Role } from '@/features/auth/authStore';

/**
 * The app's two views over the same 3D city:
 *  - discover: open to everyone; explore Luleå (buildings and their history, trees, what's on);
 *  - participate: for signed-in citizens; plans, comments and the planning tools.
 * They share one viewer, so switching keeps the camera, loaded data and (where the object
 * exists in both) the selection.
 */
export type ModeId = 'discover' | 'participate';

export interface Mode {
  id: ModeId;
  path: string;
  label: string;
  /** One line on what the view is for. */
  tagline: string;
  /** Roles that may use the view (any of them); open to all when absent. */
  roles?: Role[];
}

export const MODES: Record<ModeId, Mode> = {
  discover: {
    id: 'discover',
    path: '/discover',
    label: 'Discover Luleå',
    tagline: 'Explore the city: buildings and their stories, trees, and what’s on.',
  },
  participate: {
    id: 'participate',
    path: '/participate',
    label: 'Have your say',
    tagline: 'See what’s being planned, check it, and tell the municipality what you think.',
    // Officials take part too; every account gets the citizen role by default.
    roles: ['citizen', 'official'],
  },
};

/** The current view. Set from the route by MainLayout; read by features and the viewer. */
export const useModeStore = defineStore('mode', () => {
  const current = ref<ModeId>('discover');
  const mode = computed(() => MODES[current.value]);
  return { current, mode };
});

/** Whether a layer or feature tagged with `modes` belongs in a view (untagged: both). */
export function inMode(modes: readonly ModeId[] | undefined, mode: ModeId): boolean {
  return !modes || modes.includes(mode);
}
