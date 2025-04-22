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
}

export interface SuggestionItem {
  name: string;
  description: string;
  suggestedLists: SuggestedList[];
}

export interface DataObject {
  type: 'timeline' | 'lists' | 'follows' | 'suggestions';
  data: TimelineItem[] | ListItem[] | FollowItem[] | SuggestionItem[];
  suggestions?: {
    existingLists?: SuggestionItem[];
    newLists?: SuggestionItem[];
  };
}

// API response interfaces
export interface ApiResponseItem {
  name: string;
  description?: string;
  lists?: ApiResponseList[];
}

export interface ApiResponseList {
  name: string;
}

export interface ApiResponse {
  data: ApiResponseItem[];
  error?: string;
}

// Define simplified types for functions
export interface SimplifiedUser {
  name: string;
  description: string;
}

export interface SimplifiedList {
  name: string;
  description: string;
}
