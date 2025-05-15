import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
import { AtpService } from '~/src/lib/AtpService';
import { useRuntimeConfig } from '#imports';

let oauthClient: BrowserOAuthClient | null = null;

/**
 * Service for handling OAuth authentication with Bluesky
 */
export const OAuthService = {
  /**
   * Gets the OAuth client instance or creates one if it doesn't exist
   * @returns {BrowserOAuthClient} The OAuth client instance
   */ getOAuthClient(): BrowserOAuthClient {
    if (!oauthClient) {
      const config = useRuntimeConfig();
      const atpService = config.public.atpService as string;
      const oauthConfig = config.public.oauth as Record<string, string>; // Check if we're on localhost
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      // Fix line break issue above
      if (isLocalhost) {
        // For localhost development, use loopback client with special redirect URI

        oauthClient = new BrowserOAuthClient({
          handleResolver: atpService,
          clientMetadata: undefined,
        });
      } else {
        // For production and preview, create a client with proper metadata
        oauthClient = new BrowserOAuthClient({
          handleResolver: atpService,
          clientMetadata: {
            client_id: `${oauthConfig.appOrigin}/client-metadata.json`,
            client_name: 'Bluelist',
            client_uri: oauthConfig.appOrigin,
            redirect_uris: [oauthConfig.redirectUri],
            scope: 'atproto',
            grant_types: ['authorization_code', 'refresh_token'],
            response_types: ['code'],
            token_endpoint_auth_method: 'none',
            dpop_bound_access_tokens: true,
            application_type: 'web',
          },
        });
      }
    }

    // Need to assert it's not null
    return oauthClient as BrowserOAuthClient;
  },

  /**
   * Resets the OAuth client
   */
  resetOAuthClient(): void {
    if (oauthClient) {
      oauthClient.dispose();
      oauthClient = null;
    }
  },

  /**
   * Redirects the user to the Bluesky OAuth authorization page
   * @param {string} handle - The user's Bluesky handle to pre-fill (optional)
   */ redirectToAuthPage(handle: string = ''): void {
    try {
      // Reset the client first to ensure a clean state
      this.resetOAuthClient();

      // Get a fresh client instance
      const client = this.getOAuthClient();

      if (handle) {
        // If handle is provided, use it to sign in
        client.signInRedirect(handle);
      } else {
        // If no handle is provided, just use the ATP service URL
        const config = useRuntimeConfig();
        client.signInRedirect(config.public.atpService as string);
      }
    } catch (err) {
      console.error('Error redirecting to auth page:', err);
      throw err;
    }
  },

  /**
   * Processes the OAuth callback and extracts the access token
   * @returns {Promise<{accessToken: string, refreshToken: string, did: string, handle: string}>}
   * The access token, refresh token, DID and handle
   */ async handleCallback(): Promise<{
    accessToken: string;
    refreshToken: string;
    did: string;
    handle: string;
  }> {
    // Reset any existing client first to ensure a clean state
    this.resetOAuthClient();

    // Get a fresh client for handling the callback
    const client = this.getOAuthClient();

    try {
      // Add debug logging
      console.log(
        'Processing OAuth callback, current URL:',
        typeof window !== 'undefined' ? window.location.href : 'Server side'
      );

      // Initialize the client to handle the callback
      const result = await client.signInCallback();
      if (!result) {
        throw new Error('No authentication result found in callback');
      }

      const { session } = result;

      // Since we need the actual access token, we need to use a workaround
      // The tokenSet is available in the server agent but not directly exposed
      // Use type assertion to access the internal implementation
      const server = session.server as unknown as {
        getTokenSet: (refresh: boolean | 'auto') => Promise<{
          access_token: string;
          refresh_token?: string;
        }>;
      };

      const tokenSet = await server.getTokenSet('auto');
      const accessToken = tokenSet.access_token;
      const refreshToken = tokenSet.refresh_token || '';

      if (!accessToken) {
        throw new Error('Failed to obtain access token');
      }

      // Set the access token in AtpService
      AtpService.setAuthToken(accessToken);

      // Fetch the user profile to get handle
      const agent = AtpService.getAgent();
      const { data } = await agent.getProfile({ actor: session.sub });

      return {
        accessToken,
        refreshToken,
        did: session.sub,
        handle: data.handle,
      };
    } catch (err) {
      console.error('Error handling OAuth callback:', err);
      throw err;
    }
  },
};
