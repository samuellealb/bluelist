import type {
  NodeSavedSession,
  NodeSavedState,
} from '@atproto/oauth-client-node';
import { useStorage } from 'nitropack/runtime/internal/storage';

/**
 * Storage utilities for OAuth state and session management
 * These functions handle persistent storage for OAuth state and user sessions
 */

// Create storage for OAuth state (used during authorization flow)
const stateStorage = useStorage('oauth:states');

export const stateStore = {
  /**
   * Store OAuth state
   * @param key - The state key to store
   * @param state - The state data to store
   */
  async set(key: string, state: NodeSavedState): Promise<void> {
    await stateStorage.setItem(key, state);
  },

  /**
   * Retrieve OAuth state
   * @param key - The state key to retrieve
   * @returns The state data or undefined if not found
   */
  async get(key: string): Promise<NodeSavedState | undefined> {
    return stateStorage.getItem(key) as Promise<NodeSavedState | undefined>;
  },

  /**
   * Delete OAuth state
   * @param key - The state key to delete
   */
  async del(key: string): Promise<void> {
    await stateStorage.removeItem(key);
  },
};

// Create storage for user sessions
const sessionStorage = useStorage('oauth:sessions');

export const sessionStore = {
  /**
   * Store user session
   * @param sub - The user identifier (DID)
   * @param session - The session data to store
   */
  async set(sub: string, session: NodeSavedSession): Promise<void> {
    await sessionStorage.setItem(sub, session);
  },

  /**
   * Retrieve user session
   * @param sub - The user identifier (DID)
   * @returns The session data or undefined if not found
   */
  async get(sub: string): Promise<NodeSavedSession | undefined> {
    return sessionStorage.getItem(sub) as Promise<NodeSavedSession | undefined>;
  },

  /**
   * Delete user session
   * @param sub - The user identifier (DID) to delete
   */
  async del(sub: string): Promise<void> {
    await sessionStorage.removeItem(sub);
  },
};
