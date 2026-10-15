<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { eventsAt, formatOccurrence, loadEvents, type EventsView } from './eventsApi';

const props = defineProps<{ url: string; venueId: string | null; venueName?: string | null }>();

const view = ref<EventsView | null>(null);
const state = ref<'loading' | 'ready' | 'error'>('loading');

watch(
  () => props.url,
  async (url) => {
    state.value = 'loading';
    try {
      view.value = await loadEvents(url);
      state.value = 'ready';
    } catch {
      state.value = 'error';
    }
  },
  { immediate: true },
);

const events = computed(() => (view.value ? eventsAt(view.value, props.venueId) : []));
const unplaced = computed(() => (view.value ? eventsAt(view.value, null).length : 0));

/** The event's own location text, when it says more than the venue name (e.g. which hall). */
const extraLocation = (location: string | null) =>
  location && location.trim().toLowerCase() !== props.venueName?.trim().toLowerCase() ? location : null;

/** Up to three dates; the rest are on the event's page. */
const MAX_DATES = 3;
</script>

<template>
  <section class="events" aria-labelledby="events-heading">
    <h4 id="events-heading">What's on here</h4>
    <p v-if="state === 'loading'" class="muted">Asking visitlulea.se…</p>
    <p v-else-if="state === 'error'" class="muted" role="alert">Couldn't load events right now.</p>
    <p v-else-if="!events.length" class="muted">No events here in this period.</p>

    <ul v-else>
      <li v-for="e in events" :key="e.id">
        <a :href="e.url" target="_blank" rel="noopener">{{ e.title }}</a>
        <span v-if="e.category" class="category">{{ e.category }}</span>
        <p class="dates">
          {{ e.dates.slice(0, MAX_DATES).map(formatOccurrence).join(' · ') }}
          <template v-if="e.dates.length > MAX_DATES"> · +{{ e.dates.length - MAX_DATES }} more</template>
        </p>
        <p v-if="extraLocation(e.location)" class="muted">{{ e.location }}</p>
      </li>
    </ul>

    <p v-if="view" class="muted source">
      From <a :href="view.source" target="_blank" rel="noopener">visitlulea.se</a>; details, times and tickets
      are on each event's page.
      <template v-if="unplaced"><br />{{ unplaced }} event(s) in this period have no fixed place on the map.</template>
    </p>
  </section>
</template>

<style scoped>
.events {
  margin-top: 0.75rem;
}

h4 {
  margin: 0.5rem 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.4rem 0;
  border-bottom: 1px solid #eee;
}

li a {
  font-weight: 600;
}

.category {
  margin-left: 0.4rem;
  padding: 0 0.35rem;
  border-radius: 0.6rem;
  background: #e0f2f1;
  font-size: 0.75rem;
}

.dates {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
}

p {
  margin: 0.15rem 0;
}

.muted {
  color: #6b7280;
  font-size: 0.8rem;
}

.source {
  margin-top: 0.5rem;
}
</style>
