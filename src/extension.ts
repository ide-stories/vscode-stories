import * as vscode from "vscode";
import { authenticate } from "./authenticate";
import { mutation, mutationNoErr } from "./mutation";
import { StorySidebarProvider } from "./StorySidebarProvider";
import { Util } from "./util";

export function activate(context: vscode.ExtensionContext) {
  Util.context = context;
  Util.checkAndUpdateFlair();

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  statusBarItem.command = "stories.create";
  statusBarItem.text = "$(gist) Create Story";
  statusBarItem.show();

  vscode.commands.registerCommand("stories.authenticate", () => authenticate());
  vscode.commands.registerCommand("stories.create", async () => {
    if (!Util.isLoggedIn()) {
      const choice = await vscode.window.showInformationMessage(
        `You need to login to GitHub to create a story, would you like to continue?`,
        "Yes",
        "Cancel"
      );
      if (choice === "Yes") {
        authenticate();
      }
      return;
    }

    if (!vscode.window.activeTextEditor) {
      vscode.window.showInformationMessage("Open a file to create a story");
      return;
    }

    const text = vscode.window.activeTextEditor?.document.getText();

    if (!text) {
      vscode.window.showInformationMessage("Add some text to your file");
      return;
    }

    const choice = await vscode.window.showInformationMessage(
      `Confirm Story creation: the text in the current file will be uploaded as your story.`,
      "Ok",
      "Cancel"
    );

    if (choice !== "Ok") {
      return;
    }

    const programmingLanguageId =
      vscode.window.activeTextEditor?.document.languageId;
    const story = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Uploading Story",
        cancellable: false,
      },
      () => {
        return mutationNoErr("/new-text-story", {
          text,
          programmingLanguageId,
        });
      }
    );
    if (story) {
      setTimeout(() => {
        vscode.window.showInformationMessage("Story successfully created");
      }, 800);
      provider._view?.webview.postMessage({
        command: "new-story",
        story,
      });
      provider2._view?.webview.postMessage({
        command: "new-story",
        story,
      });
    }
  });

  const provider = new StorySidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("storiesPanel", provider)
  );

  const provider2 = new StorySidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("stories-full", provider2)
  );

  vscode.commands.registerCommand("stories.refresh", () => {
    provider._view?.webview.postMessage({
      command: "refresh",
    });
    provider2._view?.webview.postMessage({
      command: "refresh",
    });
  });
}
