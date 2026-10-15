<script setup lang="ts">
import { computed } from 'vue';

import { useLayersStore } from '@/features/layers/layersStore';
import { formatField, getTheme } from '@/features/layers/themes';
import DetailPlanPanel from '@/features/plans/DetailPlanPanel.vue';
import BuildingFactsPanel from '@/features/buildings/BuildingFactsPanel.vue';
import EventsPanel from '@/features/events/EventsPanel.vue';
import { useSelectionStore } from './selectionStore';

const selection = useSelectionStore();
const layers = useLayersStore();

const layer = computed(() => layers.layers.find((l) => l.id === selection.current?.layerId) ?? null);

/** Readable fields when the layer's theme defines them; null means "show raw properties". */
const fields = computed(() => {
  const current = selection.current;
  const themeId = layer.value?.themeId;
  if (!current || !themeId) return null;
  const theme = getTheme(themeId);
  if (!theme.fields) return null;
  return theme.fields
    .map((f) => ({ ...f, value: formatField(theme, f, current.properties[f.property]) }))
    .filter((f) => f.value !== null);
});

const isSafeLink = (value: string) => /^https:\/\//i.test(value);
</script>

<template>
  <section>
    <h3>Element info</h3>
    <p v-if="!selection.current">Click an object in the view to see its properties.</p>
    <template v-else>
      <p class="layer-name">{{ layer?.name }}</p>

      <DetailPlanPanel v-if="layer?.kind === 'detaljplan'" :url="layer.url" />

      <template v-else-if="layer?.kind === 'events'">
        <h4 class="venue">{{ selection.current.name }}</h4>
        <EventsPanel
          :url="layer.url"
          :venue-id="selection.current.properties.venueId ?? null"
          :venue-name="selection.current.name"
        />
      </template>

      <dl v-else-if="fields">
        <template v-for="f in fields" :key="f.property">
          <dt>{{ f.label }}</dt>
          <dd>
            <a v-if="f.format === 'link' && isSafeLink(f.value!)" :href="f.value!" target="_blank" rel="noopener">
              Open the municipality's page
            </a>
            <template v-else>{{ f.value }}</template>
          </dd>
        </template>
      </dl>

      <template v-else-if="layer?.kind !== 'i3s'">
        <dl>
          <dt>Name</dt>
          <dd>{{ selection.current.name ?? 'N/A' }}</dd>
          <dt>Type</dt>
          <dd>{{ selection.current.ifcClass ?? 'Unknown' }}</dd>
          <dt>GlobalId</dt>
          <dd>{{ selection.current.globalId ?? 'N/A' }}</dd>
        </dl>
        <table>
          <tbody>
            <tr v-for="(value, key) in selection.current.properties" :key="key">
              <td><code>{{ key }}</code></td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </template>

      <BuildingFactsPanel v-if="layer?.buildingFacts" />

      <button type="button" @click="selection.clear()">Clear selection</button>
    </template>
  </section>
</template>

<style scoped>
.layer-name {
  margin-top: 0;
  color: #555;
  font-size: 0.85rem;
}

dt {
  font-weight: 600;
  font-size: 0.85rem;
}

dd {
  margin: 0 0 0.4rem 0;
}
</style>
