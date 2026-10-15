<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from './authStore';

const auth = useAuthStore();
const router = useRouter();
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    await router.replace(await auth.completeLogin());
  } catch (err) {
    console.error('Login failed', err);
    error.value = 'Login failed. Please try again.';
  }
});
</script>

<template>
  <main class="callback">
    <p v-if="!error">Signing in…</p>
    <template v-else>
      <p role="alert">{{ error }}</p>
      <RouterLink to="/">Back to the map</RouterLink>
    </template>
  </main>
</template>

<style scoped>
.callback {
  padding: 2rem;
}
</style>
