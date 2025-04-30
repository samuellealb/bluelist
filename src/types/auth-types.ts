import type { useAuthStore } from '~/src/stores/auth';

export interface BskyLoginResponse {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

export type AuthStore = ReturnType<typeof useAuthStore>;
