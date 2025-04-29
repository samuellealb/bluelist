import { defineStore } from 'pinia';
import { AtpService } from '~/src/lib/AtpService';
import { useSuggestionsStore } from './suggestions';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    formInfo: '',
    loginError: '',
    did: '',
    isLoggedIn: false,
    initialized: false,
    isOauthLoading: false,
    handle: '',
    avatar: '',
    displayName: '',
  }),

  actions: {
    // Existing actions
    setFormInfo(info: string) {
      this.formInfo = info;
    },

    setLoginError(error: string) {
      this.loginError = error;
    },

    setDid(did: string) {
      this.did = did;
    },

    login() {
      this.isLoggedIn = true;
      const suggestionsStore = useSuggestionsStore();
      suggestionsStore.loadRequestCounts();
    },

    logout() {
      this.formInfo = '';
      this.loginError = '';
      this.did = '';
      this.handle = '';
      this.avatar = '';
      this.displayName = '';
      this.isLoggedIn = false;
      AtpService.resetAgent();
      localStorage.removeItem('loginData');
    },

    setInitialized(value: boolean) {
      this.initialized = value;
    },

    getAgent() {
      return AtpService.getAgent();
    },

    /**
     * Logs in a user to Bluesky using their credentials
     * @param identifier - Email address of the user
     * @param password - User's password
     * @returns {Promise<void>} - A Promise that resolves when login completes
     * @throws {Error} - Throws when rate limit is exceeded or other login errors occur
     */
    async loginUser(identifier: string, password: string): Promise<void> {
      this.setLoginError('');
      const agent = AtpService.getAgent();

      try {
        if (!identifier.includes('@')) {
          this.setLoginError(
            'Please use your email address to login, not your handle'
          );
          return;
        }

        const { data: loginData, success } = await agent.login({
          identifier,
          password,
        });

        if (success) {
          const { did: userDid, handle, accessJwt } = loginData;
          this.setFormInfo(`Logged in as ${handle} with DID ${userDid}`);
          this.setDid(userDid);
          this.login();

          // Set the auth token using the centralized API Service
          AtpService.setAuthToken(accessJwt);

          localStorage.setItem('loginData', JSON.stringify({ loginData }));
        } else {
          this.setFormInfo('Login Failed');
        }
      } catch (error) {
        if ((error as Error).message.includes('Rate Limit Exceeded')) {
          this.setLoginError(
            'Login failed: Rate limit exceeded. Please use your email address to login.'
          );
        } else {
          this.setLoginError(`Login failed: ${(error as Error).message}`);
        }
        console.error('Login error:', error);
      }
    },

    /**
     * Initiates OAuth login flow with Bluesky
     * @param handle - The user's Bluesky handle (username.bsky.social)
     * @returns {Promise<string>} - A Promise that resolves with the authorization URL
     */
    async initiateOAuthLogin(handle: string): Promise<string> {
      this.isOauthLoading = true;
      this.setLoginError('');

      try {
        const { data } = await useFetch<{ url?: string }>('/api/oauth/login', {
          query: { handle },
        });

        if (data.value?.url) {
          return data.value.url;
        } else {
          throw new Error('No authorization URL returned');
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.setLoginError(`OAuth login failed: ${message}`);
        throw error;
      } finally {
        this.isOauthLoading = false;
      }
    },

    /**
     * Completes the OAuth flow after redirection
     * @param code - Authorization code from the callback
     * @param state - State parameter from the callback
     * @returns {Promise<void>} - A Promise that resolves when login completes
     */
    async completeOAuthLogin(code: string, state: string): Promise<void> {
      this.isOauthLoading = true;
      this.setLoginError('');

      try {
        const { data } = await useFetch<{ success?: boolean; did?: string }>(
          '/api/oauth/callback',
          {
            query: { code, state },
          }
        );

        if (data.value?.success && data.value.did) {
          await this.fetchUserProfile();
        } else {
          throw new Error('OAuth authentication failed');
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        this.setLoginError(`OAuth authentication failed: ${message}`);
        throw error;
      } finally {
        this.isOauthLoading = false;
      }
    },

    /**
     * Fetches the user's profile after successful authentication
     * @returns {Promise<void>} - A Promise that resolves when profile is fetched
     */
    async fetchUserProfile(): Promise<void> {
      try {
        const { data } = await useFetch<{
          authenticated: boolean;
          did?: string;
          handle?: string;
          displayName?: string;
          avatar?: string;
        }>('/api/oauth/me');

        if (data.value?.authenticated && data.value.did) {
          this.did = data.value.did;
          this.handle = data.value.handle || '';
          this.displayName = data.value.displayName || '';
          this.avatar = data.value.avatar || '';
          this.login();

          this.setFormInfo(`Logged in as ${this.handle} with DID ${this.did}`);
        } else {
          this.logout();
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        this.logout();
      }
    },

    /**
     * Logs the user out via OAuth
     * @returns {Promise<void>} - A Promise that resolves when logout completes
     */
    async oauthLogout(): Promise<void> {
      try {
        await useFetch('/api/oauth/logout');
        this.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    },

    /**
     * Checks if the user is authenticated via OAuth
     * @returns {Promise<boolean>} - A Promise that resolves with authentication status
     */
    async checkOAuthSession(): Promise<boolean> {
      try {
        // Use a unique cache key for each request to prevent stale authentication data
        // This is critical for address bar navigation where we need fresh auth state
        const { data } = await useFetch<{
          authenticated: boolean;
          did?: string;
          handle?: string;
          displayName?: string;
          avatar?: string;
        }>('/api/oauth/me', {
          key: `oauth-session-${Date.now()}`,
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (data.value?.authenticated && data.value.did) {
          // Update local auth state with server data
          this.did = data.value.did;
          this.handle = data.value.handle || '';
          this.displayName = data.value.displayName || '';
          this.avatar = data.value.avatar || '';
          this.login();

          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error checking OAuth session:', error);
        return false;
      }
    },

    /**
     * Checks for an existing login session and restores it
     * @returns {Promise<void>} - No return value
     * @throws {Error} - If session data cannot be parsed or is invalid
     */
    async checkLoginSession(): Promise<void> {
      // First try OAuth session
      const hasOAuthSession = await this.checkOAuthSession();

      // If no OAuth session, fall back to legacy session
      if (!hasOAuthSession) {
        const storedData = localStorage.getItem('loginData');
        if (!storedData) {
          return;
        }

        try {
          const parsedData = JSON.parse(storedData);

          if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Invalid session data format');
          }

          if (!parsedData.loginData) {
            throw new Error('Missing login data in stored session');
          }

          const { loginData } = parsedData;

          if (!loginData.did || !loginData.handle || !loginData.accessJwt) {
            throw new Error('Incomplete login data in stored session');
          }

          this.setFormInfo(
            `Logged in as ${loginData.handle} with DID ${loginData.did}`
          );
          this.setDid(loginData.did);
          this.login();

          // Set the auth token using the centralized API Service
          AtpService.setAuthToken(loginData.accessJwt);

          const jwtExpiry = this.getJwtExpiry(loginData.accessJwt);
          if (jwtExpiry && this.isTokenExpiringSoon(jwtExpiry)) {
            console.warn(
              'Auth token expiring soon - user may need to re-authenticate'
            );
          }
        } catch (error) {
          console.error('Failed to restore session:', error);

          localStorage.removeItem('loginData');

          this.logout();
          this.setFormInfo(
            'Session could not be restored. Please login again.'
          );
        }
      }
    },

    /**
     * Helper function to handle expired sessions
     * @returns {void} - No return value
     */
    handleSessionExpired(): void {
      this.setFormInfo('Session expired. Please login again.');
      localStorage.removeItem('loginData');
      window.location.reload();
    },

    /**
     * Helper function to decode JWT and extract expiry time
     * @param {string} jwt - The JWT token
     * @returns {number|null} - Timestamp of token expiry or null if invalid
     */
    getJwtExpiry(jwt: string): number | null {
      try {
        const base64Url = jwt.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        const jsonPayload = this.decodeBase64(base64);

        const payload = JSON.parse(jsonPayload);
        return payload.exp ? payload.exp * 1000 : null;
      } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
      }
    },

    /**
     * Helper function to decode base64 safely
     * @param {string} str - The base64 string to decode
     * @returns {string} - The decoded string
     */
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

    /**
     * Check if token is expiring within the next 5 minutes
     * @param {number} expiryTime - Token expiry timestamp
     * @returns {boolean} - True if token expires soon
     */
    isTokenExpiringSoon(expiryTime: number): boolean {
      const fiveMinutesInMs = 5 * 60 * 1000;
      return Date.now() + fiveMinutesInMs > expiryTime;
    },
  },
});
