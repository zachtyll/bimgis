import { shallowRef, type ShallowRef } from 'vue';

import type { ViewerService } from './ViewerService';

// One viewer per app. Held in a shallowRef so Vue never proxies giro3d/three objects.
const current = shallowRef<ViewerService | null>(null);

/** The active viewer, or null before ViewerCanvas has mounted. Set only by ViewerCanvas. */
export function useViewer(): ShallowRef<ViewerService | null> {
  return current;
}
