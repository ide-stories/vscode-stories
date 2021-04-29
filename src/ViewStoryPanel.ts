import * as vscode from "vscode";
import { accessTokenKey, apiBaseUrl, gifPublicUrl, refreshTokenKey } from "./constants";
import { FlairProvider } from "./FlairProvider";
import { getNonce } from "./getNonce";
import { Util } from "./util";
import jwt from "jsonwebtoken";
import { cloudDownload, query } from "./query";

export class ViewStoryPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: ViewStoryPanel | undefined;

  public static readonly viewType = "viewStory";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _story: any;
  private _disposables: vscode.Disposable[] = [];
  private _gifImg: string = "";

  public static async createOrShow(extensionUri: vscode.Uri, story: any) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    let gifImgTemp = "";

    // If we already have a panel, show it.
    if (ViewStoryPanel.currentPanel) {
      ViewStoryPanel.currentPanel._panel.reveal(column);
      ViewStoryPanel.currentPanel._story = story;
      ViewStoryPanel.currentPanel._gifImg = gifImgTemp;
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
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "out/compiled"),
        ],
      }
    );

    panel.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "close": {
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          break;
        }
        case "onGif": {
          if (!data.value) {
            return;
          }
          // If it's a gif story, download it
          await query(`/storage/read/${data.value}.gif`).then(async (signedUrl) => {
            await cloudDownload(signedUrl).then(async (buffer) => {
              this.currentPanel?._update(buffer.toString("base64"));
            });
          });
          break;
        }
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "tokens": {
          await Util.context.globalState.update(
            accessTokenKey,
            data.accessToken
          );
          await Util.context.globalState.update(
            refreshTokenKey,
            data.refreshToken
          );
          break;
        }
      }
    });

    ViewStoryPanel.currentPanel = new ViewStoryPanel(
      panel,
      extensionUri,
      story,
      gifImgTemp
    );
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    story: any,
    gifImg: string
  ) {
    ViewStoryPanel.currentPanel = new ViewStoryPanel(
      panel,
      extensionUri,
      story,
      gifImg
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    story: string,
    gifImg: string
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._story = story;
    this._gifImg = gifImg;

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

  private async _update(gifImage?: string) {
    const webview = this._panel.webview;
    if (gifImage) {
      this._gifImg = "" + gifImage;
    }
    
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/view-story.js")
    );

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
    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/view-story.css")
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();
    const story = this._story;
    const gifImg = this._gifImg;

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

    let currentUserId = "";
    try {
      const payload: any = jwt.decode(Util.getAccessToken());
      currentUserId = payload.userId;
    } catch { }

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src ${apiBaseUrl}; img-src https: data:; style-src ${webview.cspSource
      }; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">
        <link href="${cssUri}" rel="stylesheet">
        <script nonce="${nonce}">
            const currentUserId = "${currentUserId}";
            const story = JSON.parse('${JSON.stringify(this._story)}');
            let accessToken = "${Util.getAccessToken()}";
            let refreshToken = "${Util.getRefreshToken()}";
            let isLoggedIn = "${Util.isLoggedIn()}";
            const apiBaseUrl = "${apiBaseUrl}";
            const gifImg = "${gifImg}";
            const tsvscode = acquireVsCodeApi();
            ${FlairProvider.getJavascriptMapString()}
        </script>
			</head>
      <body>
			</body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</html>`;
  }
}
