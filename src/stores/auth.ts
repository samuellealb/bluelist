import { defineStore } from 'pinia';
import { OAuthService } from '~/src/lib/OAuthService';
import { useSuggestionsStore } from './suggestions';
import type { OAuthSession } from '@atproto/oauth-client-browser';
import type { Agent } from '@atproto/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    formInfo: '',
    loginError: '',
    did: '',
    isLoggedIn: false,
    initialized: false,
    currentSession: null as OAuthSession | null,
    currentAgent: null as Agent | null,
  }),

  actions: {
    setFormInfo(info: string) {
      this.formInfo = info;
    },

    setLoginError(error: string) {
      this.loginError = error;
    },

    setDid(did: string) {
      this.did = did;
    },

    login(session: OAuthSession) {
      this.isLoggedIn = true;
      this.currentSession = session;
      this.currentAgent = OAuthService.createAgent(session);
      this.did = session.sub;

      const suggestionsStore = useSuggestionsStore();
      suggestionsStore.loadRequestCounts();
    },

    logout() {
      this.formInfo = '';
      this.loginError = '';
      this.did = '';
      this.isLoggedIn = false;
      this.currentSession = null;
      this.currentAgent = null;
      OAuthService.reset();
    },

    setInitialized(value: boolean) {
      this.initialized = value;
    },

    getAgent() {
      return this.currentAgent;
    },

    /**
     * Initialize OAuth and check for existing sessions
     */
    async initializeOAuth(): Promise<void> {
      try {
        const config = useRuntimeConfig();

        await OAuthService.initialize({
          clientId: config.public.oauthClientId as string,
          redirectUri: config.public.oauthRedirectUri as string,
          appOrigin: config.public.appOrigin as string,
        });

        const result = await OAuthService.initSession();

        if (result) {
          const { session, state } = result;
          if (state) {
            this.setFormInfo(`Successfully authenticated as ${session.sub}`);
          } else {
            this.setFormInfo(`Session restored for ${session.sub}`);
          }
          this.login(session);
        }

        OAuthService.onSessionDeleted(({ sub, cause }) => {
          console.error(`Session for ${sub} deleted:`, cause);
          if (this.did === sub) {
            this.handleSessionExpired();
          }
        });
      } catch (error) {
        console.error('Failed to initialize OAuth:', error);
        this.setLoginError('Failed to initialize authentication system');
      }
    },

    /**
     * Sign in with handle using OAuth
     */
    async signInWithHandle(handle: string): Promise<void> {
      this.setLoginError('');

      if (!handle || handle.trim() === '') {
        this.setLoginError('Handle is required');
        return;
      }

      try {
        await OAuthService.signIn(handle, {
          state: crypto.randomUUID(),
        });
      } catch (error) {
        console.error('Sign in error:', error);
        this.setLoginError(`Sign in failed: ${(error as Error).message}`);
      }
    },

    /**
     * Restore a session by DID
     */
    async restoreSession(did: string): Promise<void> {
      try {
        const session = await OAuthService.restoreSession(did);
        this.login(session);
      } catch (error) {
        console.error('Failed to restore session:', error);
        throw error;
      }
    },

    /**
     * Check for an existing login session
     */
    async checkLoginSession(): Promise<void> {
      try {
        if (!this.initialized) {
          await this.initializeOAuth();
        }
      } catch (error) {
        console.error('Failed to check login session:', error);
        this.setFormInfo('Session could not be restored. Please login again.');
      }
    },

    /**
     * Handle expired sessions
     */
    handleSessionExpired(): void {
      this.setFormInfo('Session expired. Please login again.');
      this.logout();
      window.location.reload();
    },

    /**
     * Legacy methods kept for backward compatibility (will be removed)
     */
    async loginUser(_identifier: string, _password: string): Promise<void> {
      this.setLoginError(
        'Traditional login is no longer supported. Please use OAuth login with your handle.'
      );
    },

    getJwtExpiry(_jwt: string): number | null {
      return null;
    },

    decodeBase64(str: string): string {
      try {
        if (typeof window !== 'undefined' && window.atob) {
          return decodeURIComponent(
            window
              .atob(str)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
        } else if (typeof Buffer !== 'undefined') {
          return Buffer.from(str, 'base64').toString('utf-8');
        } else {
          const binaryString = atob(str);
          return decodeURIComponent(
            binaryString
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
        }
      } catch (error) {
        console.error('Error decoding base64:', error);
        return '';
      }
    },

    isTokenExpiringSoon(_expiryTime: number): boolean {
      return false;
    },
  },
});
