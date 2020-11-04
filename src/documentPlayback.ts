import * as vscode from "vscode";
import { sleep } from "./sleep";

let playbackCounter = 0;
export const incPlaybackCounter = () => {
  playbackCounter++;
};

export const playback = async (
  data: Array<[number, Array<vscode.TextDocumentContentChangeEvent>]>
) => {
  const playBackDateStart = new Date().getTime();
  const startingCount = playbackCounter;
  let i = 0;
  const startingDoc = vscode.window.activeTextEditor?.document;
  while (i < data.length) {
    if (!vscode.window.activeTextEditor) {
      break;
    }
    if (vscode.window.activeTextEditor.document !== startingDoc) {
      break;
    }
    if (startingCount !== playbackCounter) {
      break;
    }
    const [ms, changeBlock] = data[i];
    // if (!changeBlock.length) {
    //   continue;
    // }
    const currentDuration = new Date().getTime() - playBackDateStart;
    if (currentDuration < ms) {
      await sleep(5);
      continue;
    }
    await vscode.window.activeTextEditor.edit((edit) => {
      changeBlock.forEach((change) => {
        if (change.text === "") {
          edit.delete(change.range);
        } else if (change.rangeLength === 0) {
          edit.insert(change.range.start, change.text);
        } else {
          edit.replace(change.range, change.text);
        }
      });
    });
    i++;
  }

  return startingCount === playbackCounter;
};
