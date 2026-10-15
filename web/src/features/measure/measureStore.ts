import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useFloodStore } from '@/features/flood/floodStore';
import { useNoiseStore } from '@/features/noise/noiseStore';
import type { MeasureKind } from '@/viewer/measure/MeasureTool';
import { useViewer } from '@/viewer/useViewer';

export interface MeasureRow {
  label: string;
  value: string;
}

export interface MeasurementSummary {
  id: string;
  kind: MeasureKind;
  title: string;
  rows: MeasureRow[];
}

export const MEASURE_TOOLS: { kind: MeasureKind; label: string; title: string }[] = [
  { kind: 'distance', label: 'Distance', title: 'Straight-line distance between points, through anything' },
  { kind: 'height', label: 'Height', title: 'Height difference between two points' },
  { kind: 'point', label: 'Point', title: 'Coordinates and height of a point' },
  { kind: 'radius', label: 'Radius', title: 'A circle: radius, area, and how far things are from its centre' },
  { kind: 'volume', label: 'Area & volume', title: 'An area on the surface, raised to a body for its volume' },
];

/** Measuring tools: which one runs, its live numbers, and the measurements made so far. */
export const useMeasureStore = defineStore('measure', () => {
  const active = ref<MeasureKind | null>(null);
  const hint = ref('');
  const live = ref<MeasureRow[] | null>(null);
  const results = ref<MeasurementSummary[]>([]);

  /** Starts a tool; picking the running one again stops it. */
  function toggle(kind: MeasureKind): void {
    if (active.value === kind) return stop();
    const viewer = useViewer().value;
    if (!viewer) return;
    // One pointer tool at a time.
    useFloodStore().clear();
    useNoiseStore().clear();
    active.value = kind;
    live.value = null;
    viewer.startMeasure(kind, {
      onPreview: (rows, text) => {
        live.value = rows;
        hint.value = text;
      },
      onDone: (m) => {
        results.value = [{ id: m.id, kind: m.kind, title: m.title, rows: m.rows }, ...results.value];
        live.value = null;
      },
    });
  }

  function stop(): void {
    useViewer().value?.stopMeasure();
    active.value = null;
    live.value = null;
  }

  function remove(id: string): void {
    useViewer().value?.removeMeasurement(id);
    results.value = results.value.filter((r) => r.id !== id);
  }

  function clear(): void {
    useViewer().value?.clearMeasurements();
    results.value = [];
  }

  return { active, hint, live, results, toggle, stop, remove, clear };
});
