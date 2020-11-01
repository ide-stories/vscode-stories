import * as vscode from "vscode";
import * as path from "path";
import { lastFlairKey, refreshTokenKey, tokenKey } from "./constants";
import { Config } from "./config";
import { mutationNoErr } from "./mutation";

// https://github.com/arciisine/vscode-chronicler/blob/master/src/util.ts
export class Util {
  static context: vscode.ExtensionContext;

  static checkAndUpdateFlair() {
    if (!this.isLoggedIn()) {
      return;
    }
    const flair = Config.getConfig("flair");
    const lastFlair =
      this.context.globalState.get<string>(lastFlairKey) || "vanilla js";
    console.log(flair, lastFlair);
    if (flair !== lastFlair) {
      this.context.globalState.update(lastFlairKey, flair);
      mutationNoErr("/update-flair", {
        flair,
      });
    }
  }

  static getRefreshToken() {
    return this.context.globalState.get<string>(refreshTokenKey) || "";
  }

  static getAccessToken() {
    return this.context.globalState.get<string>(tokenKey) || "";
  }

  static isLoggedIn() {
    return (
      !!this.context.globalState.get(tokenKey) &&
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
