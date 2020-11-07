import type { Position, TextDocumentContentChangeEvent } from "vscode";

export const executeChanges = (
  textChunks: string[],
  changeBlock: TextDocumentContentChangeEvent[]
) => {
  for (const change of changeBlock) {
    if (change.text === "") {
      deleteTextChunk(textChunks, change.range[0], change.range[1]);
    } else if (change.rangeLength === 0) {
      insertTextChunk(textChunks, change.range[0], change.text);
    } else {
      replaceTextChunk(
        textChunks,
        change.range[0],
        change.range[1],
        change.text
      );
    }
  }
};

export const insertTextChunk = (
  textChunks: string[],
  position: Position,
  textToInsert: string
) => {
  const parts = textToInsert.split("\n");
  const text = textChunks[position.line] || "";
  if (parts.length === 1) {
    textChunks[position.line] =
      text.slice(0, position.character) +
      textToInsert +
      text.slice(position.character + 1);
    return;
  }

  // console.log(textChunks, position, textToInsert);
  // console.log(
  //   textChunks.slice(0, position.line - 2),
  //   text.slice(0, position.character) + parts[0],
  //   parts.slice(1, parts.length - 1),
  //   parts[parts.length - 1] + text.slice(position.character + 1),
  //   textChunks.slice(position.line + 1)
  // );

  textChunks.splice(
    0,
    textChunks.length,
    ...textChunks.slice(0, position.line - 2),
    text.slice(0, position.character) + parts[0],
    ...parts.slice(1, parts.length - 1),
    parts[parts.length - 1] + text.slice(position.character),
    ...textChunks.slice(position.line + 1)
  );
  // console.log(textChunks);
};

export const deleteTextChunk = (
  textChunks: string[],
  start: Position,
  stop: Position
) => {
  const text = textChunks[start.line] || "";
  // console.log("text: ", text);
  // console.log("text[0]: ", text[0]);
  // console.log("text[9]: ", text[9]);
  // console.log("cstart: ", start.character, text[start.character]);
  // console.log("cstop: ", stop.character, text[stop.character]);
  // console.log("slice1: ", text.slice(0, start.character));
  // console.log("slice2: ", text.slice(stop.character));
  if (start.line === stop.line) {
    textChunks[start.line] =
      text.slice(0, start.character) + text.slice(stop.character);
    return;
  }
  textChunks[start.line] =
    text.slice(0, start.character) +
    (textChunks[stop.line] || "").slice(stop.character);
  textChunks.splice(start.line + 1, stop.line - start.line);
};

export const replaceTextChunk = (
  textChunks: string[],
  start: Position,
  stop: Position,
  textToInsert: string
) => {
  deleteTextChunk(textChunks, start, stop);
  insertTextChunk(textChunks, start, textToInsert);
};
