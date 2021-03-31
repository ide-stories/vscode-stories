import type { TextDocumentContentChangeEvent } from "vscode";

export interface StoryListItem {
  id: string;
  creatorUsername: string;
  creatorId: string;
  creatorAvatarUrl: string;
  flair?: string;
  creatorIsFriend?: boolean | null;
  type: string;
}

export interface StoryListResponse {
  stories: StoryListItem[];
  hasMore: boolean;
}

export interface FriendsStoryListResponse {
  stories: StoryListItem[];
  friendIds: string[];
  hasMore: boolean;
}

interface Story {
  id: string;
  programmingLanguageId: string;
  numLikes: number;
  filename: string;
  creatorId: string;
  hasLiked: boolean;
  creatorAt: Date;
  updateAt: Date;
}

export interface TextStory extends Story {
  text: string;
  recordingSteps: Array<[number, Array<TextDocumentContentChangeEvent>]>;
}

export interface GifStory extends Story {
  flagged: string;
  mediaId: string;
}

export interface TextStoryResponse {
  story: TextStory;
}

export interface GifStoryResponse {
  story: GifStory;
}
