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

export interface BskyAgent {
  app: {
    bsky: {
      graph: {
        getFollows: (params: {
          actor: string;
          limit: number;
          cursor?: string;
        }) => Promise<{ data: import('./follows-types').BskyFollowsResponse }>;
        getLists: (params: {
          actor: string;
          limit: number;
          cursor?: string;
        }) => Promise<{ data: import('./lists-types').BskyListsResponse }>;
        getList: (params: {
          list: string;
          limit: number;
          cursor?: string;
        }) => Promise<{ data: import('./lists-types').BskyListItemsResponse }>;
        getListMembers: (params: {
          list: string;
          limit: number;
          cursor?: string;
        }) => Promise<{
          data: {
            members: Array<{
              did: string;
              handle: string;
              displayName?: string;
              description?: string;
              avatar?: string;
              uri: string;
            }>;
            cursor?: string;
          };
        }>;
      };
      feed: {
        getListFeed: (params: {
          list: string;
          limit: number;
        }) => Promise<{ data: BskyTimelineResponse }>;
      };
    };
  };
  com: {
    atproto: {
      repo: {
        createRecord: (
          params: import('./lists-types').RepoCreateRecordParams
        ) => Promise<{ data: { uri: string; cid: string } }>;
        deleteRecord: (params: {
          repo: string;
          collection: string;
          rkey: string;
        }) => Promise<void>;
        putRecord: (params: {
          repo: string;
          collection: string;
          rkey: string;
          record: Record<string, unknown>;
        }) => Promise<{ data: { uri: string; cid: string } }>;
      };
    };
  };
  getTimeline: (params: {
    limit: number;
  }) => Promise<{ data: BskyTimelineResponse }>;
  getProfile: (params: { actor: string }) => Promise<{
    data: {
      did: string;
      handle: string;
      displayName?: string;
      description?: string;
      avatar?: string;
    };
  }>;
  login: (params: { identifier: string; password: string }) => Promise<{
    data: import('./auth-types').BskyLoginResponse;
    success: boolean;
  }>;
  api: {
    setHeader: (name: string, value: string) => void;
  };
}

export interface DetailedResult {
  profileName: string;
  profileDid: string;
  listName: string;
  listUri: string;
  success: boolean;
  message: string;
  isDuplicate: boolean;
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
