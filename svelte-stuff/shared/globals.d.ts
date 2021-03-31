import * as _vscode from "vscode";
import type { TextStory, StoryListItem } from "./types";

declare global {
  const tsvscode: any;
  const flairMap: Record<string, string>;
  const apiBaseUrl: string;
  const story: StoryListItem;
  let accessToken: string;
  let refreshToken: string;
  let isLoggedIn: boolean;
  const currentUserId: string;
  const initRecordingSteps: TextStory["recordingSteps"];
  const initialText: string;
}
