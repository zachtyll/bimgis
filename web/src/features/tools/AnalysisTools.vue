<script setup lang="ts">
import FloodPanel from '@/features/flood/FloodPanel.vue';
import { useFloodStore } from '@/features/flood/floodStore';
import NoisePanel from '@/features/noise/NoisePanel.vue';
import { useNoiseStore } from '@/features/noise/noiseStore';

const flood = useFloodStore();
const noise = useNoiseStore();
</script>

<template>
  <!-- Analysis tools float over the 3D view, centred between the docks. One runs at a time. -->
  <div class="tools" :class="{ active: flood.phase !== 'idle' || noise.phase !== 'idle' }">
    <div v-if="flood.phase === 'idle' && noise.phase === 'idle'" class="buttons" role="toolbar" aria-label="Analysis tools">
      <button type="button" @click="flood.start()">Flood check</button>
      <button type="button" @click="noise.start()">Noise check</button>
    </div>
    <div v-else class="panel">
      <FloodPanel v-if="flood.phase !== 'idle'" />
      <NoisePanel v-else />
    </div>
  </div>
</template>

<style scoped>
.tools {
  position: absolute;
  top: 10px;
  left: calc((var(--dock-left, 0px) + 100% - var(--dock-right, 0px)) / 2);
  transform: translateX(-50%);
  z-index: 5;
  max-height: calc(100% - 20px);
  display: flex;
}

/* A running tool's panel goes to the left edge, so the middle of the view stays visible. */
.tools.active {
  left: calc(var(--dock-left, 0px) + 44px);
  transform: none;
}

.buttons {
  display: flex;
  gap: 0.4rem;
}

.buttons button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #0369a1;
  border-radius: 6px;
  background: #0284c7;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.panel {
  width: min(400px, calc(100vw - 32px));
  max-height: 100%;
  overflow: auto;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
  font-size: 0.9rem;
}
</style>
