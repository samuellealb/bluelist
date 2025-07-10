import { BrowserOAuthClient } from '@atproto/oauth-client-browser';
import { Agent } from '@atproto/api';
import type { OAuthSession } from '@atproto/oauth-client-browser';

let oauthClient: BrowserOAuthClient | null = null;

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  appOrigin: string;
}

/**
 * OAuth Service for managing atproto OAuth authentication
 */
export const OAuthService = {
  /**
   * Initialize the OAuth client
   */
  async initialize(config: OAuthConfig): Promise<BrowserOAuthClient> {
    if (oauthClient) {
      return oauthClient;
    }

    try {
      const currentOrigin =
        typeof window !== 'undefined'
          ? window.location.origin
          : config.appOrigin;
      const isLocalhost =
        currentOrigin.includes('localhost') ||
        currentOrigin.includes('127.0.0.1') ||
        currentOrigin.includes('[::1]') ||
        currentOrigin.includes('bluelist-local.blue');

      if (isLocalhost) {
        // Use localhost configuration - this automatically handles the loopback client
        oauthClient = new BrowserOAuthClient({
          handleResolver: 'https://bsky.social',
          clientMetadata: undefined, // This enables loopback client mode
        });
      } else {
        // Use deployed environment configuration by loading metadata from URL
        oauthClient = await BrowserOAuthClient.load({
          clientId: config.clientId,
          handleResolver: 'https://bsky.social',
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
      return undefined;
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
    return new Agent(session);
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

    oauthClient.addEventListener('deleted', (event: CustomEvent) => {
      callback(event.detail);
    });
  },

  /**
   * Reset the OAuth client
   */
  reset(): void {
    oauthClient = null;
  },
};
