import { defineEventHandler, getCookie, deleteCookie } from 'h3';
import { oauthService } from '~/src/lib/oauth/service';

/**
 * API route to handle user logout
 * This endpoint signs the user out of their Bluesky session and clears cookies
 */
export default defineEventHandler(async (event) => {
  const userDid = getCookie(event, 'user_did');

  if (userDid) {
    try {
      // Sign out from the ATP service
      await oauthService.signOut(userDid);

      // Remove the authentication cookie
      deleteCookie(event, 'user_did');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error during sign out:', message);
    }
  }

  return { success: true };
});
