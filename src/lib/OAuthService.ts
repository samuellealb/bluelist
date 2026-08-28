import {
  BrowserOAuthClient,
  buildLoopbackClientId,
  atprotoLoopbackClientMetadata,
} from '@atproto/oauth-client-browser';
import { Agent } from '@atproto/api';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import { OAUTH_SCOPE } from './oauthScope';

let oauthClient: BrowserOAuthClient | null = null;
let sessionDeletedCallback:
  | ((event: { sub: string; cause: Error }) => void)
  | null = null;

/**
 * OAuth Service for managing atproto OAuth authentication
 */
export const OAuthService = {
  /**
   * Initialize the OAuth client. Client configuration is derived entirely from
   * the current browser origin so the same code works unmodified on localhost,
   * any Vercel preview URL, and production, with no per-environment config.
   */
  async initialize(): Promise<BrowserOAuthClient> {
    if (oauthClient) {
      return oauthClient;
    }

    try {
      const { hostname, origin } = window.location;
      const isLocalhost =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]';
      // Deletion is reported via this constructor hook, not an emitted event.
      const onDelete = (sub: string, cause: unknown) =>
        sessionDeletedCallback?.({ sub, cause: cause as Error });

      if (isLocalhost) {
        // Loopback client: the library defaults to scope "atproto" only, so
        // the desired scope must be embedded in the client_id's query string
        // per the atproto spec's loopback rules (parsed by the AS the same way).
        const loopbackClientId = `${buildLoopbackClientId(
          window.location
        )}&scope=${encodeURIComponent(OAUTH_SCOPE)}`;
        oauthClient = new BrowserOAuthClient({
          handleResolver: 'https://bsky.social',
          clientMetadata: atprotoLoopbackClientMetadata(loopbackClientId),
          onDelete,
        });
      } else {
        // Deployed client: metadata is served dynamically at this same
        // origin's /client-metadata.json (see server/routes/client-metadata.json.ts).
        oauthClient = await BrowserOAuthClient.load({
          clientId: `${origin}/client-metadata.json`,
          handleResolver: 'https://bsky.social',
          onDelete,
        });
      }

      return oauthClient;
    } catch (error) {
      console.error('Failed to initialize OAuth client:', error);
      throw new Error('Failed to initialize OAuth client');
    }
  },

  /**
   * Get the OAuth client instance
   */
  getClient(): BrowserOAuthClient | null {
    return oauthClient;
  },

  /**
   * Initialize session management
   */
  async initSession(): Promise<
    { session: OAuthSession; state?: string } | undefined
  > {
    if (!oauthClient) {
      throw new Error('OAuth client not initialized');
    }

    try {
      const result = await oauthClient.init();
      if (result) {
        return {
          session: result.session,
          state: 'state' in result ? result.state || undefined : undefined,
        };
      }
      return undefined;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw error;
    }
  },

  /**
   * Sign in with handle
   */
  async signIn(handle: string, options?: { state?: string }): Promise<void> {
    if (!oauthClient) {
      throw new Error('OAuth client not initialized');
    }

    if (!handle || handle.trim() === '') {
      throw new Error('Handle is required');
    }

    try {
      await oauthClient.signIn(handle.trim(), {
        state: options?.state || crypto.randomUUID(),
      });
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  },

  /**
   * Restore a session by DID
   */
  async restoreSession(did: string): Promise<OAuthSession> {
    if (!oauthClient) {
      throw new Error('OAuth client not initialized');
    }

    try {
      return await oauthClient.restore(did);
    } catch (error) {
      console.error('Failed to restore session:', error);
      throw error;
    }
  },

  /**
   * Create an Agent from an OAuth session
   */
  createAgent(session: OAuthSession): Agent {
    // Use the standard OAuth agent creation
    // The session contains the necessary authentication tokens
    const agent = new Agent(session);

    return agent;
  },

  /**
   * Listen for session deletion events
   */
  onSessionDeleted(
    callback: (event: { sub: string; cause: Error }) => void
  ): void {
    if (!oauthClient) {
      throw new Error('OAuth client not initialized');
    }

    sessionDeletedCallback = callback;
  },

  /**
   * Reset the OAuth client
   */
  reset(): void {
    oauthClient = null;
    sessionDeletedCallback = null;
  },
};
