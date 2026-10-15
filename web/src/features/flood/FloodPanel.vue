<script setup lang="ts">
import { computed } from 'vue';

import { RAIN_CHOICES, useFloodStore } from './floodStore';

const flood = useFloodStore();

const fmt = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 });
const m2 = (v: number) => (v >= 10_000 ? `${(v / 1_000_000).toFixed(2)} km²` : `${fmt.format(v)} m²`);

const summary = computed(() => {
  const s = flood.stats;
  const c = flood.circle;
  if (!s || !c) return null;
  const area = Math.PI * c.radius ** 2;
  return {
    rain: `${flood.ranWithMm} mm on ${m2(area)} (${fmt.format(s.rainVolume)} m³)`,
    ponding: `${m2(s.area10cm)} deeper than 10 cm, ${m2(s.area30cm)} deeper than 30 cm`,
    deepest: s.maxDepth >= 0.05 ? `${s.maxDepth.toFixed(2)} m (red ring)` : 'no real ponding',
    runoff:
      s.rainVolume > 0
        ? `${Math.round((100 * s.outflowVolume) / s.rainVolume)}% ran out of the area` +
          (s.drainedVolume > 0 ? `, ${Math.round((100 * s.drainedVolume) / s.rainVolume)}% into enclosed courtyards (assumed drained)` : '')
        : '',
  };
});
</script>

<template>
  <section class="flood" aria-label="Flood check">
    <template v-if="flood.phase !== 'idle'">
      <header>
        <strong>Flood check</strong>
        <button type="button" class="close" aria-label="Close the flood check" @click="flood.clear()">✕</button>
      </header>

      <label v-if="flood.phase === 'placing' || flood.phase === 'done' || flood.phase === 'error'" class="rain">
        Rain
        <select v-model.number="flood.rainMm">
          <option v-for="c in RAIN_CHOICES" :key="c.mm" :value="c.mm">{{ c.label }}</option>
        </select>
      </label>

      <p v-if="flood.phase === 'placing'" class="hint" role="status">
        <template v-if="flood.radius === null">Click the centre of the area to check.</template>
        <template v-else>Radius <strong>{{ flood.radius }} m</strong>: move to size it, click to let it rain.</template>
        <br /><span class="muted">Esc cancels.</span>
      </p>

      <p v-else-if="flood.phase === 'loading'" class="hint" role="status">Raining… reading the ground and buildings.</p>

      <div v-else-if="flood.phase === 'running'" role="status">
        <p class="hint">{{ flood.progress < DEFAULT_RAIN_SHARE ? 'Raining…' : 'Rain has stopped; water settling…' }}</p>
        <progress :value="flood.progress" max="1" />
      </div>

      <p v-else-if="flood.phase === 'error'" class="hint" role="alert">{{ flood.error }}</p>

      <dl v-if="summary && (flood.phase === 'running' || flood.phase === 'done')">
        <dt>Rain</dt>
        <dd>{{ summary.rain }}</dd>
        <dt>Standing water</dt>
        <dd>{{ summary.ponding }}</dd>
        <dt>Deepest</dt>
        <dd>{{ summary.deepest }}</dd>
        <dt>Runoff</dt>
        <dd>{{ summary.runoff }}</dd>
      </dl>

      <div v-if="flood.phase === 'done' || flood.phase === 'error'" class="actions">
        <button type="button" @click="flood.rerun()">Run again</button>
        <button type="button" @click="flood.start()">New circle</button>
        <button type="button" @click="flood.clear()">Clear</button>
      </div>

      <p v-if="flood.phase === 'done'" class="muted legend">
        Arrows: where water runs (darker and wider = more water). Blue: standing water (darker = deeper).
        Indicative only: water follows the ground and runs around buildings; drains, soil and timing are
        not modelled. Ground and buildings: Luleå kommun (live).
      </p>
    </template>
  </section>
</template>

<script lang="ts">
import { DEFAULT_PARAMS } from './simulation';

/** Share of the run during which it rains. */
const DEFAULT_RAIN_SHARE = DEFAULT_PARAMS.rainSteps / (DEFAULT_PARAMS.rainSteps + DEFAULT_PARAMS.settleSteps);
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.close {
  border: none;
  background: none;
  cursor: pointer;
}

.rain {
  display: block;
  margin: 0.4rem 0;
}

.rain select {
  max-width: 100%;
}

.hint {
  margin: 0.4rem 0;
}

progress {
  width: 100%;
}

dl {
  margin: 0.4rem 0 0;
}

dt {
  font-weight: 600;
  font-size: 0.8rem;
}

dd {
  margin: 0 0 0.3rem;
}

.actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.muted {
  color: #6b7280;
  font-size: 0.78rem;
}

.legend {
  margin: 0.5rem 0 0;
}
</style>
