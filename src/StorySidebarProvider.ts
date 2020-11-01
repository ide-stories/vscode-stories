import fetch from "node-fetch";
import * as vscode from "vscode";
import { getStoryById } from "./api";
import { getNonce } from "./getNonce";
import { ViewStoryPanel } from "./ViewStoryPanel";

export class StorySidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _storyTextDocuments: vscode.TextDocument[] = [];

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
          const story = await getStoryById(data.value);
          if (story) {
            const doc = vscode.window.activeTextEditor?.document;
            if (
              doc &&
              doc.isDirty &&
              this._storyTextDocuments.some(
                (x) => x === vscode.window.activeTextEditor?.document
              )
            ) {
              vscode.window.activeTextEditor?.edit((eb) => {
                eb.replace(
                  new vscode.Range(0, 0, doc.lineCount, 0),
                  story.text
                );
                vscode.languages.setTextDocumentLanguage(
                  doc,
                  story.programmingLanguageId
                );
              });
              return;
            }

            vscode.workspace
              .openTextDocument({
                content: story.text,
                language: story.programmingLanguageId,
              })
              .then((d) => {
                vscode.window.showTextDocument(d);
                this._storyTextDocuments.push(d);
              });
          }
          break;
        }
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
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    );

    // Do the same for the stylesheet.
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src https://bowl.azurewebsites.net; img-src https: data:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
			</head>
      <body>
      <div class="story-grid">
      </div>
      <button class="button load-more hidden">Load More</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
