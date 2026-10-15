<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ViewerCanvas from '@/viewer/ViewerCanvas.vue';
import DevInspector from '@/viewer/debug/DevInspector.vue';
import { useViewer } from '@/viewer/useViewer';
import UserMenu from '@/features/auth/UserMenu.vue';
import { useAuthStore } from '@/features/auth/authStore';
import LayerPanel from '@/features/layers/LayerPanel.vue';
import { useLayersStore } from '@/features/layers/layersStore';
import FeatureInfoPanel from '@/features/selection/FeatureInfoPanel.vue';
import { useSelectionStore } from '@/features/selection/selectionStore';
import CommentThread from '@/features/comments/CommentThread.vue';
import PlanEditor from '@/features/plan-editor/PlanEditor.vue';
import { usePlanEditorStore } from '@/features/plan-editor/planEditorStore';
import SavedPlansPanel from '@/features/plans/SavedPlansPanel.vue';
import AnalysisTools from '@/features/tools/AnalysisTools.vue';
import MeasureBar from '@/features/measure/MeasureBar.vue';
import { useFloodStore } from '@/features/flood/floodStore';
import { useNoiseStore } from '@/features/noise/noiseStore';
import DockPanel from './DockPanel.vue';
import DiscoverIntro from '../DiscoverIntro.vue';
import HaveYourSay from '../HaveYourSay.vue';
import ModeSwitch from '../ModeSwitch.vue';
import ParticipateGate from '../ParticipateGate.vue';
import { inMode, useModeStore, type ModeId } from '../modes';

const isDev = import.meta.env.DEV;
const route = useRoute();
const mode = useModeStore();
const auth = useAuthStore();
const editor = usePlanEditorStore();
const selection = useSelectionStore();
const layers = useLayersStore();

/** How much of the viewer's edges the docks cover, for overlays like the attribution. */
const leftOccupied = ref(0);
const rightOccupied = ref(0);

/** May the signed-in user (if any) use the current view? */
const allowed = computed(() => {
  const roles = mode.mode.roles;
  return !roles || roles.some((r) => auth.hasRole(r));
});
const gated = computed(() => auth.ready && !allowed.value);

/**
 * Follows the route. Leaving a view ends what only makes sense there (running tools, drawing),
 * and drops a selection that doesn't exist in the new view; drafts and the camera are kept.
 */
watch(
  () => route.meta.mode,
  (next: ModeId | undefined) => {
    const target = next ?? 'discover';
    if (target === mode.current) return;
    mode.current = target;
    useFloodStore().clear();
    useNoiseStore().clear();
    useViewer().value?.cancelDrawing();
    const layer = layers.layers.find((l) => l.id === selection.current?.layerId);
    if (selection.current && (!layer || !inMode(layer.modes, target))) selection.clear();
  },
  { immediate: true },
);
</script>

<template>
  <div class="shell" :data-mode="mode.current">
    <header class="topbar">
      <RouterLink to="/discover" class="brand">bimgis <span>Luleå</span></RouterLink>
      <ModeSwitch />
      <UserMenu />
    </header>

    <!-- The 3D view fills the stage and is shared by both views; the docks float above it. -->
    <div class="stage" :style="{ '--dock-left': `${leftOccupied}px`, '--dock-right': `${rightOccupied}px` }">
      <main class="viewer" :aria-label="`3D map: ${mode.mode.label}`">
        <ViewerCanvas />
      </main>

      <!-- Measuring works in both views. -->
      <MeasureBar v-if="mode.current === 'discover' || allowed" />

      <template v-if="mode.current === 'discover'">
        <DockPanel side="left" title="Explore" storage-key="bimgis.dock.left" :default-width="320" @occupied="leftOccupied = $event">
          <DiscoverIntro />
          <LayerPanel />
          <DevInspector v-if="isDev" />
        </DockPanel>
        <DockPanel side="right" title="Details" storage-key="bimgis.dock.right" :default-width="380" @occupied="rightOccupied = $event">
          <FeatureInfoPanel />
          <HaveYourSay v-if="selection.current" />
        </DockPanel>
      </template>

      <template v-else-if="allowed">
        <AnalysisTools />
        <DockPanel side="left" title="Plans & layers" storage-key="bimgis.dock.left" :default-width="320" @occupied="leftOccupied = $event">
          <SavedPlansPanel />
          <LayerPanel />
          <DevInspector v-if="isDev" />
        </DockPanel>
        <DockPanel
          side="right"
          :title="editor.draft ? 'Plan editor' : 'Details'"
          storage-key="bimgis.dock.right"
          :default-width="380"
          @occupied="rightOccupied = $event"
        >
          <PlanEditor v-if="editor.draft" />
          <template v-else>
            <FeatureInfoPanel />
            <CommentThread />
          </template>
        </DockPanel>
      </template>

      <ParticipateGate v-else-if="gated" />
    </div>
  </div>
</template>

<style scoped>
.shell {
  --accent-discover: #0f766e;
  --accent-participate: #4338ca;
  --accent: var(--accent-discover);
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.shell[data-mode='participate'] {
  --accent: var(--accent-participate);
}

.topbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
  padding: 6px 10px;
  border-bottom: 3px solid var(--accent);
  transition: border-color 0.2s;
}

.topbar > :last-child {
  justify-self: end;
}

.brand {
  font-weight: 700;
  color: inherit;
  text-decoration: none;
}

.brand span {
  font-weight: 400;
  color: #64748b;
}

.stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.viewer {
  position: absolute;
  inset: 0;
}

@media (max-width: 760px) {
  .topbar {
    grid-template-columns: auto 1fr;
  }

  .topbar > nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-self: center;
  }
}
</style>
