<script setup lang="ts">
import type { Issue } from './validate';

defineProps<{ issues: Issue[] }>();
const emit = defineEmits<{ (e: 'focus', target: string): void }>();
</script>

<template>
  <ul v-if="issues.length" class="issues">
    <li v-for="(issue, i) in issues" :key="i" :class="issue.severity">
      <button type="button" @click="emit('focus', issue.target)">
        <span class="badge">{{ issue.severity === 'stop' ? 'Stops delivery' : 'Warning' }}</span>
        <code>{{ issue.rule }}</code>
        {{ issue.message }}
      </button>
    </li>
  </ul>
  <p v-else class="ok">No issues: the delivery meets Lantmäteriet's specification and the vägledning's rules.</p>
</template>

<style scoped>
.issues {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 220px;
  overflow: auto;
}

.issues button {
  width: 100%;
  padding: 0.3rem 0.4rem;
  border: none;
  border-left: 4px solid;
  background: none;
  text-align: left;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.stop button {
  border-color: #dc2626;
  background: #fef2f2;
}

.warning button {
  border-color: #f59e0b;
  background: #fffbeb;
}

.issues li + li {
  margin-top: 2px;
}

.badge {
  font-weight: 600;
  margin-right: 0.25rem;
}

code {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.ok {
  padding: 0.3rem 0.4rem;
  border-left: 4px solid #16a34a;
  background: #f0fdf4;
  font-size: 0.85rem;
}
</style>
