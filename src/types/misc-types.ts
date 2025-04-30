export interface DataObject {
  type:
    | 'timeline'
    | 'lists'
    | 'follows'
    | 'error'
    | 'loading'
    | 'list-posts'
    | 'list-members';
  data:
    | import('./bsky-types').TimelineItem[]
    | import('./lists-types').ListItem[]
    | import('./follows-types').FollowItem[]
    | import('./suggestions-types').SuggestionItem[]
    | { message: string }[];
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalPrefetched?: number;
    hasMorePages?: boolean;
  };
  listInfo?: {
    name: string;
    description?: string;
    uri: string;
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
