import * as vscode from "vscode";
import * as path from "path";

const dateFormatLessThanAYear = { month: 'long', day: 'numeric' };
const dateFormatDefault = { year: 'numeric', month: 'long', day: 'numeric' }

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

  static getCreatedTimeString(date: Date): string {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerYear = msPerDay * 365;

    const elapsed = (new Date()).getTime() - date.getTime();

    if (elapsed < msPerHour) {
      return Math.floor(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
      return Math.floor(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerYear) {
      return date.toLocaleDateString(undefined, dateFormatLessThanAYear);
    } else {
      return date.toLocaleDateString(undefined, dateFormatDefault);
    }
  }
}
