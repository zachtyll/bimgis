import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';

import { loadDetailPlan, type DetailPlan } from './lmDetaljplan';

/** Detaljplaner loaded from Lantmäteriet Detaljplan 4.1 deliveries, keyed by URL. */
export const usePlansStore = defineStore('plans', () => {
  const plans = ref<Record<string, DetailPlan>>({});
  const errors = ref<Record<string, string>>({});

  async function load(url: string): Promise<void> {
    if (plans.value[url]) return;
    try {
      // Plain, read-only data with large coordinate arrays: no deep reactivity needed.
      plans.value[url] = markRaw(await loadDetailPlan(url));
      delete errors.value[url];
    } catch (err) {
      errors.value[url] = (err as Error).message;
    }
  }

  return { plans, errors, load };
});
