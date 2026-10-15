import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import { footprintAt, footprintsIn, type Footprint } from '@/features/buildings/footprints';
import { buildingFactsAt } from '@/features/buildings/luleaBuildingFacts';
import { useFloodStore } from '@/features/flood/floodStore';
import { useMeasureStore } from '@/features/measure/measureStore';
import { useLayersStore } from '@/features/layers/layersStore';
import { useSelectionStore, type SelectedFeature } from '@/features/selection/selectionStore';
import { useViewer } from '@/viewer/useViewer';
import type { NoiseOverlay } from '@/viewer/noise/NoiseOverlay';
import { assess, type Assessment } from './assessment';
import { emission, facadeReceivers, MAX_DISTANCE, type Receiver, type ReceiverLevel, type SourceLine, type Traffic } from './nordic';
import type { NoiseMetric } from './scale';
import { rememberedTraffic, rememberTraffic, streetsNear, type StreetRow } from './streets';

export type NoisePhase = 'idle' | 'picking' | 'loading' | 'computing' | 'done' | 'error';

export interface CheckedBuilding {
  name: string;
  nationalId: string | null;
  height: number;
  /** False when the height is a guess (the 3D model tile wasn't loaded). */
  heightKnown: boolean;
  floors: number;
}

export const INSULATION_CHOICES = [
  { db: 25, label: '25 dB: older facade, simple windows' },
  { db: 30, label: '30 dB: typical facade, closed windows' },
  { db: 35, label: '35 dB: good facade and windows' },
  { db: 40, label: '40 dB: sound-insulated facade' },
] as const;

const DEFAULT_HEIGHT = 10;
const FLOOR_HEIGHT = 3;

/**
 * The noise check: pick a building, get road traffic noise on each facade and floor, and see
 * how it measures up to Förordning 2015:216 and FoHMFS 2014:13. Street traffic can be edited
 * (counts or forecasts) and the check reruns. Geometry, the worker and the overlay live outside
 * reactive state.
 */
export const useNoiseStore = defineStore('noise', () => {
  const phase = ref<NoisePhase>('idle');
  const building = ref<CheckedBuilding | null>(null);
  const rows = ref<StreetRow[]>([]);
  const metric = ref<NoiseMetric>('leq');
  const insulation = ref(30);
  const assessment = ref<Assessment | null>(null);
  const error = ref<string | null>(null);

  let receivers: Receiver[] = [];
  let sources: SourceLine[] = [];
  let screens: Footprint[] = [];
  let levels: ReceiverLevel[] = [];
  let groundZ = 0;
  /** The selected object the check is about (its name may arrive later, from the facts look-up). */
  let checkedObject: string | null = null;
  let overlay: NoiseOverlay | null = null;
  let worker: Worker | null = null;
  let abort: AbortController | null = null;
  let recompute: ReturnType<typeof setTimeout> | null = null;

  const selection = useSelectionStore();
  const layers = useLayersStore();

  const isBuilding = (sel: SelectedFeature | null) => {
    const layer = sel && layers.layers.find((l) => l.id === sel.layerId);
    return !!layer && (layer.kind === 'i3s' || !!layer.buildingFacts || !!layer.extrusionProperty);
  };

  /** Starts a check: on the selected building, or on the next one clicked. */
  function start(): void {
    useFloodStore().clear();
    useMeasureStore().stop();
    clear();
    if (isBuilding(selection.current) && selection.current?.point) {
      void run(selection.current);
      return;
    }
    phase.value = 'picking';
  }

  watch(
    () => selection.current,
    (sel) => {
      if (phase.value === 'picking' && sel?.point && isBuilding(sel)) void run(sel);
      else if (building.value && sel?.name && sel.objectId === checkedObject) building.value.name = sel.name;
    },
  );

  async function run(sel: SelectedFeature): Promise<void> {
    const viewer = useViewer().value;
    if (!viewer || !sel.point) return;
    stop();
    phase.value = 'loading';
    error.value = null;
    const controller = new AbortController();
    abort = controller;
    const [x, y] = sel.point;
    checkedObject = sel.objectId;
    try {
      const fp = await footprintAt(x, y, controller.signal);
      if (!fp) throw new Error('No building footprint at that spot in Luleå kommun’s building layer.');
      const range = viewer.buildingZRange(sel);
      const heightKnown = !!range && range.max - range.min > 2;
      const height = heightKnown ? Math.min(150, range!.max - range!.min) : DEFAULT_HEIGHT;
      groundZ = range?.min ?? viewer.heightAt(x, y);
      receivers = facadeReceivers(fp.rings, height, 4, FLOOR_HEIGHT);
      if (!receivers.length) throw new Error('The building outline is too small to check.');

      const [cx, cy] = centroid(fp.rings[0]);
      const [near, around, facts] = await Promise.all([
        streetsNear(cx, cy, MAX_DISTANCE),
        footprintsIn(cx - MAX_DISTANCE, cy - MAX_DISTANCE, cx + MAX_DISTANCE, cy + MAX_DISTANCE, controller.signal),
        // Just for a readable name (address or purpose); the check doesn't depend on it.
        buildingFactsAt(x, y, controller.signal).catch(() => null),
      ]);
      if (controller.signal.aborted) return;
      sources = near.sources;
      screens = around;
      const remembered = rememberedTraffic();
      rows.value = near.rows.map((r) => (remembered[r.key] ? { ...r, ...remembered[r.key], entered: true } : r));
      building.value = {
        name: facts?.address ?? sel.name ?? facts?.purposes[0] ?? 'Selected building',
        nationalId: fp.nationalId,
        height: Math.round(height),
        heightKnown,
        floors: Math.max(1, Math.floor(height / FLOOR_HEIGHT)),
      };
      overlay = viewer.showNoise([cx, cy, groundZ]);
      showStreets();
      compute();
    } catch (err) {
      if (controller.signal.aborted) return;
      error.value = (err as Error).message;
      phase.value = 'error';
    }
  }

  function traffic(): Record<string, Traffic> {
    return Object.fromEntries(rows.value.map((r) => [r.key, { adt: r.adt, speed: r.speed, heavyPct: r.heavyPct }]));
  }

  function showStreets(): void {
    overlay?.showStreets(sources, new Map(rows.value.map((r) => [r.key, emission(r).leq10])));
  }

  function compute(): void {
    worker?.terminate();
    phase.value = 'computing';
    const w = new Worker(new URL('./noise.worker.ts', import.meta.url), { type: 'module' });
    worker = w;
    w.onmessage = (event: MessageEvent<{ levels?: ReceiverLevel[]; error?: string }>) => {
      w.terminate();
      if (worker === w) worker = null;
      if (event.data.error || !event.data.levels) {
        error.value = event.data.error ?? 'The calculation failed';
        phase.value = 'error';
        return;
      }
      levels = event.data.levels;
      assessment.value = assess(receivers, levels, insulation.value);
      overlay?.showLevels(receivers, levels, metric.value, groundZ);
      phase.value = 'done';
    };
    w.postMessage({ receivers, sources, screens, traffic: traffic() });
  }

  /** Marks a street's traffic as entered (after an edit), remembers it and reruns the check. */
  function edited(row: StreetRow): void {
    row.entered = true;
    scheduleRecompute();
  }

  /** Back to road-class defaults for every street. */
  function resetTraffic(): void {
    const viewer = useViewer().value;
    const sel = selection.current;
    for (const r of rows.value) r.entered = false;
    rememberTraffic(rows.value);
    if (viewer && sel) void run(sel);
  }

  function scheduleRecompute(): void {
    if (recompute) clearTimeout(recompute);
    recompute = setTimeout(() => {
      rememberTraffic(rows.value);
      showStreets();
      compute();
    }, 400);
  }

  watch(metric, (m) => {
    if (levels.length) overlay?.showLevels(receivers, levels, m, groundZ);
  });
  watch(insulation, (db) => {
    if (levels.length) assessment.value = assess(receivers, levels, db);
  });

  function stop(): void {
    abort?.abort();
    abort = null;
    worker?.terminate();
    worker = null;
    if (recompute) clearTimeout(recompute);
    recompute = null;
  }

  /** Ends the check and removes its markers. */
  function clear(): void {
    stop();
    useViewer().value?.clearNoise();
    overlay = null;
    levels = [];
    phase.value = 'idle';
    building.value = null;
    assessment.value = null;
    error.value = null;
    rows.value = [];
  }

  return { phase, building, rows, metric, insulation, assessment, error, start, edited, resetTraffic, clear };
});

function centroid(ring: [number, number][]): [number, number] {
  let x = 0;
  let y = 0;
  for (const [px, py] of ring) {
    x += px;
    y += py;
  }
  return [x / ring.length, y / ring.length];
}
