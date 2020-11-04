export interface TextStoryListItem {
  id: string;
  creatorUsername: string;
  creatorAvatarUrl: string;
  flair?: string;
}

export interface TextStoryListResponse {
  stories: TextStoryListItem[];
  hasMore: boolean;
}
