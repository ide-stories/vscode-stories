import { RecordingOptions as RecOp } from "@arcsine/screen-recorder";

// https://github.com/arciisine/vscode-chronicler/blob/master/src/types.ts
export interface RecordingOptions extends RecOp {
  countdown: number;
  animatedGif: boolean;
  gifScale: number;
}
