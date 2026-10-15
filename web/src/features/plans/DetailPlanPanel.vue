<script setup lang="ts">
import { computed, watch } from 'vue';

import { categoryOf, getTheme } from '@/features/layers/themes';
import { useSelectionStore } from '@/features/selection/selectionStore';
import type { PlanProvision } from './lmDetaljplan';
import { usePlansStore } from './plansStore';

const props = defineProps<{ url: string }>();

const plansStore = usePlansStore();
const selection = useSelectionStore();

watch(() => props.url, (url) => plansStore.load(url), { immediate: true });

const plan = computed(() => plansStore.plans[props.url] ?? null);
const error = computed(() => plansStore.errors[props.url] ?? null);
const status = computed(() => (plan.value ? categoryOf(getTheme('detaljplan'), plan.value.status) : null));

const useProvisions = computed(() => plan.value?.provisions.filter((p) => p.kind === 'användningsbestämmelse') ?? []);
const propertyProvisions = computed(() => plan.value?.provisions.filter((p) => p.kind !== 'användningsbestämmelse') ?? []);
const codeById = computed(() => new Map(plan.value?.provisions.map((p) => [p.id, p.code || p.wording]) ?? []));

const selectedId = computed(() => selection.current?.stableId ?? null);

function formatMonths(months: number): string {
  const [y, m] = [Math.floor(months / 12), months % 12];
  return [y && `${y} years`, m && `${m} months`].filter(Boolean).join(' ');
}

const UNIT_LABELS: Record<string, string> = { meter: 'm', kvadratmeter: 'm²', kubikmeter: 'm³', procent: '%', grader: '°', antal: '', år: 'år' };
const KIND_LABELS: Record<string, string> = { min: 'min', max: 'max', exakt: '' };

function numericValues(p: PlanProvision) {
  return p.values
    .filter((v) => v.datatyp === 'decimaltal')
    .map((v) => {
      const unit = v.enhet ? (UNIT_LABELS[v.enhet] ?? v.enhet) : '';
      const kind = v.vardetyp ? KIND_LABELS[v.vardetyp] : '';
      return `${v.beskrivning}: ${kind ? kind + ' ' : ''}${v.variabelvarde.replace('.', ',')}${unit ? ' ' + unit : ''}`;
    });
}

/** Comments then attach to the provision instead of the whole plan. */
function selectProvision(p: PlanProvision) {
  if (!selection.current) return;
  selection.select({
    ...selection.current,
    stableId: p.id,
    name: `${p.code ? p.code + ': ' : ''}${p.wording}`,
  });
}

function selectWholePlan() {
  if (!selection.current || !plan.value) return;
  selection.select({ ...selection.current, stableId: plan.value.id, name: plan.value.name });
}
</script>

<template>
  <div class="plan">
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-else-if="!plan">Loading plan…</p>

    <template v-else>
      <h4 class="name">{{ plan.name }}</h4>
      <p class="meta">
        <span class="status" :style="{ borderColor: status?.color }">{{ status?.label }}</span>
        <span v-if="plan.statusDate"> since {{ plan.statusDate }}</span>
        <span v-if="plan.caseNumber"> · {{ plan.caseNumber }}</span>
      </p>

      <p v-if="!plan.quality.complete" class="warning" role="note">
        <strong>Approximate data.</strong> {{ plan.quality.note }}
      </p>

      <p>{{ plan.purpose }}</p>

      <button v-if="selectedId !== plan.id" type="button" class="link" @click="selectWholePlan">
        Comment on the whole plan
      </button>

      <h4>Provisions <span class="muted">(select one to comment on it)</span></h4>
      <template v-for="group in [{ title: 'Use', items: useProvisions }, { title: 'Properties', items: propertyProvisions }]" :key="group.title">
        <h5>{{ group.title }}</h5>
        <ul class="provisions">
          <li v-for="p in group.items" :key="p.id" :class="{ selected: selectedId === p.id }">
            <button type="button" class="provision" :aria-pressed="selectedId === p.id" @click="selectProvision(p)">
              <span class="code">{{ p.code || '–' }}</span>
              <span>{{ p.wording }}</span>
            </button>
            <p v-if="numericValues(p).length" class="values">{{ numericValues(p).join(' · ') }}</p>
            <p v-if="p.regulates.length" class="muted">Applies to {{ p.regulates.map((id) => codeById.get(id)).join(', ') }}</p>
            <details v-if="p.motive">
              <summary>Why?</summary>
              <p>{{ p.motive }}</p>
            </details>
          </li>
        </ul>
      </template>

      <h4 v-if="plan.planningMaterial.length">Investigations and planning material</h4>
      <ul v-if="plan.planningMaterial.length" class="material">
        <li v-for="m in plan.planningMaterial" :key="m.name">
          {{ m.name }} <span class="muted">· {{ m.type ?? m.area }}<template v-if="m.date"> · {{ m.date }}</template></span>
        </li>
      </ul>

      <dl class="facts">
        <template v-if="plan.implementationMonths">
          <dt>Implementation time</dt>
          <dd>{{ formatMonths(plan.implementationMonths) }} from when the plan comes into force</dd>
        </template>
        <template v-if="plan.previousPlans.length">
          <dt>Replaces</dt>
          <dd>{{ plan.previousPlans.join(', ') }}</dd>
        </template>
        <template v-if="plan.planDescription">
          <dt>Planbeskrivning</dt>
          <dd>{{ plan.planDescription.name }}</dd>
        </template>
      </dl>
    </template>
  </div>
</template>

<style scoped>
.name {
  margin: 0 0 0.25rem;
}

.meta {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
}

.status {
  padding: 0 0.4rem;
  border-left: 4px solid;
  background: #f3f4f6;
}

.warning {
  padding: 0.4rem 0.6rem;
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
  font-size: 0.85rem;
}

.provisions,
.material {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem;
}

.provisions li {
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid #eee;
}

.provisions li.selected {
  background: #eef2ff;
}

.provision {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.code {
  flex: none;
  min-width: 2.5rem;
  font-weight: 700;
}

.values,
.muted {
  margin: 0.15rem 0 0 3rem;
  color: #555;
  font-size: 0.8rem;
}

details {
  margin-left: 3rem;
  font-size: 0.85rem;
}

.material li {
  padding: 0.15rem 0;
  font-size: 0.9rem;
}

.facts dt {
  font-weight: 600;
  font-size: 0.85rem;
}

.facts dd {
  margin: 0 0 0.4rem;
}

h5 {
  margin: 0.5rem 0 0.25rem;
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
