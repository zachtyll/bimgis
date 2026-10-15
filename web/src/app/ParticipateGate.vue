<script setup lang="ts">
import { useAuthStore } from '@/features/auth/authStore';
import { MODES } from './modes';

/** Shown over the map in "Have your say" until a citizen account is signed in. */
const auth = useAuthStore();
const mode = MODES.participate;
</script>

<template>
  <div class="gate" role="dialog" aria-labelledby="gate-title" aria-modal="false">
    <div class="card">
      <h2 id="gate-title">{{ mode.label }}</h2>
      <p>{{ mode.tagline }}</p>
      <template v-if="!auth.isAuthenticated">
        <p class="muted">You need an account to take part, so the municipality knows contributions come from real people. Your username is shown, never your name or email.</p>
        <div class="actions">
          <button type="button" class="primary" @click="auth.login(mode.path)">Log in</button>
          <button type="button" @click="auth.register(mode.path)">Create account</button>
        </div>
      </template>
      <p v-else class="muted">
        Your account (<strong>{{ auth.user?.username }}</strong>) doesn't have citizen access yet. Contact the municipality if you think it should.
      </p>
      <RouterLink to="/discover" class="back">Keep exploring Luleå instead</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.gate {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.25);
}

.card {
  max-width: 420px;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border-top: 4px solid var(--accent-participate);
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

h2 {
  margin: 0 0 0.4rem;
}

.muted {
  color: #475569;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

button {
  padding: 0.45rem 1rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}

.primary {
  border-color: var(--accent-participate);
  background: var(--accent-participate);
  color: #fff;
}

.back {
  font-size: 0.9rem;
}
</style>
