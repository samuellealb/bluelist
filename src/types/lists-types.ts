import type { useListsStore } from '~/src/stores/lists';

export interface ListItem {
  name: string;
  uri: string;
  description?: string;
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
    uri?: string;
  }>;
  cursor?: string;
  list?: {
    name: string;
    description?: string;
    uri: string;
  };
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

export interface ListMemberItem {
  did: string;
  handle: string;
  name?: string;
  description?: string;
  uri: string;
  avatar?: string;
}

export type ListsStore = ReturnType<typeof useListsStore>;
