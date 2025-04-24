export interface GraphEntity {
  name: string;
  description?: string;
}

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
  pagination?: { totalPrefetched: number; hasMorePages: boolean };
}

export interface ApiResponseItem {
  name: string;
  did: string;
  description?: string;
  lists?: ApiResponseList[];
}

export interface ApiResponseList {
  name: string;
  uri: string;
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
