import { StorySidebarProvider } from "./StorySidebarProvider";
import vscode from "vscode";
import { PreviewStoryPanel } from "./PreviewStoryPanel";
import { mutationNoErr } from "./mutation";
import { authenticate } from "./authenticate";
import { Util } from "./util";
import { status } from "./extension";

export class TextStory {
  private isRecording = false;
  private filename = "untitled";
  private data: Array<
    [number, Array<vscode.TextDocumentContentChangeEvent>]
  > = [];
  private startingText = "";
  private language = "";
  private startDate = new Date().getTime();
  private lastDelete = false;
  private lastMs = 0;
  private status = status;
  private context: vscode.ExtensionContext;
  private provider: StorySidebarProvider;
  private provider2: StorySidebarProvider;

  constructor(
    context: vscode.ExtensionContext,
    provider: StorySidebarProvider,
    provider2: StorySidebarProvider
  ) {
    this.context = context;
    this.provider = provider;
    this.provider2 = provider2;
  }

  stop = async () => {
    this.status.stop();
    this.isRecording = false;
    PreviewStoryPanel.createOrShow(this.context.extensionUri, {
      initRecordingSteps: this.data,
      intialText: this.startingText,
    });
    const choice = await vscode.window.showInformationMessage(
      `Your story is ready to go!`,
      "Publish",
      "Discard"
    );
    if (choice !== "Publish") {
      vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      return;
    }

    const story = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Uploading...",
        cancellable: false,
      },
      () => {
        return mutationNoErr("/new-text-story", {
          filename: this.filename,
          text: this.startingText,
          recordingSteps: this.data,
          programmingLanguageId: this.language,
        });
      }
    );
    if (story) {
      setTimeout(() => {
        vscode.window.showInformationMessage("Story successfully created");
      }, 800);
      this.provider._view?.webview.postMessage({
        command: "new-story",
        story,
      });
      this.provider2._view?.webview.postMessage({
        command: "new-story",
        story,
      });
    }
  };

  record = async () => {
    if (!Util.isLoggedIn()) {
      const choice = await vscode.window.showInformationMessage(
        `You need to login to GitHub to record a story, would you like to continue?`,
        "Yes",
        "Cancel"
      );
      if (choice === "Yes") {
        authenticate();
      }
      return;
    }

    if (!vscode.window.activeTextEditor) {
      vscode.window.showInformationMessage(
        "Open a file to start recording a story"
      );
      return;
    }
    try {
      await this.status.countDown();
    } catch (err) {
      vscode.window.showWarningMessage("Recording cancelled");
      return;
    }
    this.status.start();
    this.filename = vscode.window.activeTextEditor.document.fileName;
    this.startingText = vscode.window.activeTextEditor.document.getText();
    this.language = vscode.window.activeTextEditor.document.languageId;
    this.lastDelete = false;
    this.lastMs = 0;
    this.data = [[0, []]];
    this.isRecording = true;
    this.startDate = new Date().getTime();

    this.context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(
        (event) => {
          if (this.isRecording) {
            if (this.data.length > 100000) {
              this.isRecording = false;
              vscode.window.showWarningMessage(
                "Recording automatically stopped, the recording data is getting really big."
              );
              this.stop();
              return;
            }
            const ms = new Date().getTime() - this.startDate;
            if (ms - 10 > this.lastMs) {
              this.data.push([ms, []]);
            }
            for (const change of event.contentChanges) {
              if (change.text === "") {
                if (this.lastDelete) {
                  this.data[this.data.length - 1][1].push(change);
                  continue;
                }
                this.data.push([ms, [change]]);
                this.lastDelete = true;
              } else {
                this.data[this.data.length - 1][1].push(change);
              }
            }
            this.lastMs = ms;
          }
        },
        null,
        this.context.subscriptions
      )
    );
  };
}
