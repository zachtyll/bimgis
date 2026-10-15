<script setup lang="ts">
import { useAuthStore } from './authStore';

const auth = useAuthStore();
</script>

<template>
  <div v-if="auth.ready" class="user-menu">
    <template v-if="auth.user">
      <span>
        Signed in as <strong>{{ auth.user.username }}</strong>
        <span v-if="auth.hasRole('official')" class="badge">official</span>
        <span v-if="auth.hasRole('moderator')" class="badge">moderator</span>
      </span>
      <button type="button" @click="auth.logout()">Log out</button>
    </template>
    <template v-else>
      <button type="button" @click="auth.login()">Log in</button>
      <button type="button" @click="auth.register()">Create account</button>
    </template>
  </div>
</template>

<style scoped>
.user-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.badge {
  margin-left: 0.25rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #e5e7eb;
}
</style>
