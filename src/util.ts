import * as vscode from "vscode";
import * as path from "path";

// https://github.com/arciisine/vscode-chronicler/blob/master/src/util.ts
export class Util {
  static context: vscode.ExtensionContext;

  static getWorkspacePath() {
    const folders = vscode.workspace.workspaceFolders;
    return folders ? folders![0].uri.fsPath : undefined;
  }

  static getResource(rel: string) {
    return path
      .resolve(this.context.extensionPath, rel.replace(/\//g, path.sep))
      .replace(/\\/g, "/");
  }
}
