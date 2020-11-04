import * as vscode from "vscode";
import { getStoryById } from "./api";
import { getNonce } from "./getNonce";
import { LikeStatus } from "./likeStatus";
import { playback } from "./documentPlayback";
import { rehydrateChangeEvent } from "./rehydrate";
import * as jwt from "jsonwebtoken";
import { Util } from "./util";
import { DeleteStatus } from "./deleteStatus";

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
          const storyP = getStoryById(data.value);
          if (!this._doc || !this._doc.isDirty) {
            this._doc = await vscode.workspace.openTextDocument({
              content: "Loading...",
            });
          }
          await vscode.window.showTextDocument(this._doc);
          const story = await storyP;
          if (story) {
            await vscode.languages.setTextDocumentLanguage(
              this._doc!,
              story.programmingLanguageId
            );
            await vscode.window.activeTextEditor?.edit((eb) => {
              eb.replace(
                new vscode.Range(0, 0, this._doc!.lineCount, 0),
                story.text
              );
            });
            try {
              const payload: any = jwt.decode(Util.getAccessToken());
              if (
                payload.userId === "dac7eb0f-808b-4842-b193-5d68cc082609" ||
                payload.userId === story.creatorId
              ) {
                DeleteStatus.createDeleteStatus(story.id);
              } else {
                DeleteStatus.hide();
              }
            } catch {}
            LikeStatus.createLikeStatus();
            LikeStatus.setLikes(
              story.numLikes,
              story.hasLiked ? undefined : story.id
            );
            if (story.recordingSteps) {
              while (true) {
                const canGoAgain = await playback(
                  story.recordingSteps.map((x: any) => [
                    x[0],
                    x[1].map((y: any) => rehydrateChangeEvent(y)),
                  ])
                );
                if (!canGoAgain) {
                  break;
                }
                const choice = await vscode.window.showInformationMessage(
                  `Would you like the story to play again?`,
                  "Replay",
                  "Cancel"
                );
                if (choice !== "Replay") {
                  break;
                }
                await vscode.window.activeTextEditor?.edit((eb) => {
                  eb.replace(
                    new vscode.Range(0, 0, this._doc!.lineCount, 0),
                    story.text
                  );
                });
              }
            }
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
