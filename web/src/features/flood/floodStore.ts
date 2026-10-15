import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useMeasureStore } from '@/features/measure/measureStore';
import { useNoiseStore } from '@/features/noise/noiseStore';
import { useViewer } from '@/viewer/useViewer';
import type { FloodOverlay } from '@/viewer/flood/FloodOverlay';
import { floodGrid, type Circle } from './floodInputs';
import { DEFAULT_PARAMS, type FloodGrid, type FloodSnapshot, type FloodStats } from './simulation';

export type FloodPhase = 'idle' | 'placing' | 'loading' | 'running' | 'done' | 'error';

export const RAIN_CHOICES = [
  { mm: 20, label: '20 mm: heavy rain' },
  { mm: 50, label: '50 mm: cloudburst (SMHI: 50 mm in an hour)' },
  { mm: 100, label: '100 mm: extreme cloudburst' },
] as const;

/** Snapshots are shown at this pace, so the rain and the spreading water can be watched. */
const PLAYBACK_MS = 150;

/**
 * The flood check: place a circle, let it rain inside, watch where the water goes. Viewer
 * objects (overlay), the worker and timers live outside reactive state.
 */
export const useFloodStore = defineStore('flood', () => {
  const phase = ref<FloodPhase>('idle');
  /** While sizing the circle; null before the centre is set. */
  const radius = ref<number | null>(null);
  const rainMm = ref(50);
  const progress = ref(0);
  const stats = ref<FloodStats | null>(null);
  const circle = ref<Circle | null>(null);
  /** Rain of the run the summary describes. */
  const ranWithMm = ref<number | null>(null);
  const error = ref<string | null>(null);

  let worker: Worker | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let abort: AbortController | null = null;
  let overlay: FloodOverlay | null = null;

  function stopRun(): void {
    abort?.abort();
    abort = null;
    worker?.terminate();
    worker = null;
    if (timer) clearInterval(timer);
    timer = null;
    overlay?.setRaining(false);
  }

  /** Place a new circle; the rain starts when its radius is set. */
  async function start(): Promise<void> {
    const viewer = useViewer().value;
    if (!viewer) return;
    useNoiseStore().clear();
    useMeasureStore().stop();
    clear();
    phase.value = 'placing';
    const picked = await viewer.pickCircle((r) => (radius.value = r));
    radius.value = null;
    if (!picked) {
      if (phase.value === 'placing') phase.value = 'idle';
      return;
    }
    await run(picked);
  }

  /** Same circle, perhaps another amount of rain. */
  async function rerun(): Promise<void> {
    if (circle.value) await run(circle.value);
  }

  async function run(c: Circle): Promise<void> {
    const viewer = useViewer().value;
    if (!viewer) return;
    stopRun();
    circle.value = c;
    stats.value = null;
    error.value = null;
    progress.value = 0;
    ranWithMm.value = rainMm.value;
    phase.value = 'loading';
    overlay = viewer.showFlood(c);
    overlay.setRaining(true); // it starts raining right away; the water follows

    const controller = new AbortController();
    abort = controller;
    let grid: FloodGrid;
    try {
      grid = await floodGrid(c, controller.signal);
    } catch (err) {
      if (controller.signal.aborted) return;
      overlay.setRaining(false);
      error.value = (err as Error).message;
      phase.value = 'error';
      return;
    }
    if (controller.signal.aborted) return;

    phase.value = 'running';
    const queue: FloodSnapshot[] = [];
    let finished = false;
    const shownOverlay = overlay;
    worker = new Worker(new URL('./flood.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<{ type: string; snapshot?: FloodSnapshot; message?: string }>) => {
      const { type, snapshot, message } = event.data;
      if (type === 'error') {
        stopRun();
        error.value = message ?? 'The simulation failed';
        phase.value = 'error';
        return;
      }
      if (snapshot) queue.push(snapshot);
      if (type === 'done') finished = true;
    };
    timer = setInterval(() => {
      const next = queue.shift();
      if (next) {
        shownOverlay.update(grid, next);
        progress.value = next.step / next.steps;
        stats.value = next.stats;
      }
      if (finished && !queue.length) {
        stopRun();
        phase.value = 'done';
      }
    }, PLAYBACK_MS);
    worker.postMessage({ grid, params: { ...DEFAULT_PARAMS, rainMm: rainMm.value } });
  }

  /** Stops placing or running and removes the markers. */
  function clear(): void {
    stopRun();
    useViewer().value?.cancelCircle();
    useViewer().value?.clearFlood();
    overlay = null;
    phase.value = 'idle';
    radius.value = null;
    stats.value = null;
    error.value = null;
    progress.value = 0;
  }

  return { phase, radius, rainMm, progress, stats, circle, ranWithMm, error, start, rerun, clear };
});
