<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { useAuthStore } from '@/features/auth/authStore';
import { useLayersStore } from '@/features/layers/layersStore';
import { useSelectionStore } from '@/features/selection/selectionStore';
import type { Viewpoint } from '@/viewer/camera';
import { useViewer } from '@/viewer/useViewer';
import { ApiError } from './commentsApi';
import { commentTargetFor, useCommentsStore } from './commentsStore';

const MAX_LENGTH = 2000;

const auth = useAuthStore();
const selection = useSelectionStore();
const comments = useCommentsStore();
const viewer = useViewer();

const layers = useLayersStore();
const target = computed(() => {
  const current = selection.current;
  if (!current) return null;
  const scope = layers.layers.find((l) => l.id === current.layerId)?.commentScope;
  return commentTargetFor(current, scope);
});
const thread = computed(() => (target.value ? comments.threadFor(target.value) : []));

const draft = ref('');
const posting = ref(false);
const postError = ref<string | null>(null);

watch(
  target,
  (t) => {
    draft.value = '';
    postError.value = null;
    if (t) comments.load(t);
  },
  { immediate: true },
);

async function submit() {
  const t = target.value;
  const body = draft.value.trim();
  if (!t || !body) return;

  posting.value = true;
  postError.value = null;
  try {
    await comments.add(t, body, viewer.value?.getViewpoint() ?? null);
    draft.value = '';
  } catch (err) {
    postError.value =
      err instanceof ApiError && err.status === 401
        ? 'Your session has expired. Please log in again.'
        : 'Your comment could not be posted. Please try again.';
  } finally {
    posting.value = false;
  }
}

function showView(viewpoint: Viewpoint) {
  viewer.value?.showViewpoint(viewpoint);
}

const dateFormat = new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'short' });
</script>

<template>
  <section v-if="selection.current" class="comments" aria-labelledby="comments-heading">
    <h3 id="comments-heading">Comments</h3>

    <p v-if="target?.label" class="muted">About: {{ target.label }}</p>
    <p v-if="!target" class="muted">Comments are not available for this kind of object.</p>

    <template v-else>
      <p v-if="comments.error" role="alert">{{ comments.error }}</p>
      <p v-else-if="comments.loading && thread.length === 0" class="muted">Loading comments…</p>
      <p v-else-if="thread.length === 0" class="muted">No comments yet. Be the first!</p>

      <ol class="thread">
        <li v-for="c in thread" :key="c.id" class="comment">
          <div class="meta">
            <strong>{{ c.authorName }}</strong>
            <time :datetime="c.createdAt">{{ dateFormat.format(new Date(c.createdAt)) }}</time>
          </div>
          <p class="body">{{ c.body }}</p>
          <button v-if="c.viewpoint" type="button" class="link" @click="showView(c.viewpoint)">
            Show what {{ c.authorName }} saw
          </button>
        </li>
      </ol>

      <form v-if="auth.isAuthenticated" class="form" @submit.prevent="submit">
        <label for="comment-draft">Your comment</label>
        <textarea
          id="comment-draft"
          v-model="draft"
          rows="3"
          :maxlength="MAX_LENGTH"
          placeholder="What do you think about this place?"
        />
        <div class="form-row">
          <span class="muted">{{ draft.length }}/{{ MAX_LENGTH }} · posted as {{ auth.user?.username }}</span>
          <button type="submit" :disabled="posting || !draft.trim()">
            {{ posting ? 'Posting…' : 'Post comment' }}
          </button>
        </div>
        <p v-if="postError" role="alert">{{ postError }}</p>
      </form>
      <p v-else-if="auth.ready">
        <button type="button" class="link" @click="auth.login()">Log in</button> to comment. Anyone can read.
      </p>
    </template>
  </section>
</template>

<style scoped>
.comments {
  margin-top: 1rem;
  border-top: 1px solid #ddd;
}

.thread {
  list-style: none;
  padding: 0;
}

.comment {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.body {
  margin: 0.25rem 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.muted {
  color: #555;
  font-size: 0.85rem;
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: #1d4ed8;
  text-decoration: underline;
  cursor: pointer;
}
</style>
