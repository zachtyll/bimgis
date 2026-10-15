<script setup lang="ts">
import { computed } from 'vue';

import { renderWording } from './catalogue';
import { LM_UNITS, type DraftProvision } from './draft';
import { area } from './geometry';
import { usePlanEditorStore } from './planEditorStore';

const props = defineProps<{ provision: DraftProvision }>();
const editor = usePlanEditorStore();

const entry = computed(() => editor.catalogue?.get(props.provision.catalogueId) ?? null);
const wording = computed(() => (entry.value ? renderWording(entry.value.bestammelseformulering, props.provision.values) : ''));
const uses = computed(() => editor.draft?.provisions.filter((p) => p.kind === 'användningsbestämmelse') ?? []);
const drawingHere = computed(() => editor.drawing === props.provision.id);

function toggleRegulates(id: string, on: boolean) {
  const list = props.provision.regulates;
  if (on && !list.includes(id)) list.push(id);
  if (!on) list.splice(list.indexOf(id), 1);
  editor.touch();
}
</script>

<template>
  <div class="provision-editor" @input="editor.touch()" @change="editor.touch()">
    <p class="template">
      <span class="muted">Catalogue:</span> {{ entry?.bestammelseformulering }}
      <br />
      <span class="muted">{{ entry?.anvandningsform }} · {{ entry?.kategori }}</span>
    </p>

    <label>
      Label on the plankarta
      <input v-model="provision.code" type="text" placeholder="e.g. B1, h3" />
    </label>

    <fieldset v-if="provision.values.length">
      <legend>Values <span class="muted">(leave empty to omit from the wording)</span></legend>
      <div v-for="v in provision.values" :key="v.variable" class="value">
        <label>
          {{ v.variable }}
          <input v-model="v.value" :inputmode="v.type === 'decimaltal' ? 'decimal' : 'text'" type="text" />
        </label>
        <template v-if="v.type === 'decimaltal'">
          <select v-model="v.kind" aria-label="Value type">
            <option value="max">max</option>
            <option value="min">min</option>
            <option value="exakt">exakt</option>
          </select>
          <select v-model="v.unit" aria-label="Unit">
            <option v-for="u in LM_UNITS" :key="u" :value="u">{{ u }}</option>
          </select>
        </template>
      </div>
    </fieldset>

    <p class="wording">
      <span class="muted">Legally binding wording:</span>
      <strong>{{ wording || '–' }}</strong>
    </p>

    <label>
      Motive <span class="muted">(why this provision, in relation to the plan's purpose)</span>
      <textarea v-model="provision.motive" rows="3" />
    </label>

    <fieldset v-if="provision.kind === 'egenskapsbestämmelse' && uses.length">
      <legend>Regulates</legend>
      <label v-for="u in uses" :key="u.id" class="inline">
        <input
          type="checkbox"
          :checked="provision.regulates.includes(u.id)"
          @change="toggleRegulates(u.id, ($event.target as HTMLInputElement).checked)"
        />
        {{ u.code || editor.catalogue?.get(u.catalogueId)?.beteckning }}
      </label>
    </fieldset>

    <fieldset>
      <legend>Where it applies</legend>
      <ul class="geoms">
        <li v-for="g in provision.geometries" :key="g.id">
          Area {{ area(g.polygon).toFixed(0) }} m²
          <button type="button" class="link" @click="editor.removeGeometry(provision.geometries, g.id)">Remove</button>
        </li>
      </ul>
      <div class="actions">
        <button v-if="!drawingHere" type="button" :disabled="!!editor.drawing" @click="editor.drawInto(provision.id)">
          Draw an area
        </button>
        <button v-else type="button" @click="editor.cancelDrawing()">Cancel drawing</button>
        <button type="button" :disabled="!editor.draft?.areas.length" @click="editor.usePlanArea(provision.id)">
          Use the whole plan area
        </button>
      </div>
    </fieldset>
  </div>
</template>

<style scoped>
.provision-editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

label.inline {
  flex-direction: row;
  gap: 0.25rem;
}

.value {
  display: flex;
  gap: 0.25rem;
  align-items: flex-end;
}

.value label {
  flex: 1;
}

fieldset {
  margin: 0;
  padding: 0.4rem;
  border: 1px solid #e5e7eb;
}

legend {
  font-size: 0.85rem;
  font-weight: 600;
}

.template,
.wording {
  margin: 0;
  font-size: 0.85rem;
}

.wording strong {
  display: block;
}

.muted {
  color: #6b7280;
  font-weight: normal;
}

.geoms {
  margin: 0 0 0.25rem;
  padding-left: 1rem;
  font-size: 0.85rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
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
