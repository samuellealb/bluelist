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

    login() {
      this.isLoggedIn = true;
      const suggestionsStore = useSuggestionsStore();
      suggestionsStore.loadRequestCounts();
    },

    logout() {
      this.formInfo = '';
      this.loginError = '';
      this.did = '';
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
     * Checks for an existing login session and restores it
     * @returns {Promise<void>} - No return value
     * @throws {Error} - If session data cannot be parsed or is invalid
     */
    async checkLoginSession(): Promise<void> {
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
        this.setFormInfo('Session could not be restored. Please login again.');
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
