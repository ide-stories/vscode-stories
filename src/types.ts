import { RecordingOptions as RecOp } from "@arcsine/screen-recorder";
import { TextDocumentContentChangeEvent } from "vscode";

// https://github.com/arciisine/vscode-chronicler/blob/master/src/types.ts
export interface RecordingOptions extends RecOp {
  countdown: number;
  animatedGif: boolean;
  gifScale: number;
}

export enum StoryType {
  gif = "Gif",
  text = "Text",
}

export type RecordingSteps = Array<
  [number, Array<TextDocumentContentChangeEvent>]
>;
