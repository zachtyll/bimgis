<script setup lang="ts">
import { onMounted, watch } from 'vue';

import { useAuthStore } from '@/features/auth/authStore';
import { usePlanEditorStore } from '@/features/plan-editor/planEditorStore';
import { useSavedPlansStore } from './savedPlansStore';

const auth = useAuthStore();
const saved = useSavedPlansStore();
const editor = usePlanEditorStore();

onMounted(() => saved.refresh());
// Officials also see plans that are still "påbörjad", so reload after login/logout.
watch(() => auth.user?.id, () => saved.refresh());

async function edit(id: string) {
  if (editor.draft && editor.dirty && !window.confirm('Discard unsaved changes in the open plan?')) return;
  await editor.open(id);
}
</script>

<template>
  <section class="saved-plans">
    <h3>Plans in the platform</h3>
    <p v-if="saved.error" class="muted" role="alert">{{ saved.error }}</p>
    <ul v-if="saved.plans.length" class="list">
      <li v-for="p in saved.plans" :key="p.id">
        <span>{{ p.name }} <span class="muted">· {{ p.status }} · v{{ p.version }}</span></span>
        <button v-if="auth.hasRole('official')" type="button" class="link" @click="edit(p.id)">Edit</button>
      </li>
    </ul>
    <p v-else class="muted">No plans yet.</p>
    <button v-if="auth.hasRole('official')" type="button" :disabled="!!editor.draft" @click="editor.newPlan()">
      New detaljplan
    </button>
  </section>
</template>

<style scoped>
.saved-plans h3 {
  margin: 0.5rem 0 0.25rem;
  font-size: 0.95rem;
}

.list {
  list-style: none;
  margin: 0 0 0.4rem;
  padding: 0;
}

.list li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.15rem 0;
}

.muted {
  color: #6b7280;
  font-size: 0.8rem;
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: #1d4ed8;
  text-decoration: underline;
  cursor: pointer;
}
</style>
