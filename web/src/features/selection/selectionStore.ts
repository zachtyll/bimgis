import { defineStore } from 'pinia';
import { ref } from 'vue';

/** A picked object, as plain data. Identifies the object; never holds the three.js object. */
export interface SelectedFeature {
  layerId: string;
  /** Identifies the object in the scene for highlighting. May be a session-only three.js uuid. */
  objectId: string;
  /**
   * ID that survives reloads and data re-imports (building feature id, IFC GlobalId), or null.
   * Anything persisted about the object (comments, links) must use this.
   */
  stableId: string | null;
  name: string | null;
  /** Where the user clicked, in the scene CRS. */
  point?: [number, number, number];
  ifcClass: string | null;
  globalId: string | null;
  properties: Record<string, string>;
}

export const useSelectionStore = defineStore('selection', () => {
  const current = ref<SelectedFeature | null>(null);

  function select(feature: SelectedFeature): void {
    current.value = feature;
  }

  function clear(): void {
    current.value = null;
  }

  return { current, select, clear };
});
