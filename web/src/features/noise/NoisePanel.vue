<script setup lang="ts">
import { computed } from 'vue';

import { emission } from './nordic';
import { INSULATION_CHOICES, useNoiseStore } from './noiseStore';
import { legend, METRIC_LABEL, type NoiseMetric } from './scale';

const noise = useNoiseStore();

const scale = computed(() => legend(noise.metric));
const mark = (ok: boolean | null) => (ok === null ? '–' : ok ? '✓' : '✗');
const markLabel = (ok: boolean | null) => (ok === null ? 'not needed' : ok ? 'met' : 'not met');
const leq10 = (row: (typeof noise.rows)[number]) => Math.round(emission(row).leq10);

function setNumber(row: (typeof noise.rows)[number], field: 'adt' | 'speed' | 'heavyPct', evt: Event) {
  const value = Number((evt.target as HTMLInputElement).value);
  if (!Number.isFinite(value) || value < 0) return;
  row[field] = value;
  noise.edited(row);
}

const metrics: NoiseMetric[] = ['leq', 'lmax'];
</script>

<template>
  <section aria-label="Noise check">
    <header>
      <strong>Noise check</strong>
      <button type="button" class="close" aria-label="Close the noise check" @click="noise.clear()">✕</button>
    </header>

    <p v-if="noise.phase === 'picking'" class="hint" role="status">Click a building to check road traffic noise at its facades.</p>
    <p v-else-if="noise.phase === 'loading'" class="hint" role="status">Reading the building, streets and surroundings…</p>
    <p v-else-if="noise.phase === 'error'" class="hint" role="alert">{{ noise.error }}</p>

    <template v-if="noise.building && (noise.phase === 'computing' || noise.phase === 'done')">
      <p class="building">
        <strong>{{ noise.building.name }}</strong><br />
        <span class="muted">
          {{ noise.building.floors }} floor(s), about {{ noise.building.height }} m high<template v-if="!noise.building.heightKnown"> (assumed: the 3D model isn't loaded here)</template>.
          Values are free-field levels at the facade, per floor.
        </span>
      </p>

      <fieldset class="metric">
        <legend>Show on the facades</legend>
        <label v-for="m in metrics" :key="m">
          <input v-model="noise.metric" type="radio" name="noise-metric" :value="m" />
          {{ METRIC_LABEL[m] }}
        </label>
      </fieldset>

      <ul class="legend" aria-label="Colour scale, dBA">
        <li v-for="band in scale" :key="band.label">
          <span class="swatch" :style="{ background: band.color }" />{{ band.label }}
        </li>
      </ul>

      <p v-if="noise.phase === 'computing'" class="hint" role="status">Calculating…</p>

      <template v-if="noise.assessment">
        <h4>Guideline values</h4>
        <ul class="checks">
          <li v-for="c in noise.assessment.checks" :key="c.id" :class="{ ok: c.ok === true, fail: c.ok === false }">
            <span class="mark" :aria-label="markLabel(c.ok)">{{ mark(c.ok) }}</span>
            <div>
              <strong>{{ c.title }}</strong>: {{ c.detail }}
              <div class="muted">{{ c.rule }}</div>
            </div>
          </li>
        </ul>

        <label class="insulation">
          Facade assumed for the indoor estimate
          <select v-model.number="noise.insulation">
            <option v-for="i in INSULATION_CHOICES" :key="i.db" :value="i.db">{{ i.label }}</option>
          </select>
        </label>

        <h4>Per side</h4>
        <table class="sides">
          <thead>
            <tr><th>Facing</th><th>Equivalent</th><th>Maximum</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in noise.assessment.sides" :key="s.name">
              <td>{{ s.name }}</td>
              <td>{{ Math.round(s.maxLeq) }} dBA</td>
              <td>{{ Math.round(s.maxLmax) }} dBA</td>
            </tr>
          </tbody>
        </table>
      </template>

      <h4>Traffic</h4>
      <p class="muted">
        Defaults by road type until you enter counts or forecasts (e.g. a noise investigation's prognosis year).
        Speeds from OpenStreetMap where signposted. Streets within 400 m count.
      </p>
      <table class="traffic">
        <thead>
          <tr><th>Street</th><th>ÅDT</th><th>km/h</th><th>Heavy %</th><th title="Equivalent level 10 m from the street">L<sub>eq</sub> 10 m</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in noise.rows" :key="row.key" :class="{ entered: row.entered }">
            <td>{{ row.label }}<span v-if="!row.entered" class="muted"> (default)</span></td>
            <td><input type="number" min="0" step="100" :value="row.adt" :aria-label="`ÅDT, ${row.label}`" @change="setNumber(row, 'adt', $event)" /></td>
            <td><input type="number" min="0" step="10" :value="row.speed" :aria-label="`Speed, ${row.label}`" @change="setNumber(row, 'speed', $event)" /></td>
            <td><input type="number" min="0" max="100" step="1" :value="row.heavyPct" :aria-label="`Heavy vehicles, ${row.label}`" @change="setNumber(row, 'heavyPct', $event)" /></td>
            <td>{{ leq10(row) }}</td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="reset" @click="noise.resetTraffic()">Reset traffic to defaults</button>

      <p class="muted method">
        Simplified Nordic road traffic noise model (Naturvårdsverket report 4653): line sources, buildings screen
        about 20 dB, hard ground; no reflections, building heights of screens or terrain screening. Maximum levels
        from a heavy vehicle where at least 5 pass per night hour, otherwise a car. For comparing sides and options,
        not instead of a noise investigation. Streets: © OpenStreetMap contributors; buildings: Luleå kommun (live).
      </p>
    </template>
  </section>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close {
  border: none;
  background: none;
  cursor: pointer;
}

.hint {
  margin: 0.4rem 0;
}

.building {
  margin: 0.4rem 0;
}

h4 {
  margin: 0.7rem 0 0.3rem;
}

.metric {
  border: none;
  padding: 0;
  margin: 0.3rem 0;
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.metric legend {
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0.3rem 0;
  font-size: 0.75rem;
}

.swatch {
  display: inline-block;
  width: 0.9rem;
  height: 0.7rem;
  margin-right: 0.2rem;
  border: 1px solid rgba(0, 0, 0, 0.3);
  vertical-align: middle;
}

.checks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.checks li {
  display: flex;
  gap: 0.4rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid #eee;
}

.mark {
  font-weight: 700;
  width: 1rem;
  flex: none;
}

.ok .mark {
  color: #15803d;
}

.fail .mark {
  color: #b91c1c;
}

.insulation {
  display: block;
  margin: 0.5rem 0;
  font-size: 0.85rem;
}

.insulation select {
  display: block;
  max-width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

th,
td {
  text-align: left;
  padding: 0.15rem 0.25rem;
  border-bottom: 1px solid #eee;
}

.traffic input {
  width: 4.2rem;
}

.traffic tr.entered td:first-child {
  font-weight: 600;
}

.reset {
  margin-top: 0.4rem;
}

.muted {
  color: #6b7280;
  font-size: 0.78rem;
}

.method {
  margin-top: 0.6rem;
}
</style>
