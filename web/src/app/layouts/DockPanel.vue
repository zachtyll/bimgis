<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import { useDock } from './useDock';

const props = withDefaults(
  defineProps<{
    side: 'left' | 'right';
    title: string;
    /** localStorage key for width and collapsed state. */
    storageKey: string;
    defaultWidth?: number;
  }>(),
  { defaultWidth: 340 },
);

const emit = defineEmits<{ (e: 'occupied', px: number): void }>();

const MIN_WIDTH = 220;
const KEY_STEP = 24;
/** Gap between the dock and the window edge. */
const MARGIN = 8;

const { width, collapsed } = useDock(props.storageKey, props.defaultWidth);
const id = `dock-${props.side}`;

/** The dock may never cover more than 70% of the window. */
function clamp(px: number): number {
  const max = Math.max(MIN_WIDTH, Math.round(window.innerWidth * 0.7));
  return Math.min(max, Math.max(MIN_WIDTH, Math.round(px)));
}
width.value = clamp(width.value);

// Tell the layout how much of the viewer's edge is covered, e.g. to keep the attribution visible.
watch(
  [width, collapsed],
  () => emit('occupied', collapsed.value ? 0 : width.value + 2 * MARGIN),
  { immediate: true },
);

// --- Resizing by dragging the inner edge --------------------------------------------------
const dragging = ref(false);
let startX = 0;
let startWidth = 0;

function onPointerDown(evt: PointerEvent) {
  dragging.value = true;
  startX = evt.clientX;
  startWidth = width.value;
  (evt.currentTarget as HTMLElement).setPointerCapture(evt.pointerId);
}

function onPointerMove(evt: PointerEvent) {
  if (!dragging.value) return;
  const delta = evt.clientX - startX;
  width.value = clamp(props.side === 'left' ? startWidth + delta : startWidth - delta);
}

function onPointerUp() {
  dragging.value = false;
}

// --- Keyboard: the handle is a focusable separator ---------------------------------------
function onKeyDown(evt: KeyboardEvent) {
  const grow = props.side === 'left' ? 'ArrowRight' : 'ArrowLeft';
  const shrink = props.side === 'left' ? 'ArrowLeft' : 'ArrowRight';
  if (evt.key === grow) width.value = clamp(width.value + KEY_STEP);
  else if (evt.key === shrink) width.value = clamp(width.value - KEY_STEP);
  else if (evt.key === 'Home') width.value = clamp(MIN_WIDTH);
  else if (evt.key === 'End') width.value = clamp(window.innerWidth);
  else return;
  evt.preventDefault();
}

const onWindowResize = () => (width.value = clamp(width.value));
window.addEventListener('resize', onWindowResize);
onBeforeUnmount(() => window.removeEventListener('resize', onWindowResize));

const style = computed(() => ({ width: `${width.value}px` }));
const collapseLabel = computed(() => (props.side === 'left' ? '‹' : '›'));
</script>

<template>
  <aside
    v-show="!collapsed"
    :id="id"
    class="dock"
    :class="[side, { dragging }]"
    :style="style"
    :aria-label="title"
  >
    <header class="dock-header">
      <h2>{{ title }}</h2>
      <button
        type="button"
        class="icon"
        :aria-label="`Collapse ${title}`"
        :aria-controls="id"
        aria-expanded="true"
        @click="collapsed = true"
      >
        {{ collapseLabel }}
      </button>
    </header>
    <div class="dock-body">
      <slot />
    </div>
    <div
      class="handle"
      role="separator"
      tabindex="0"
      aria-orientation="vertical"
      :aria-label="`Resize ${title}`"
      :aria-controls="id"
      :aria-valuenow="width"
      :aria-valuemin="MIN_WIDTH"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeyDown"
    />
  </aside>

  <button
    v-if="collapsed"
    type="button"
    class="tab"
    :class="side"
    :aria-label="`Show ${title}`"
    :aria-controls="id"
    aria-expanded="false"
    @click="collapsed = false"
  >
    <span class="tab-text">{{ title }}</span>
  </button>
</template>

<style scoped>
.dock {
  position: absolute;
  top: 8px;
  bottom: 8px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  background: rgb(255 255 255 / 0.94);
  border-radius: 8px;
  box-shadow: 0 4px 18px rgb(0 0 0 / 0.18);
  backdrop-filter: blur(4px);
}

.dock.left {
  left: 8px;
}

.dock.right {
  right: 8px;
}

.dock.dragging {
  user-select: none;
}

.dock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-bottom: 1px solid #e5e7eb;
}

.dock-header h2 {
  margin: 0;
  font-size: 0.95rem;
}

.dock-body {
  flex: 1;
  min-height: 0;
  padding: 0 10px 10px;
  overflow: auto;
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

/* A wide, invisible hit area on the inner edge; a thin line shows on hover/focus. */
.handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  touch-action: none;
}

.left .handle {
  right: -5px;
}

.right .handle {
  left: -5px;
}

.handle::after {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 4px;
  width: 2px;
  border-radius: 1px;
  background: transparent;
}

.handle:hover::after,
.handle:focus-visible::after,
.dragging .handle::after {
  background: #2563eb;
}

.handle:focus-visible {
  outline: none;
}

.tab {
  position: absolute;
  top: 16px;
  z-index: 10;
  padding: 10px 6px;
  border: none;
  background: rgb(255 255 255 / 0.94);
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.2);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  writing-mode: vertical-rl;
}

.tab.left {
  left: 0;
  border-radius: 0 6px 6px 0;
  transform: rotate(180deg);
}

.tab.right {
  right: 0;
  border-radius: 6px 0 0 6px;
}

.tab-text {
  font-weight: 600;
}
</style>
