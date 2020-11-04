import * as _vscode from "vscode";

declare global {
  const tsvscode: typeof _vscode;
  const flairMap: Record<string, string>;
  const apiBaseUrl: string;
}
