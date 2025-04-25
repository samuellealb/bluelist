import { state } from '~/src/store';
import { checkLoginSession } from '~/src/lib/bsky';

let authInitialized = false;

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  if (!authInitialized) {
    authInitialized = true;
    await checkLoginSession();
  }

  const isLoggedIn = state.isLoggedIn;

  if (!isLoggedIn && to.path !== '/') {
    return navigateTo('/');
  }

  if (isLoggedIn && to.path === '/') {
    return navigateTo('/lists');
  }
});
