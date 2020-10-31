import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import fetch from "node-fetch";
import { flairMap } from "./flairMap";

const imgMap = {
  flutter:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iNDgiIGhlaWdodD0iNDgiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGc+PHBhdGggZD0iTTkzLjE2NjY3LDE0LjMzMzMzbC03MS42NjY2Nyw3MS42NjY2N2wyMS41LDIxLjVsOTMuMTY2NjcsLTkzLjE2NjY3eiIgZmlsbD0iIzQwYzRmZiI+PC9wYXRoPjxwYXRoIGQ9Ik0xMzYuMTY2NjcsNzguODMzMzNsLTM5LjQxNjY3LDM5LjQxNjY3bC0yMS41LC0yMS41bDE3LjkxNjY3LC0xNy45MTY2N3oiIGZpbGw9IiM0MGM0ZmYiPjwvcGF0aD48cmVjdCB4PSItMTIuNzI4OTUiIHk9IjMzLjk0MDYyIiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUuMDAxKSBzY2FsZSgzLjU4MzMzLDMuNTgzMzMpIiB3aWR0aD0iOC40ODUiIGhlaWdodD0iOC40ODUiIGZpbGw9IiMwM2E5ZjQiPjwvcmVjdD48cGF0aCBkPSJNMTM2LjE2NjY3LDE1Ny42NjY2N2gtNDNsLTE3LjkxNjY3LC0xNy45MTY2N2wyMS41LC0yMS41eiIgZmlsbD0iIzAxNTc5YiI+PC9wYXRoPjxwYXRoIGQ9Ik03NS4yNSwxMzkuNzVsMzIuMjUsLTEwLjc1bC0xMC43NSwtMTAuNzV6IiBmaWxsPSIjMDg0OTk0Ij48L3BhdGg+PC9nPjwvZz48L3N2Zz4=",
  react:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K",
  vue:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAyNjEuNzYgMjI2LjY5IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIHRyYW5zZm9ybT0ibWF0cml4KDEuMzMzMyAwIDAgLTEuMzMzMyAtNzYuMzExIDMxMy4zNCkiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3OC4wNiAyMzUuMDEpIj48cGF0aCBkPSJtMCAwLTIyLjY2OS0zOS4yNjQtMjIuNjY5IDM5LjI2NGgtNzUuNDkxbDk4LjE2LTE3MC4wMiA5OC4xNiAxNzAuMDJ6IiBmaWxsPSIjNDFiODgzIi8+PC9nPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3OC4wNiAyMzUuMDEpIj48cGF0aCBkPSJtMCAwLTIyLjY2OS0zOS4yNjQtMjIuNjY5IDM5LjI2NGgtMzYuMjI3bDU4Ljg5Ni0xMDIuMDEgNTguODk2IDEwMi4wMXoiIGZpbGw9IiMzNDQ5NWUiLz48L2c+PC9nPjwvc3ZnPgo=",
  angular: "https://imgur.com/ISJUTQr.png",
  python:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iNDgiIGhlaWdodD0iNDgiCnZpZXdCb3g9IjAgMCAyMjYgMjI2IgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDIyNnYtMjI2aDIyNnYyMjZ6IiBmaWxsPSJub25lIj48L3BhdGg+PGc+PHBhdGggZD0iTTExMy4yMjEyOSwyMy41NDE2N2MtNy4zMjE0NiwwLjAyMzU0IC0xMi4zOTcwNCwwLjY2ODU4IC0xOC41MzIsMS43Mjc5NmMtMTguMTE3NjcsMy4xNTQ1OCAtMjEuNDE4MjEsOS43NzkyMSAtMjEuNDE4MjEsMjEuOTg3OTJ2MTguNjU5MTJoNDIuMzc1djkuNDE2NjdoLTQzLjk4NTI1aC0yMC40ODEyNWMtMTIuNDExMTcsMCAtMjMuMjczMjksNS44NDc3NSAtMjYuNzE1MDgsMTkuODY0NDZjLTMuODg5MDgsMTYuMDg4MzggLTQuMDYzMjksMjYuMTY0MjEgMCw0Mi45NjM1NGMzLjA4Mzk2LDEyLjUyODg4IDkuODc4MDgsMjEuOTIyIDIyLjI5Mzk2LDIxLjkyMmgxNy4xMDA2N3YtMjQuMDMxMzNjMCwtMTMuOTY0OTIgMTIuNjQ2NTgsLTI3Ljc2MDMzIDI3LjEzODgzLC0yNy43NjAzM2gzNC4wNjk1YzExLjg3OTEyLDAgMjMuNTQxNjcsLTguNzY2OTIgMjMuNTQxNjcsLTIwLjYwODM3di00MC40MjU3NWMwLC0xMS40ODM2MyAtOC4yODE5NiwtMjAuMDcxNjIgLTE5Ljg1OTc1LC0yMS45OTczM2MwLjI4NzIxLC0wLjAyODI1IC04LjI2NzgzLC0xLjc0Njc5IC0xNS41MjgwOCwtMS43MTg1NHpNODkuNzU0OTYsNDIuMzc1YzMuODY1NTQsMCA3LjA2MjUsMy4xODc1NCA3LjA2MjUsNy4wNzE5MmMwLDMuOTIyMDQgLTMuMTk2OTYsNy4wNTMwOCAtNy4wNjI1LDcuMDUzMDhjLTMuOTQwODcsMCAtNy4wNjI1LC0zLjEyNjMzIC03LjA2MjUsLTcuMDUzMDhjMCwtMy44NzAyNSAzLjEyMTYzLC03LjA3MTkyIDcuMDYyNSwtNy4wNzE5MnoiIGZpbGw9IiMwMjc3YmQiPjwvcGF0aD48cGF0aCBkPSJNMTA4LjY1ODkyLDIwMi40NTgzM2M3LjMyMTQ2LC0wLjAyMzU0IDEyLjM5NzA0LC0wLjY2ODU4IDE4LjUzMiwtMS43Mjc5NmMxOC4xMTc2NywtMy4xNTQ1OCAyMS40MTgyMSwtOS43NzkyMSAyMS40MTgyMSwtMjEuOTg3OTJ2LTE4LjY1OTEzaC00Mi4zNzV2LTkuNDE2NjdoNDMuOTg5OTZoMjAuNDgxMjVjMTIuNDExMTcsMCAyMy4yNzMyOSwtNS44NDc3NSAyNi43MTUwOCwtMTkuODY0NDZjMy44ODkwOCwtMTYuMDg4MzcgNC4wNjMyOSwtMjYuMTY0MjEgMCwtNDIuOTYzNTRjLTMuMDg4NjcsLTEyLjUyODg3IC05Ljg4Mjc5LC0yMS45MjIgLTIyLjI5ODY3LC0yMS45MjJoLTE3LjEwMDY3djI0LjAzMTMzYzAsMTMuOTY0OTIgLTEyLjY0NjU4LDI3Ljc2MDMzIC0yNy4xMzg4MywyNy43NjAzM2gtMzQuMDY5NWMtMTEuODc5MTMsMCAtMjMuNTQxNjcsOC43NjY5MiAtMjMuNTQxNjcsMjAuNjA4Mzd2NDAuNDI1NzVjMCwxMS40ODM2MiA4LjI4MTk2LDIwLjA3MTYyIDE5Ljg1OTc1LDIxLjk5NzMzYy0wLjI4NzIxLDAuMDI4MjUgOC4yNjc4MywxLjc0Njc5IDE1LjUyODA4LDEuNzE4NTR6TTEzMi4xMjk5NiwxODMuNjI1Yy0zLjg2NTU0LDAgLTcuMDYyNSwtMy4xODc1NCAtNy4wNjI1LC03LjA3MTkyYzAsLTMuOTIyMDQgMy4xOTY5NiwtNy4wNTMwOCA3LjA2MjUsLTcuMDUzMDhjMy45NDA4OCwwIDcuMDYyNSwzLjEyNjMzIDcuMDYyNSw3LjA1MzA4YzAsMy44NzAyNSAtMy4xMjYzMyw3LjA3MTkyIC03LjA2MjUsNy4wNzE5MnoiIGZpbGw9IiNmZmMxMDciPjwvcGF0aD48L2c+PC9nPjwvc3ZnPg==",
};

export class ViewStoryPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ViewStoryPanel | undefined;

  public static readonly viewType = "previewStory";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _story: any;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, story: any) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (ViewStoryPanel.currentPanel) {
      ViewStoryPanel.currentPanel._panel.reveal(column);
      ViewStoryPanel.currentPanel._story = story;
      ViewStoryPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      ViewStoryPanel.viewType,
      "View Story",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    );

    ViewStoryPanel.currentPanel = new ViewStoryPanel(
      panel,
      extensionUri,
      story
    );
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    story: any
  ) {
    ViewStoryPanel.currentPanel = new ViewStoryPanel(
      panel,
      extensionUri,
      story
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    story: string
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._story = story;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // // Handle messages from the webview
    // this._panel.webview.onDidReceiveMessage(
    //   (message) => {
    //     switch (message.command) {
    //       case "alert":
    //         vscode.window.showErrorMessage(message.text);
    //         return;
    //     }
    //   },
    //   null,
    //   this._disposables
    // );
  }

  public dispose() {
    ViewStoryPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private async _update() {
    const webview = this._panel.webview;

    this._panel.webview.html = this._getHtmlForWebview(webview);
    webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "view-story.js"
    );

    // // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "reset.css"
    );
    const stylesPathMainPath = vscode.Uri.joinPath(
      this._extensionUri,
      "media",
      "vscode.css"
    );

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
    const customStylesUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "view-story.css")
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();
    const story = this._story;

    this._panel.title = story.creatorUsername;

    if (story.flair in flairMap) {
      const both = vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        flairMap[story.flair as keyof typeof flairMap]
      );
      this._panel.iconPath = {
        light: both,
        dark: both,
      };
    } else {
      this._panel.iconPath = undefined;
    }

    switch (story.flair) {
      case "react":
        break;
    }

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
        <meta http-equiv="Content-Security-Policy" content="default-src https://bowl.azurewebsites.net; img-src https: data:; style-src ${
          webview.cspSource
        }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
        <link href="${customStylesUri}" rel="stylesheet">
			</head>
      <body>
      <div data-id="${story.id}" data-username="${
      story.creatorUsername
    }" class="top">
        <img class="pic" src="${
          story.creatorAvatarUrl ||
          `https://ui-avatars.com/api/?background=random&name=${encodeURI(
            story.creatorUsername
          )}`
        }" />
        <div class="username-and-flair">
        <div class="username">${story.creatorUsername.slice(0, 30)}</div>
        ${
          story.flair in imgMap
            ? `<img class="flair" src="${
                imgMap[story.flair as keyof typeof imgMap]
              }" />`
            : ""
        }
        </div>
        <svg data-id="${
          story.id
        }" viewBox="0 0 24 24" fill="#fff" class="heart empty"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"></path></g></svg>
        <svg viewBox="0 0 24 24" fill="rgb(224, 36, 94)" class="heart hidden full"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path></g></svg>
        <div class="likes">${story.numLikes.toLocaleString()}</div>
        </div>
        <img src="https://teriyaki.azureedge.net/main/${story.mediaId}" />
			</body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</html>`;
  }
}
