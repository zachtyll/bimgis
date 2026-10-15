import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { SelectedFeature } from '@/features/selection/selectionStore';
import type { Viewpoint } from '@/viewer/camera';
import { fetchComments, postComment, type CommentTarget, type CommentView } from './commentsApi';

/**
 * The comment target for a selection, or null if the object has no stable identity.
 * `scope` groups layers that show the same objects (e.g. a plan's area and its envelope),
 * so they share one thread; it defaults to the layer id.
 */
export function commentTargetFor(feature: SelectedFeature, scope?: string): CommentTarget | null {
  if (!feature.stableId) return null;
  return {
    layerId: scope ?? feature.layerId,
    targetId: feature.stableId,
    label: feature.name ?? feature.properties['addr:street'] ?? null,
  };
}

const keyOf = (t: CommentTarget) => `${t.layerId}|${t.targetId}`;

export const useCommentsStore = defineStore('comments', () => {
  /** Loaded threads, keyed by target. */
  const threads = ref<Record<string, CommentView[]>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  const threadFor = computed(() => (t: CommentTarget) => threads.value[keyOf(t)] ?? []);

  async function load(target: CommentTarget): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      threads.value[keyOf(target)] = await fetchComments(target);
    } catch (err) {
      error.value = (err as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function add(target: CommentTarget, body: string, viewpoint: Viewpoint | null): Promise<void> {
    const created = await postComment(target, body, viewpoint);
    const key = keyOf(target);
    threads.value[key] = [...(threads.value[key] ?? []), created];
  }

  return { threads, loading, error, threadFor, load, add };
});
