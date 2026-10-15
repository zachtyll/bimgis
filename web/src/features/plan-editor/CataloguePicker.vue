<script setup lang="ts">
import { computed, ref } from 'vue';

import { searchCatalogue, type CatalogueEntry } from './catalogue';
import type { ProvisionKind } from './draft';

const props = defineProps<{ entries: CatalogueEntry[]; release: string | null }>();
const emit = defineEmits<{ (e: 'pick', entry: CatalogueEntry): void; (e: 'cancel'): void }>();

const query = ref('');
const kind = ref<ProvisionKind | ''>('användningsbestämmelse');
const MAX = 40;

const results = computed(() => searchCatalogue(props.entries, query.value, kind.value || undefined));
</script>

<template>
  <div class="picker">
    <div class="row">
      <input v-model="query" type="search" placeholder="Search, e.g. bostäder, nockhöjd, prickmark" aria-label="Search the catalogue" autofocus />
      <select v-model="kind" aria-label="Provision type">
        <option value="användningsbestämmelse">Use</option>
        <option value="egenskapsbestämmelse">Property</option>
        <option value="">All</option>
      </select>
    </div>
    <p class="muted">
      {{ results.length }} provisions · Boverket's planbestämmelsekatalog, release {{ release }}
    </p>
    <ul class="results">
      <li v-for="e in results.slice(0, MAX)" :key="e.id">
        <button type="button" @click="emit('pick', e)">
          <strong>{{ e.beteckning ?? '–' }}</strong>
          <span>{{ e.bestammelseformulering }}</span>
          <small>{{ e.anvandningsform }} · {{ e.kategori }}<template v-if="e.underkategori"> / {{ e.underkategori }}</template></small>
        </button>
      </li>
    </ul>
    <p v-if="results.length > MAX" class="muted">Refine the search to see more.</p>
    <button type="button" @click="emit('cancel')">Cancel</button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 0.25rem;
}

.row input {
  flex: 1;
}

.results {
  list-style: none;
  max-height: 320px;
  overflow: auto;
  margin: 0.25rem 0;
  padding: 0;
  border: 1px solid #e5e7eb;
}

.results button {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 0 0.5rem;
  width: 100%;
  padding: 0.35rem;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  background: none;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.results button:hover,
.results button:focus-visible {
  background: #eef2ff;
}

.results small {
  grid-column: 2;
  color: #6b7280;
}

.muted {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.8rem;
}
</style>
