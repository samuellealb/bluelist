import { AtpAgent } from '@atproto/api';
import type { BskyAgent } from '~/src/types/index';
import { useRuntimeConfig } from '#imports';

let agentInstance: AtpAgent | null = null;

/**
 * API Service object for centralizing ATP agent initialization and management
 */
export const AtpService = {
  /**
   * Gets the singleton ATP agent instance or creates a new one if none exists
   * @returns {AtpAgent} - The ATP agent instance
   */
  getAgent(): AtpAgent {
    if (!agentInstance) {
      const config = useRuntimeConfig();
      agentInstance = new AtpAgent({
        service: config.public.atpService as string,
      });
    }
    return agentInstance;
  },

  /**
   * Gets the agent instance as a BskyAgent type for specialized API calls
   * @returns {BskyAgent} - The agent instance as a BskyAgent
   */
  getBskyAgent(): BskyAgent {
    return this.getAgent() as unknown as BskyAgent;
  },

  /**
   * Resets the agent instance
   * This is useful for logout or when needing to create a fresh agent
   */
  resetAgent(): void {
    agentInstance = null;
  },

  /**
   * Sets authorization header for the agent
   * @param {string} token - JWT access token
   */
  setAuthToken(token: string): void {
    const agent = this.getAgent();
    agent.setHeader('Authorization', `Bearer ${token}`);
  },
};
