import type { TextDocumentContentChangeEvent } from "vscode";

export interface TextStoryListItem {
  id: string;
  creatorUsername: string;
  creatorId: string;
  creatorAvatarUrl: string;
  flair?: string;
}

export interface TextStoryListResponse {
  stories: TextStoryListItem[];
  hasMore: boolean;
}

export interface TextStory {
  id: string;
  text: string;
  programmingLanguageId: string;
  numLikes: number;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  filename: string;
  recordingSteps: Array<[number, Array<TextDocumentContentChangeEvent>]>;
  hasLiked: boolean;
}

export interface TextStoryResponse {
  story: TextStory;
}
