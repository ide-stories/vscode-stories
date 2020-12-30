import { TextStory } from "./textStory";
import * as vscode from "vscode";
import { authenticate } from "./authenticate";
import { mutation, mutationNoErr } from "./mutation";
import { StorySidebarProvider } from "./StorySidebarProvider";
import { Util } from "./util";
import { FlairProvider } from "./FlairProvider";
import { _prod_ } from "./constants";

export function activate(context: vscode.ExtensionContext) {
  Util.context = context;
  FlairProvider.extensionUri = context.extensionUri;
  FlairProvider.init();

  vscode.commands.registerCommand("stories.setFlair", () => {
    vscode.window
      .showQuickPick(Object.keys(FlairProvider.flairMap))
      .then((flair) => {
        if (flair) {
          mutationNoErr("/update-flair", {
            flair,
          }).then(() => {
            vscode.window.showInformationMessage(
              "Flair successfully set, it'll show up next time stories are loaded."
            );
          });
        }
      });
  });
  vscode.commands.registerCommand("stories.authenticate", () => authenticate());

  const provider = new StorySidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("storiesPanel", provider)
  );

  const provider2 = new StorySidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("stories-full", provider2)
  );

  const textStory = new TextStory(context, provider, provider2);

  vscode.commands.registerCommand("stories.startTextRecording", async () => {
    textStory.record();
  });

  vscode.commands.registerCommand("stories.stopTextRecording", () =>
    textStory.stop()
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
