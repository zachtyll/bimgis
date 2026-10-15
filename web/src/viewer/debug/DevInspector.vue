<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import Inspector from '@giro3d/giro3d/gui/Inspector.js';
import EntityPanel from '@giro3d/giro3d/gui/EntityPanel.js';

import { useViewer } from '../useViewer';
import IfcEntityInspector from './IfcEntityInspector';

EntityPanel.registerInspector('IfcEntity', IfcEntityInspector);
// Same simple panel (visibility etc.) for the streamed I3S city model.
EntityPanel.registerInspector('I3SEntity', IfcEntityInspector as never);
EntityPanel.registerInspector('TreeEntity', IfcEntityInspector as never);

const container = ref<HTMLDivElement | null>(null);
const viewer = useViewer();
let inspector: Inspector | null = null;

watch(
  [viewer, container],
  ([service, el]) => {
    inspector?.detach();
    inspector = service && el ? Inspector.attach(el, service.instance) : null;
  },
  { immediate: true },
);

onBeforeUnmount(() => inspector?.detach());
</script>

<template>
  <div ref="container" />
</template>
