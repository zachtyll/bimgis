<script setup lang="ts">
import { daysOf, EVENT_WINDOWS } from '@/features/events/eventsApi';
import { useModeStore } from '@/app/modes';
import LayerLegend from './LayerLegend.vue';
import { useLayersStore } from './layersStore';

const store = useLayersStore();
const mode = useModeStore();

function onFileChange(evt: Event) {
  const input = evt.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) store.addIfcFile(file);
  input.value = '';
}
</script>

<template>
  <section>
    <ul class="layers">
      <li v-for="layer in store.inView" :key="layer.id">
        <div class="row">
          <label>
            <input
              type="checkbox"
              :checked="layer.visible"
              @change="store.setVisible(layer.id, ($event.target as HTMLInputElement).checked)"
            />
            {{ layer.name }}
          </label>
          <button type="button" :aria-label="`Remove ${layer.name}`" @click="store.remove(layer.id)">✕</button>
        </div>
        <label v-if="layer.kind === 'i3s' && layer.visible" class="option">
          <input
            type="checkbox"
            :checked="layer.textures ?? false"
            @change="store.setTextures(layer.id, ($event.target as HTMLInputElement).checked)"
          />
          Photo textures
        </label>
        <label v-if="layer.kind === 'events' && layer.visible" class="option">
          Next
          <select
            :value="daysOf(layer.url)"
            @change="store.setEventWindow(layer.id, Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="d in EVENT_WINDOWS" :key="d" :value="d">{{ d === 365 ? 'year' : `${d} days` }}</option>
          </select>
        </label>
        <LayerLegend v-if="layer.visible && layer.themeId" :theme-id="layer.themeId" />
      </li>
    </ul>
    <label v-if="mode.current === 'participate'">
      Open IFC file
      <input type="file" accept=".ifc" @change="onFileChange" />
    </label>
  </section>
</template>

<style scoped>
.layers {
  list-style: none;
  padding: 0;
}

.layers .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layers .option {
  display: block;
  margin-left: 1.5rem;
  font-size: 0.85rem;
}
</style>
