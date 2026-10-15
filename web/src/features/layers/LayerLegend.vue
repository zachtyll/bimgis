<script setup lang="ts">
import { computed } from 'vue';

import { getTheme, type ThemeId } from './themes';

const props = defineProps<{ themeId: ThemeId }>();
const theme = computed(() => getTheme(props.themeId));
</script>

<template>
  <ul v-if="theme.categories.length || theme.emphasis" class="legend">
    <li v-for="c in theme.categories" :key="c.value">
      <span class="swatch" :style="{ background: c.color, opacity: Math.max(theme.fillOpacity, 0.6) }" />
      {{ c.label }}
    </li>
    <li v-if="theme.emphasis">
      <span class="swatch emphasis" />
      {{ theme.emphasis.label }}
    </li>
  </ul>
</template>

<style scoped>
.legend {
  list-style: none;
  margin: 0.25rem 0 0.5rem 1.5rem;
  padding: 0;
  font-size: 0.8rem;
}

.legend li {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.swatch {
  display: inline-block;
  flex: none;
  width: 0.9rem;
  height: 0.9rem;
  border: 1px solid rgb(0 0 0 / 0.3);
}

.emphasis {
  background: transparent;
  border: 3px solid #111;
}
</style>
