import { NodeOAuthClient } from '@atproto/oauth-client-node';
import type { OAuthSession } from '@atproto/oauth-client-node';
import { Agent } from '@atproto/api';
import { stateStore, sessionStore } from './stores';
import { getClientMetadata } from './client-metadata';
import { useRuntimeConfig } from '#imports';

/**
 * OAuth Service for ATP Protocol
 * Handles authentication, authorization, and session management for Bluesky accounts
 */
export class OAuthService {
  private client: NodeOAuthClient | null = null;
  private config = useRuntimeConfig();

  /**
   * Initialize the OAuth client with configuration
   */
  async initialize(): Promise<void> {
    if (this.client) return;

    this.client = new NodeOAuthClient({
      clientMetadata: getClientMetadata(),
      stateStore,
      sessionStore,
    });

    // Set up event listeners for session updates and deletion
    this.client.addEventListener('updated', (event) => {
      console.log('Session updated:', event.detail.sub);
    });

    this.client.addEventListener('deleted', (event) => {
      console.log(
        'Session deleted:',
        event.detail.sub,
        'Cause:',
        event.detail.cause
      );
    });
  }

  /**
   * Generate an authorization URL for the user to authenticate with Bluesky
   * @param handle - The user's Bluesky handle (e.g., username.bsky.social)
   * @param state - Optional state parameter for additional security
   * @returns The authorization URL
   */
  async getAuthUrl(handle: string, state?: string): Promise<URL> {
    if (!this.client) {
      await this.initialize();
    }

    return this.client!.authorize(handle, { state });
  }

  /**
   * Exchange an authorization code for an access token
   * @param code - The authorization code from the callback
   * @param state - The state parameter from the callback
   * @returns The user's session information
   */
  async handleCallback(code: string, state: string): Promise<OAuthSession> {
    if (!this.client) {
      await this.initialize();
    }

    const result = await this.client!.callback(
      new URLSearchParams({ code, state })
    );
    return result.session;
  }

  /**
   * Get an API agent for a user
   * @param did - The user's DID
   * @returns An authenticated ATP agent or null if the user is not authenticated
   */
  async getAgent(did: string): Promise<Agent | null> {
    if (!this.client) {
      await this.initialize();
    }

    const session = await this.client!.restore(did);
    if (!session) return null;

    return new Agent(session);
  }

  /**
   * Sign out a user
   * @param did - The user's DID
   */
  async signOut(did: string): Promise<void> {
    if (!this.client) {
      await this.initialize();
    }

    const session = await this.client!.restore(did);
    if (session) {
      await session.signOut();
    }
  }
}

// Create a singleton instance
export const oauthService = new OAuthService();
