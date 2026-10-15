<script setup lang="ts">
import { MEASURE_TOOLS, useMeasureStore } from './measureStore';

const measure = useMeasureStore();

function copy(rows: { label: string; value: string }[], title: string) {
  const text = [title, ...rows.map((r) => `${r.label}: ${r.value}`)].join('\n');
  void navigator.clipboard?.writeText(text.replace(/ | /g, ' '));
}
</script>

<template>
  <div class="measure">
    <div class="bar" role="toolbar" aria-label="Measuring tools">
      <span class="heading">Measure</span>
      <button
        v-for="t in MEASURE_TOOLS"
        :key="t.kind"
        type="button"
        :title="t.title"
        :aria-pressed="measure.active === t.kind"
        :class="{ on: measure.active === t.kind }"
        @click="measure.toggle(t.kind)"
      >
        {{ t.label }}
      </button>
    </div>

    <section v-if="measure.active || measure.results.length" class="card" aria-live="polite">
      <template v-if="measure.active">
        <p class="hint">{{ measure.hint }}</p>
        <dl v-if="measure.live" class="rows">
          <template v-for="r in measure.live" :key="r.label">
            <dt>{{ r.label }}</dt>
            <dd>{{ r.value }}</dd>
          </template>
        </dl>
        <button type="button" class="link" @click="measure.stop()">Stop measuring (Esc cancels a measurement)</button>
      </template>

      <template v-if="measure.results.length">
        <h4>Measurements</h4>
        <ul class="results">
          <li v-for="r in measure.results" :key="r.id">
            <div class="result-head">
              <strong>{{ r.title }}</strong>
              <span>
                <button type="button" class="icon" :aria-label="`Copy ${r.title}`" title="Copy" @click="copy(r.rows, r.title)">⧉</button>
                <button type="button" class="icon" :aria-label="`Remove ${r.title}`" title="Remove" @click="measure.remove(r.id)">✕</button>
              </span>
            </div>
            <dl class="rows">
              <template v-for="row in r.rows" :key="row.label">
                <dt>{{ row.label }}</dt>
                <dd>{{ row.value }}</dd>
              </template>
            </dl>
          </li>
        </ul>
        <button type="button" class="link" @click="measure.clear()">Remove all measurements</button>
      </template>
    </section>
  </div>
</template>

<style scoped>
.measure {
  position: absolute;
  top: 10px;
  right: calc(var(--dock-right, 0px) + 44px);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  max-height: calc(100% - 20px);
}

.bar {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  align-items: center;
}

.heading {
  padding: 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.bar button {
  padding: 0.3rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: none;
  font-size: 0.85rem;
  cursor: pointer;
}

.bar button:hover {
  background: #f1f5f9;
}

.bar button.on {
  background: #f59e0b;
  border-color: #b45309;
  color: #111827;
  font-weight: 600;
}

.bar button:focus-visible,
.card button:focus-visible {
  outline: 2px solid #b45309;
  outline-offset: 1px;
}

.card {
  width: min(320px, calc(100vw - 32px));
  overflow: auto;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  font-size: 0.85rem;
}

.hint {
  margin: 0 0 0.4rem;
  color: #334155;
}

h4 {
  margin: 0.5rem 0 0.25rem;
}

.rows {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.1rem 0.6rem;
  margin: 0.2rem 0;
}

.rows dt {
  color: #475569;
}

.rows dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.results {
  list-style: none;
  padding: 0;
  margin: 0;
}

.results li {
  padding: 0.3rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.result-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0 0.2rem;
}

.link {
  border: none;
  background: none;
  padding: 0;
  margin-top: 0.3rem;
  color: #1d4ed8;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.8rem;
}

@media (max-width: 760px) {
  .bar {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
