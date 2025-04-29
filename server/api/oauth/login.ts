import { defineEventHandler, getQuery, createError } from 'h3';
import { oauthService } from '~/src/lib/oauth/service';

/**
 * API route to initiate the OAuth login flow
 * Generates an authorization URL for the user to authenticate with Bluesky
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawHandle = query.handle as string | undefined;

  if (!rawHandle) {
    throw createError({
      statusCode: 400,
      message: 'Bluesky handle is required',
    });
  }

  // Normalize the handle by removing @ prefix if present
  const handle = rawHandle.startsWith('@') ? rawHandle.substring(1) : rawHandle;

  try {
    const authUrl = await oauthService.getAuthUrl(handle);
    return { url: authUrl };
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to generate authorization URL',
      cause: error,
    });
  }
});
