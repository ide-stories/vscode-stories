import * as vscode from "vscode";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const playback = async (
  data: Array<[number, Array<vscode.TextDocumentContentChangeEvent>]>
) => {
  const playBackDateStart = new Date().getTime();
  let i = 0;
  const startingDoc = vscode.window.activeTextEditor?.document;
  while (i < data.length) {
    if (!vscode.window.activeTextEditor) {
      break;
    }
    if (vscode.window.activeTextEditor.document !== startingDoc) {
      break;
    }
    const [ms, changeBlock] = data[i];
    // if (!changeBlock.length) {
    //   continue;
    // }
    const currentDuration = new Date().getTime() - playBackDateStart;
    if (currentDuration < ms) {
      await sleep(30);
      continue;
    }
    try {
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
    } catch (err) {
      console.log(err, "rip", changeBlock);
      break;
    }
    i++;
  }
};
