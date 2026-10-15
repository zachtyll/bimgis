import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import { router } from './app/router';
import { useAuthStore } from './features/auth/authStore';

const app = createApp(App).use(createPinia()).use(router);

// Restore any existing session; anonymous users can still browse everything.
useAuthStore()
  .init()
  .catch((err) => console.error('Auth init failed', err));

app.mount('#app');
