<script setup lang="ts">
import { ref, watch } from 'vue';

import { useSelectionStore } from '@/features/selection/selectionStore';
import { buildingFactsAt, type BuildingFacts } from './luleaBuildingFacts';

const selection = useSelectionStore();
const facts = ref<BuildingFacts | null>(null);
const state = ref<'idle' | 'loading' | 'none' | 'error'>('idle');
let controller: AbortController | null = null;

watch(
  () => selection.current?.point,
  async (point) => {
    controller?.abort();
    facts.value = null;
    if (!point) {
      state.value = 'idle';
      return;
    }
    controller = new AbortController();
    state.value = 'loading';
    try {
      const result = await buildingFactsAt(point[0], point[1], controller.signal);
      facts.value = result;
      state.value = result ? 'idle' : 'none';
      // The national building id is a stable identity: use it for comments when the
      // selected object has none of its own (e.g. a part of the 3D mesh).
      const current = selection.current;
      if (result?.nationalId && current && !current.stableId && current.point === point) {
        selection.select({
          ...current,
          stableId: result.nationalId,
          name: result.address ?? result.purposes[0] ?? current.name,
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') state.value = 'error';
    }
  },
  { immediate: true },
);
</script>

<template>
  <section class="facts" aria-labelledby="facts-heading">
    <h4 id="facts-heading">About this building</h4>
    <p v-if="state === 'loading'" class="muted">Asking Luleå kommun…</p>
    <p v-else-if="state === 'none'" class="muted">Luleå kommun has no building registered at this spot.</p>
    <p v-else-if="state === 'error'" class="muted" role="alert">Luleå kommun's map service didn't answer.</p>

    <template v-if="facts">
      <dl>
        <template v-if="facts.address"><dt>Address</dt><dd>{{ facts.address }}</dd></template>
        <template v-if="facts.purposes.length || facts.registerPurpose">
          <dt>Purpose</dt>
          <dd>{{ facts.purposes.length ? facts.purposes.join(', ') : facts.registerPurpose }}</dd>
        </template>
        <template v-if="facts.mainBuilding !== null">
          <dt>Main building</dt>
          <dd>{{ facts.mainBuilding ? 'Yes' : 'No' }}</dd>
        </template>
        <template v-if="facts.constructionYear">
          <dt>Built</dt>
          <dd>{{ facts.constructionYear }}<template v-if="facts.extensionYear">, extended {{ facts.extensionYear }}</template></dd>
        </template>
      </dl>

      <template v-if="facts.heritage.length">
        <h5>Cultural heritage inventory</h5>
        <dl>
          <template v-for="h in facts.heritage" :key="h.label"><dt>{{ h.label }}</dt><dd>{{ h.value }}</dd></template>
        </dl>
        <p v-if="facts.heritageNote" class="note">{{ facts.heritageNote }}</p>
      </template>

      <p class="muted source">
        Live from Luleå kommun's map services; not stored by bimgis.
        <template v-if="facts.nationalId"><br />Building id (Lantmäteriet): <code>{{ facts.nationalId }}</code></template>
      </p>
    </template>
  </section>
</template>

<style scoped>
.facts {
  margin-top: 0.75rem;
  border-top: 1px solid #ddd;
}

h4 {
  margin: 0.5rem 0;
}

h5 {
  margin: 0.5rem 0 0.25rem;
}

dt {
  font-weight: 600;
  font-size: 0.85rem;
}

dd {
  margin: 0 0 0.35rem;
}

.note {
  font-size: 0.85rem;
  font-style: italic;
}

.muted {
  color: #6b7280;
  font-size: 0.8rem;
}

.source code {
  font-size: 0.75rem;
}
</style>
