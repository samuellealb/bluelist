import { useAuthStore } from '~/src/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const authStore = useAuthStore();

  // Check if the auth cookie exists on every navigation, not just initialization
  // This is crucial for address bar navigation where SPA routing isn't triggering
  const checkForCookieAuth = async () => {
    try {
      // Force a re-check with the server
      const isAuthenticated = await authStore.checkOAuthSession();
      return isAuthenticated;
    } catch (error) {
      console.error('Error checking auth session:', error);
      return false;
    }
  };

  if (!authStore.initialized) {
    try {
      await authStore.checkLoginSession();
      authStore.setInitialized(true);
    } catch (error) {
      console.error('Error initializing auth session:', error);
    }
  } else if (!authStore.isLoggedIn && to.path !== '/') {
    // If we don't think we're logged in but we're trying to navigate to a protected route,
    // check with the server first before redirecting
    const hasServerSession = await checkForCookieAuth();
    if (hasServerSession) {
      // Session exists on server but not in local state
      return; // Allow navigation to continue
    }
  } else if (
    to.path !== '/' &&
    to.path.startsWith('/oauth/callback') === false
  ) {
    // For page refreshes and address bar navigation, verify auth state
    // Skip this for the home and oauth callback pages
    await checkForCookieAuth();
  }

  if (
    !authStore.isLoggedIn &&
    to.path !== '/' &&
    to.path.startsWith('/oauth/callback') === false
  ) {
    return navigateTo('/', { replace: true });
  }

  if (authStore.isLoggedIn && to.path === '/') {
    return navigateTo('/lists', { replace: true });
  }
});
