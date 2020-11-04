import * as vscode from "vscode";
import { apiBaseUrl } from "./constants";
import { FlairProvider } from "./FlairProvider";
import { getNonce } from "./getNonce";
import { imgMap } from "./imgMap";

export class ViewStoryPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ViewStoryPanel | undefined;

  public static readonly viewType = "previewStory";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _storyId: any;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, story: any) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (ViewStoryPanel.currentPanel) {
      ViewStoryPanel.currentPanel._panel.reveal(column);
      ViewStoryPanel.currentPanel._storyId = story;
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
    this._storyId = story;

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
    const story = this._storyId;

    this._panel.title = story.creatorUsername;

    if (story.flair in FlairProvider.flairUriMap) {
      const both = FlairProvider.flairUriMap[story.flair];
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
        <meta http-equiv="Content-Security-Policy" content="default-src ${apiBaseUrl}; img-src https: data:; style-src ${
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
