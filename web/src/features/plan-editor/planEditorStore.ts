import { defineStore } from 'pinia';
import { computed, ref, shallowRef, toRaw } from 'vue';

import { useSavedPlansStore } from '@/features/plans/savedPlansStore';
import type { SnapTargets, XY } from '@/viewer/drawing/PolygonDrawTool';
import { useViewer } from '@/viewer/useViewer';
import { initialValues, kindOf, loadCatalogue, type CatalogueEntry } from './catalogue';
import { newDraft, newGeometry, type DraftGeometry, type DraftProvision, type PlanDraft, type Position } from './draft';
import { closeRing } from './geometry';
import { getPlan, PlanApiError, savePlan } from './plansApi';
import { toLmDelivery } from './toLmDelivery';
import { validateDraft } from './validate';

/** Municipality name as Lantmäteriet wants it (vägledning 2.1.1). One municipality for now. */
const MUNICIPALITY = 'Luleå';

export const usePlanEditorStore = defineStore('planEditor', () => {
  const draft = ref<PlanDraft | null>(null);
  /** Server version the draft is based on; null = never saved. */
  const serverVersion = ref<number | null>(null);
  const catalogue = shallowRef<Map<string, CatalogueEntry> | null>(null);
  const catalogueRelease = ref<string | null>(null);
  const selectedProvisionId = ref<string | null>(null);
  const drawing = ref<'area' | string | null>(null);
  const saving = ref(false);
  const message = ref<{ kind: 'error' | 'info'; text: string } | null>(null);
  const dirty = ref(false);

  const delivery = computed(() => (draft.value && catalogue.value ? toLmDelivery(draft.value, catalogue.value) : null));
  const issues = computed(() =>
    draft.value && catalogue.value && delivery.value ? validateDraft(draft.value, delivery.value, catalogue.value) : [],
  );
  const stopCount = computed(() => issues.value.filter((i) => i.severity === 'stop').length);
  const warningCount = computed(() => issues.value.length - stopCount.value);
  const selectedProvision = computed(() => draft.value?.provisions.find((p) => p.id === selectedProvisionId.value) ?? null);

  async function ensureCatalogue(): Promise<void> {
    if (catalogue.value) return;
    const c = await loadCatalogue();
    catalogue.value = new Map(c.bestammelser.map((b) => [b.id, b]));
    catalogueRelease.value = c.release.namn;
  }

  async function newPlan(): Promise<void> {
    await ensureCatalogue();
    draft.value = newDraft(MUNICIPALITY);
    serverVersion.value = null;
    selectedProvisionId.value = null;
    message.value = null;
    dirty.value = false;
  }

  async function open(id: string): Promise<void> {
    await ensureCatalogue();
    const saved = await getPlan(id);
    draft.value = saved.draft;
    serverVersion.value = saved.version;
    selectedProvisionId.value = null;
    message.value = null;
    dirty.value = false;
  }

  function close(): void {
    useViewer().value?.cancelDrawing();
    draft.value = null;
    drawing.value = null;
    selectedProvisionId.value = null;
  }

  function touch(): void {
    dirty.value = true;
  }

  async function save(): Promise<void> {
    if (!draft.value || !delivery.value) return;
    saving.value = true;
    message.value = null;
    try {
      const saved = await savePlan(draft.value, delivery.value, serverVersion.value);
      serverVersion.value = saved.version;
      dirty.value = false;
      message.value = { kind: 'info', text: `Saved as version ${saved.version}.` };
      await useSavedPlansStore().refresh();
    } catch (err) {
      message.value = {
        kind: 'error',
        text:
          err instanceof PlanApiError && err.status === 409
            ? 'Someone else saved this plan meanwhile. Reopen it to see their version (your changes are still here).'
            : (err as Error).message,
      };
    } finally {
      saving.value = false;
    }
  }

  /** The delivery as a file, e.g. for Lantmäteriet's update API. */
  function download(): void {
    if (!draft.value || !delivery.value) return;
    const blob = new Blob([JSON.stringify(delivery.value, null, 2)], { type: 'application/vnd.lm.detaljplan.v4+json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(draft.value.name || 'detaljplan').replace(/[^\p{L}\p{N}]+/gu, '-')}.lm-detaljplan-4.1.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /** Every vertex and edge of the draft, so new geometry can share borders exactly. */
  function snapTargets(): SnapTargets {
    const rings = [...(draft.value?.areas ?? []), ...(draft.value?.provisions.flatMap((p) => p.geometries) ?? [])]
      .flatMap((g) => g.polygon);
    const vertices: XY[] = rings.flatMap((r) => r.slice(0, -1).map((p): XY => [p[0], p[1]]));
    const segments = rings.flatMap((r) => r.slice(0, -1).map((p, i): [XY, XY] => [[p[0], p[1]], [r[i + 1][0], r[i + 1][1]]]));
    return { vertices, segments };
  }

  async function drawInto(target: 'area' | string): Promise<void> {
    const viewer = useViewer().value;
    if (!viewer || !draft.value) return;
    drawing.value = target;
    const ring = await viewer.drawPolygon(snapTargets());
    drawing.value = null;
    if (!ring || !draft.value) return;
    const geometry = newGeometry([closeRing(ring as Position[])]);
    if (target === 'area') draft.value.areas.push(geometry);
    else draft.value.provisions.find((p) => p.id === target)?.geometries.push(geometry);
    touch();
  }

  function cancelDrawing(): void {
    useViewer().value?.cancelDrawing();
    drawing.value = null;
  }

  /** Copies the plan area's coordinates exactly (recommended for shared borders, vägledning 3.2.5). */
  function usePlanArea(provisionId: string): void {
    const p = draft.value?.provisions.find((x) => x.id === provisionId);
    if (!p || !draft.value) return;
    p.geometries = draft.value.areas.map((a) => newGeometry(structuredClone(toRaw(a.polygon))));
    touch();
  }

  function removeGeometry(list: DraftGeometry[], id: string): void {
    const i = list.findIndex((g) => g.id === id);
    if (i >= 0) list.splice(i, 1);
    touch();
  }

  function addProvision(entry: CatalogueEntry): void {
    if (!draft.value) return;
    const prefix = (entry.beteckning ?? '').replace(/[#\[].*$/, '') || '';
    const sameKind = draft.value.provisions.filter((p) => p.code.startsWith(prefix) && prefix).length;
    const provision: DraftProvision = {
      id: crypto.randomUUID(),
      catalogueId: entry.id,
      kind: kindOf(entry),
      code: entry.beteckning?.includes('#') ? `${prefix}${sameKind + 1}` : prefix,
      values: initialValues(entry.bestammelseformulering),
      motive: '',
      geometries: [],
      regulates: [],
    };
    draft.value.provisions.push(provision);
    selectedProvisionId.value = provision.id;
    touch();
  }

  function removeProvision(id: string): void {
    if (!draft.value) return;
    draft.value.provisions = draft.value.provisions.filter((p) => p.id !== id);
    for (const p of draft.value.provisions) p.regulates = p.regulates.filter((r) => r !== id);
    if (selectedProvisionId.value === id) selectedProvisionId.value = null;
    touch();
  }

  return {
    draft, serverVersion, catalogue, catalogueRelease, selectedProvisionId, selectedProvision, drawing, saving,
    message, dirty, delivery, issues, stopCount, warningCount,
    ensureCatalogue, newPlan, open, close, touch, save, download, drawInto, cancelDrawing, usePlanArea,
    removeGeometry, addProvision, removeProvision,
  };
});
