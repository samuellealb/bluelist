import type { useFollowsStore } from '~/src/stores/follows';

export interface FollowItem {
  did: string;
  handle: string;
  name?: string;
  description?: string;
}

export interface BskyFollowsResponse {
  follows: Array<{
    did: string;
    handle: string;
    displayName?: string;
    description?: string;
  }>;
  cursor?: string;
}

export type FollowsStore = ReturnType<typeof useFollowsStore>;
