<script setup lang="ts">
import { computed } from 'vue';

import { useAuthStore } from '@/features/auth/authStore';
import { useLayersStore } from '@/features/layers/layersStore';
import { useSelectionStore } from '@/features/selection/selectionStore';
import { inMode, MODES } from './modes';

/**
 * The bridge from discovering to taking part: for a selected object that also exists in
 * "Have your say" (buildings, trees), go there with it still selected.
 */
const selection = useSelectionStore();
const layers = useLayersStore();
const auth = useAuthStore();

const available = computed(() => {
  const layer = layers.layers.find((l) => l.id === selection.current?.layerId);
  return !!layer && inMode(layer.modes, 'participate');
});
const needsSignIn = computed(() => !MODES.participate.roles?.some((r) => auth.hasRole(r)));
</script>

<template>
  <RouterLink v-if="available" :to="MODES.participate.path" class="cta">
    Have your say about this
    <span class="sub">{{ needsSignIn ? 'Comment and follow plans (sign-in needed)' : 'Comment and see what’s planned here' }}</span>
  </RouterLink>
</template>

<style scoped>
.cta {
  display: block;
  margin: 0.75rem 0;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  background: var(--accent-participate);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.cta:hover {
  filter: brightness(1.1);
}

.cta:focus-visible {
  outline: 2px solid #1e1b4b;
  outline-offset: 2px;
}

.sub {
  display: block;
  font-weight: 400;
  font-size: 0.8rem;
  opacity: 0.9;
}
</style>
