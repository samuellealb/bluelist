import { useAuthStore } from '~/src/stores/auth';
import { checkLoginSession } from '~/src/lib/bsky';

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  if (!authStore.initialized) {
    try {
      await checkLoginSession();
      authStore.setInitialized(true);
    } catch (error) {
      console.error('Error initializing auth session:', error);
    }
  }

  if (!authStore.isLoggedIn && to.path !== '/') {
    return navigateTo('/', { replace: true });
  }

  if (authStore.isLoggedIn && to.path === '/') {
    return navigateTo('/lists', { replace: true });
  }
});
