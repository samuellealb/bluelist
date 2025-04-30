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

export interface RequestCounts {
  [date: string]: number;
}
