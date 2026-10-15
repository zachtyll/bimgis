<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import type { SketchItem } from '@/viewer/drawing/SketchOverlay';
import { useViewer } from '@/viewer/useViewer';
import { renderWording, type CatalogueEntry } from './catalogue';
import CataloguePicker from './CataloguePicker.vue';
import { PLAN_STATUSES } from './draft';
import { area } from './geometry';
import IssueList from './IssueList.vue';
import { usePlanEditorStore } from './planEditorStore';
import ProvisionEditor from './ProvisionEditor.vue';

const editor = usePlanEditorStore();
const viewer = useViewer();
const picking = ref(false);
const draft = computed(() => editor.draft!);

const entries = computed(() => [...(editor.catalogue?.values() ?? [])]);
const label = (catalogueId: string, code: string) => code || editor.catalogue?.get(catalogueId)?.beteckning || '–';
const wordingOf = (id: string) => {
  const p = draft.value.provisions.find((x) => x.id === id);
  const e = p && editor.catalogue?.get(p.catalogueId);
  return p && e ? renderWording(e.bestammelseformulering, p.values) : '';
};

// Implementation time is stored in months (vägledning 2.3.10); edit it as years + months.
const implYears = computed({
  get: () => (draft.value.implementationMonths === null ? '' : Math.floor(draft.value.implementationMonths / 12)),
  set: (y) => setImpl(Number(y || 0), Number(implMonths.value || 0), y === '' && implMonths.value === ''),
});
const implMonths = computed({
  get: () => (draft.value.implementationMonths === null ? '' : draft.value.implementationMonths % 12),
  set: (m) => setImpl(Number(implYears.value || 0), Number(m || 0), m === '' && implYears.value === ''),
});
function setImpl(years: number, months: number, empty: boolean) {
  draft.value.implementationMonths = empty ? null : years * 12 + months;
  editor.touch();
}

function pick(entry: CatalogueEntry) {
  editor.addProvision(entry);
  picking.value = false;
}

function focus(target: string) {
  if (target !== 'plan' && target !== 'area') editor.selectedProvisionId = target;
}

// Keep the map's sketch in sync with the draft.
watch(
  () => [editor.draft, editor.selectedProvisionId] as const,
  () => {
    const d = editor.draft;
    const items: SketchItem[] = d
      ? [
          ...d.areas.map((g): SketchItem => ({ role: 'plan', polygon: g.polygon })),
          ...d.provisions.flatMap((p) =>
            p.geometries.map((g): SketchItem => ({
              role: p.id === editor.selectedProvisionId ? 'selected' : p.kind === 'användningsbestämmelse' ? 'use' : 'property',
              polygon: g.polygon,
            })),
          ),
        ]
      : [];
    viewer.value?.setSketch(items);
  },
  { deep: true, immediate: true },
);
onBeforeUnmount(() => viewer.value?.setSketch([]));

function close() {
  if (editor.dirty && !window.confirm('Close without saving your changes?')) return;
  editor.close();
}
</script>

<template>
  <section class="editor" aria-label="Plan editor">
    <header class="head">
      <div>
        <h3>{{ draft.name || 'New detaljplan' }}</h3>
        <p class="muted">
          {{ editor.serverVersion ? `Version ${editor.serverVersion}` : 'Not saved yet' }}<template v-if="editor.dirty"> · unsaved changes</template>
        </p>
      </div>
      <button type="button" class="link" @click="close">Close</button>
    </header>

    <div class="toolbar">
      <button type="button" class="primary" :disabled="editor.saving || !draft.name.trim()" @click="editor.save()">
        {{ editor.saving ? 'Saving…' : 'Save' }}
      </button>
      <button type="button" :disabled="editor.stopCount > 0" :title="editor.stopCount ? 'Fix the issues that stop delivery first' : ''" @click="editor.download()">
        Download for Lantmäteriet
      </button>
    </div>
    <p v-if="editor.message" :class="['message', editor.message.kind]" role="status">{{ editor.message.text }}</p>

    <details open>
      <summary>
        Check against Lantmäteriet's specification
        <span v-if="editor.stopCount" class="count stop">{{ editor.stopCount }} stop</span>
        <span v-if="editor.warningCount" class="count warn">{{ editor.warningCount }} warning</span>
      </summary>
      <IssueList :issues="editor.issues" @focus="focus" />
    </details>

    <details open>
      <summary>Plan</summary>
      <div class="form" @input="editor.touch()" @change="editor.touch()">
        <label>Name <input v-model="draft.name" type="text" placeholder="Detaljplan för del av …" /></label>
        <label>Purpose (syfte) <textarea v-model="draft.purpose" rows="3" /></label>
        <div class="grid">
          <label>
            Status
            <select v-model="draft.status">
              <option v-for="s in PLAN_STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label>Started <input v-model="draft.startedDate" type="date" /></label>
          <label>Case number <input v-model="draft.caseNumber" type="text" placeholder="KLF2026/…" /></label>
          <label>Designation <input v-model="draft.designation" type="text" placeholder="at laga kraft" /></label>
        </div>
        <p class="muted">Municipality: {{ draft.municipality }}</p>
      </div>
    </details>

    <details open>
      <summary>Plan area <span class="muted">({{ draft.areas.length }})</span></summary>
      <ul class="list">
        <li v-for="g in draft.areas" :key="g.id">
          {{ area(g.polygon).toFixed(0) }} m²
          <button type="button" class="link" @click="editor.removeGeometry(draft.areas, g.id)">Remove</button>
        </li>
      </ul>
      <button v-if="editor.drawing !== 'area'" type="button" :disabled="!!editor.drawing" @click="editor.drawInto('area')">
        Draw plan area
      </button>
      <button v-else type="button" @click="editor.cancelDrawing()">Cancel drawing</button>
      <p v-if="editor.drawing" class="hint">
        Click to add points · click the first point, double-click or press Enter to finish · Backspace undoes · Esc cancels.
        Points snap to existing corners and edges.
      </p>
    </details>

    <details open>
      <summary>Provisions <span class="muted">({{ draft.provisions.length }})</span></summary>
      <ul class="provisions">
        <li v-for="p in draft.provisions" :key="p.id" :class="{ selected: p.id === editor.selectedProvisionId }">
          <button type="button" class="row" @click="editor.selectedProvisionId = editor.selectedProvisionId === p.id ? null : p.id">
            <strong>{{ label(p.catalogueId, p.code) }}</strong>
            <span>{{ wordingOf(p.id) }}</span>
            <small>{{ p.geometries.length }} area(s)</small>
          </button>
          <div v-if="p.id === editor.selectedProvisionId" class="detail">
            <ProvisionEditor :provision="p" />
            <button type="button" class="link danger" @click="editor.removeProvision(p.id)">Remove provision</button>
          </div>
        </li>
      </ul>
      <CataloguePicker v-if="picking" :entries="entries" :release="editor.catalogueRelease" @pick="pick" @cancel="picking = false" />
      <button v-else type="button" @click="picking = true">Add provision from the catalogue</button>
    </details>

    <details>
      <summary>Decision and documents</summary>
      <div class="form grid" @input="editor.touch()" @change="editor.touch()">
        <label>
          Decision type
          <select v-model="draft.decisionType">
            <option value="">–</option>
            <option>antagande av ny detaljplan</option>
            <option>antagande om ändring</option>
            <option>antagande om upphävande</option>
            <option>beslut om avslut</option>
          </select>
        </label>
        <label>
          Adopted by
          <select v-model="draft.body">
            <option value="">–</option>
            <option>kommunfullmäktige</option>
            <option>kommunstyrelse</option>
            <option>byggnadsnämnd enligt PBL</option>
          </select>
        </label>
        <label>Adopted <input v-model="draft.adoptedDate" type="date" /></label>
        <label>Laga kraft <input v-model="draft.legalForceDate" type="date" /></label>
        <label>Implementation time, years <input v-model="implYears" type="number" min="0" max="15" /></label>
        <label>…and months <input v-model="implMonths" type="number" min="0" max="11" /></label>
        <label>Implementation starts <input v-model="draft.implementationStarts" type="date" /></label>
        <label>Council case number <input v-model="draft.councilCaseNumber" type="text" /></label>
        <label class="wide">Replaces plans (comma separated) <input v-model="draft.previousPlans" type="text" placeholder="A068" /></label>
        <label class="wide">Planbeskrivning (link) <input v-model="draft.planDescriptionUrl" type="url" placeholder="https://" /></label>
        <label class="wide">Plankarta (link) <input v-model="draft.plankartaUrl" type="url" placeholder="https://" /></label>
        <label class="wide">Decision protocol (link) <input v-model="draft.protocolUrl" type="url" placeholder="https://" /></label>
      </div>
    </details>

    <details>
      <summary>Quality</summary>
      <div class="form" @input="editor.touch()" @change="editor.touch()">
        <label>
          Usability
          <select v-model="draft.quality.usability">
            <option value="god">god</option>
            <option value="medel">medel</option>
            <option value="låg">låg</option>
          </select>
        </label>
        <label>Why <input v-model="draft.quality.usabilityNote" type="text" /></label>
        <label class="inline"><input v-model="draft.quality.complete" type="checkbox" /> Digitally complete</label>
        <label class="inline"><input v-model="draft.quality.checkedBasemap" type="checkbox" /> Basemap checked before adoption</label>
        <label class="inline"><input v-model="draft.quality.correctedBoundaries" type="checkbox" /> Boundaries corrected after laga kraft</label>
      </div>
    </details>
  </section>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.head h3 {
  margin: 0.25rem 0 0;
}

.toolbar {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.primary {
  font-weight: 600;
}

details {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.4rem;
}

summary {
  cursor: pointer;
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}

.grid .wide {
  grid-column: 1 / -1;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

label.inline {
  flex-direction: row;
  gap: 0.3rem;
}

.provisions,
.list {
  list-style: none;
  margin: 0.4rem 0;
  padding: 0;
}

.provisions > li {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.provisions > li.selected {
  border-color: #e11d48;
}

.row {
  display: grid;
  grid-template-columns: 3rem 1fr auto;
  gap: 0.4rem;
  width: 100%;
  padding: 0.35rem;
  border: none;
  background: none;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.row small {
  color: #6b7280;
}

.detail {
  padding: 0.4rem;
  border-top: 1px solid #e5e7eb;
}

.count {
  margin-left: 0.4rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.count.stop {
  background: #fee2e2;
  color: #991b1b;
}

.count.warn {
  background: #fef3c7;
  color: #92400e;
}

.message {
  margin: 0;
  padding: 0.3rem 0.4rem;
  font-size: 0.85rem;
}

.message.info {
  background: #eff6ff;
}

.message.error {
  background: #fef2f2;
  color: #991b1b;
}

.hint,
.muted {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: normal;
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: #1d4ed8;
  text-decoration: underline;
  cursor: pointer;
}

.link.danger {
  color: #b91c1c;
}
</style>
