import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useLayersStore } from '@/features/layers/layersStore';
import { deliveryUrl, listPlans, type PlanSummary } from '@/features/plan-editor/plansApi';

/** Plans authored in the platform (/api/plans), shown as detaljplan layers. */
export const useSavedPlansStore = defineStore('savedPlans', () => {
  const plans = ref<PlanSummary[]>([]);
  const error = ref<string | null>(null);

  async function refresh(): Promise<void> {
    try {
      plans.value = await listPlans();
      error.value = null;
      useLayersStore().setSavedPlans(plans.value.map((p) => ({ id: p.id, name: p.name, url: deliveryUrl(p) })));
    } catch (err) {
      error.value = (err as Error).message;
    }
  }

  return { plans, error, refresh };
});
