import * as vscode from "vscode";
import { accessTokenKey, apiBaseUrl, refreshTokenKey } from "./constants";
import { FlairProvider } from "./FlairProvider";
import { getNonce } from "./getNonce";
import { Util } from "./util";
import { ViewStoryPanel } from "./ViewStoryPanel";
import { Config } from "./config";
import jwt from "jsonwebtoken";

export class StorySidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onStoryPress": {
          if (!data.value) {
            return;
          }
          ViewStoryPanel.createOrShow(this._extensionUri, data.value);
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
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const colorscheme = Config.getConfig('colorscheme');

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    let currentUserId = "";
    try {
      const payload: any = jwt.decode(Util.getAccessToken());
      currentUserId = payload.userId;
    } catch {}

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
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
            const currentUserId = "${currentUserId}";
            let accessToken = "${Util.getAccessToken()}";
            let refreshToken = "${Util.getRefreshToken()}";
            const apiBaseUrl = "${apiBaseUrl}";
            const tsvscode = acquireVsCodeApi();
            ${FlairProvider.getJavascriptMapString()}
        </script>
			</head>
      <body>
      <!--
      <div class="story-grid">
      </div>
      <button class="button load-more hidden">Load More</button>
      -->
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
