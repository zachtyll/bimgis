<script setup lang="ts">
import { markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { useLayersStore } from '@/features/layers/layersStore';
import { useSelectionStore } from '@/features/selection/selectionStore';
import { useViewer } from './useViewer';
import { BASEMAP_ATTRIBUTION, ViewerService } from './ViewerService';

const container = ref<HTMLDivElement | null>(null);
const layers = useLayersStore();
const selection = useSelectionStore();
const viewer = useViewer();

onMounted(() => {
  const service = markRaw(
    new ViewerService(container.value!, {
      onPick: (feature) => (feature ? selection.select(feature) : selection.clear()),
    }),
  );
  viewer.value = service;

  // Store → scene. Scene → store happens through the onPick callback above.
  watch(() => layers.scene, (l) => service.syncLayers(l), { deep: true, immediate: true });
  watch(() => selection.current, (s) => service.highlight(s), { immediate: true });
});

onBeforeUnmount(() => {
  viewer.value?.dispose();
  viewer.value = null;
});
</script>

<template>
  <div ref="container" class="canvas" />
  <div class="attribution">
    <span>{{ BASEMAP_ATTRIBUTION }}</span>
    <span v-for="text in layers.attributions" :key="text"> · {{ text }}</span>
  </div>
</template>

<style scoped>
.canvas {
  position: absolute;
  inset: 0;
}

.attribution {
  position: absolute;
  /* Stay between the floating docks (widths set by MainLayout). */
  right: var(--dock-right, 0px);
  bottom: 0;
  max-width: calc(100% - var(--dock-left, 0px) - var(--dock-right, 0px));
  box-sizing: border-box;
  padding: 2px 6px;
  font-size: 11px;
  background: rgb(255 255 255 / 0.8);
}
</style>
