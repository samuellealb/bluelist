import { defineEventHandler, getCookie } from 'h3';
import { OAuthService } from '~/src/lib/oauth/service';

const oauthService = new OAuthService();

export default defineEventHandler(async (event) => {
  // Get the user DID from the cookie
  const userDid = getCookie(event, 'user_did');

  if (!userDid) {
    return { authenticated: false };
  }

  try {
    // Verify that the session is valid by getting the agent
    const agent = await oauthService.getAgent(userDid);

    if (!agent) {
      return { authenticated: false };
    }

    // Get the user profile if the session is valid
    const profile = await agent.getProfile({ actor: userDid });

    // Return complete user information
    return {
      authenticated: true,
      did: userDid,
      handle: profile.data.handle,
      displayName: profile.data.displayName,
      avatar: profile.data.avatar,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching user profile:', message);
    return { authenticated: false };
  }
});
