import type { useAuthStore } from '~/src/stores/auth';
import type { useFollowsStore } from '~/src/stores/follows';
import type { useListsStore } from '~/src/stores/lists';

export interface Author {
  did: string;
  handle: string;
  name?: string;
}

export interface TimelineItem {
  uri: string;
  cid: string;
  author: Author;
  text: string;
  indexedAt: string;
}

export interface ListItem {
  name: string;
  uri: string;
  description?: string;
}

export interface FollowItem {
  did: string;
  handle: string;
  name?: string;
  description?: string;
}

export interface SuggestedList {
  name: string;
  description: string;
  uri: string;
}

export interface SuggestionItem {
  name: string;
  did: string;
  description: string;
  suggestedLists: SuggestedList[];
}

export interface DataObject {
  type: 'timeline' | 'lists' | 'follows' | 'error' | 'loading';
  data:
    | TimelineItem[]
    | ListItem[]
    | FollowItem[]
    | SuggestionItem[]
    | { message: string }[];
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalPrefetched?: number;
    hasMorePages?: boolean;
  };
}

export interface ApiResponseList {
  name: string;
  uri: string;
}

export interface ApiResponseItem {
  name: string;
  did: string;
  description?: string;
  lists?: ApiResponseList[];
}

export interface ApiResponse {
  data: ApiResponseItem[];
  error?: string;
}

export interface SimplifiedUser {
  name: string;
  description: string;
  did?: string;
}

export interface SimplifiedList {
  name: string;
  description: string;
  uri?: string;
}

export type FollowsStore = ReturnType<typeof useFollowsStore>;
export type ListsStore = ReturnType<typeof useListsStore>;
export type AuthStore = ReturnType<typeof useAuthStore>;

export interface BskyFollowsResponse {
  follows: Array<{
    did: string;
    handle: string;
    displayName?: string;
    description?: string;
  }>;
  cursor?: string;
}

export interface BskyListsResponse {
  lists: Array<{
    name: string;
    uri: string;
    description?: string;
  }>;
  cursor?: string;
}

export interface BskyListItemsResponse {
  items: Array<{
    subject: {
      did: string;
    };
  }>;
}

export interface BskyTimelineResponse {
  feed: Array<{
    post: {
      uri: string;
      cid: string;
      author: {
        did: string;
        handle: string;
        displayName?: string;
      };
      record: {
        text: string;
      };
      indexedAt: string;
    };
  }>;
}

export interface BskyLoginResponse {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
}

export interface RepoCreateRecordParams {
  repo: string;
  collection: string;
  record: {
    $type: string;
    subject: string;
    list: string;
    createdAt: string;
  };
}

export interface BskyAgent {
  app: {
    bsky: {
      graph: {
        getFollows: (params: {
          actor: string;
          limit: number;
          cursor?: string;
        }) => Promise<{ data: BskyFollowsResponse }>;
        getLists: (params: {
          actor: string;
          limit: number;
          cursor?: string;
        }) => Promise<{ data: BskyListsResponse }>;
        getList: (params: {
          list: string;
          limit: number;
        }) => Promise<{ data: BskyListItemsResponse }>;
      };
    };
  };
  com: {
    atproto: {
      repo: {
        createRecord: (
          params: RepoCreateRecordParams
        ) => Promise<{ data: { uri: string; cid: string } }>;
      };
    };
  };
  getTimeline: (params: {
    limit: number;
  }) => Promise<{ data: BskyTimelineResponse }>;
  login: (params: {
    identifier: string;
    password: string;
  }) => Promise<{ data: BskyLoginResponse; success: boolean }>;
  api: {
    setHeader: (name: string, value: string) => void;
  };
}

export interface RequestCounts {
  [date: string]: number;
}
