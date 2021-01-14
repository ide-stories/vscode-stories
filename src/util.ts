import * as path from "path";
import * as vscode from "vscode";
import { refreshTokenKey, accessTokenKey } from "./constants";

// https://github.com/arciisine/vscode-chronicler/blob/master/src/util.ts
export class Util {
  static context: vscode.ExtensionContext;

  static getRefreshToken() {
    return this.context.globalState.get<string>(refreshTokenKey) || "";
  }

  static getAccessToken() {
    return "";
    // return this.context.globalState.get<string>(accessTokenKey) || "";
  }

  static isLoggedIn() {
    return (
      !!this.context.globalState.get(accessTokenKey) &&
      !!this.context.globalState.get(refreshTokenKey)
    );
  }

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
