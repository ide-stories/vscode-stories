import * as vscode from "vscode";
import { accessTokenKey, apiBaseUrl, refreshTokenKey } from "./constants";
import { FlairProvider } from "./FlairProvider";
import { getNonce } from "./getNonce";
import { Util } from "./util";
import jwt from "jsonwebtoken";
import { RecordingSteps } from "./types";

type Data = {
  initRecordingSteps: RecordingSteps;
  intialText: string;
};

export class PreviewStoryPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanel: PreviewStoryPanel | undefined;

  public static readonly viewType = "previewStory";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _data: Data;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, _data: Data) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (PreviewStoryPanel.currentPanel) {
      PreviewStoryPanel.currentPanel._panel.reveal(column);
      PreviewStoryPanel.currentPanel._data = _data;
      PreviewStoryPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      PreviewStoryPanel.viewType,
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

    PreviewStoryPanel.currentPanel = new PreviewStoryPanel(
      panel,
      extensionUri,
      _data
    );
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    _data: Data
  ) {
    PreviewStoryPanel.currentPanel = new PreviewStoryPanel(
      panel,
      extensionUri,
      _data
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    _data: Data
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._data = _data;

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
    PreviewStoryPanel.currentPanel = undefined;

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
    // webview.onDidReceiveMessage(async (data) => {});
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "out",
        "compiled/preview-story.js"
      )
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
      vscode.Uri.joinPath(
        this._extensionUri,
        "out",
        "compiled/preview-story.css"
      )
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

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
        <link href="${cssUri}" rel="stylesheet">
        <script nonce="${nonce}">
            const initRecordingSteps = ${JSON.stringify(
              this._data.initRecordingSteps
            )};
            const initialText = ${JSON.stringify(this._data.intialText)};
            const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
			</body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</html>`;
  }
}
