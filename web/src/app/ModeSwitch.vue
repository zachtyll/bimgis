<script setup lang="ts">
import { useAuthStore } from '@/features/auth/authStore';
import { MODES, useModeStore, type Mode } from './modes';

const mode = useModeStore();
const auth = useAuthStore();

const locked = (m: Mode) => !!m.roles && !m.roles.some((r) => auth.hasRole(r));
const views = [MODES.discover, MODES.participate];
</script>

<template>
  <nav class="modes" aria-label="Views">
    <RouterLink
      v-for="m in views"
      :key="m.id"
      :to="m.path"
      class="mode"
      :class="[m.id, { active: mode.current === m.id }]"
      :aria-current="mode.current === m.id ? 'page' : undefined"
      :title="m.tagline"
    >
      {{ m.label }}
      <span v-if="locked(m)" class="lock">sign in</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.modes {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.mode {
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  color: #334155;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.mode:hover {
  background: #e2e8f0;
}

.mode:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.mode.active.discover {
  background: var(--accent-discover);
  color: #fff;
}

.mode.active.participate {
  background: var(--accent-participate);
  color: #fff;
}

.lock {
  margin-left: 0.35rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.08);
}

.active .lock {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 640px) {
  .mode {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style>
