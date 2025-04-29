import { defineEventHandler, createError, setCookie, getQuery } from 'h3';
import { OAuthService } from '~/src/lib/oauth/service';

const oauthService = new OAuthService();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;
  const state = query.state as string;

  if (!code || !state) {
    throw createError({
      statusCode: 400,
      message: 'Authorization code and state are required',
    });
  }

  try {
    const session = await oauthService.handleCallback(code, state);

    // Set cookie configuration for persistent session
    setCookie(event, 'user_did', session.sub, {
      httpOnly: true,
      secure: false, // Keep as false to work in non-HTTPS development
      sameSite: 'strict', // Maintain the original setting
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/', // Ensure cookie is available across the entire site
    });

    return {
      success: true,
      did: session.sub,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error handling OAuth callback:', message);
    throw createError({
      statusCode: 500,
      message: 'Authentication failed',
    });
  }
});
