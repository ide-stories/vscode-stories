import * as vscode from "vscode";
import { likeStory } from "./api";
import { authenticate } from "./authenticate";
import { DeleteStatus } from "./deleteStatus";
import { LikeStatus } from "./likeStatus";
import { mutation, mutationNoErr } from "./mutation";
import { incPlaybackCounter, playback } from "./playback";
import { RecordingStatus } from "./status";
import { StorySidebarProvider } from "./StorySidebarProvider";
import { Util } from "./util";

export function activate(context: vscode.ExtensionContext) {
  Util.context = context;

  // const statusBarItem = vscode.window.createStatusBarItem(
  //   vscode.StatusBarAlignment.Right
  // );
  // statusBarItem.command = "stories.create";
  // statusBarItem.text = "$(gist) Create Story";
  // statusBarItem.show();

  vscode.commands.registerCommand("stories.setFlair", () => {
    vscode.window
      .showQuickPick([
        "vanilla js",
        "flutter",
        "react",
        "vue",
        "angular",
        "python",
        "dart",
        "java",
        "c",
        "cpp",
        "cSharp",
        "kotlin",
        "go",
        "swift",
      ])
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
  vscode.commands.registerCommand("stories.like", async () => {
    if (!Util.isLoggedIn()) {
      const choice = await vscode.window.showInformationMessage(
        `You need to login to GitHub to like a story, would you like to continue?`,
        "Yes",
        "Cancel"
      );
      if (choice === "Yes") {
        authenticate();
      }
      return;
    }

    if (LikeStatus.storyId) {
      LikeStatus.loading();
      const newLikes = LikeStatus.likes + 1;
      await likeStory(LikeStatus.storyId, newLikes);
      LikeStatus.setLikes(newLikes);
    }
  });
  vscode.commands.registerCommand("stories.delete", async () => {
    if (DeleteStatus.storyId) {
      DeleteStatus.loading();
      try {
        await mutation("/delete-text-story/" + DeleteStatus.storyId, {});
        vscode.window.showInformationMessage(
          `Delete successful, but the story is still showing because I'm too lazy to clear the cache atm`
        );
        DeleteStatus.doneLoading(true);
      } catch {
        DeleteStatus.doneLoading(false);
      }
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

  let isRecording = false;

  let filename = "untitled";
  let data: Array<[number, Array<vscode.TextDocumentContentChangeEvent>]> = [];
  let startingText = "";
  let language = "";
  let startDate = new Date().getTime();
  let lastDelete = false;
  let lastMs = 0;
  const status = new RecordingStatus();

  const stop = async () => {
    status.stop();
    isRecording = false;
    const d = await vscode.workspace.openTextDocument({
      content: startingText,
      language,
    });
    await vscode.window.showTextDocument(d);
    playback(data);
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
          filename,
          text: startingText,
          recordingSteps: data,
          programmingLanguageId: language,
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
  };

  vscode.commands.registerCommand("stories.startTextRecording", async () => {
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
      await status.countDown();
    } catch (err) {
      vscode.window.showWarningMessage("Recording cancelled");
      return;
    }
    status.start();
    filename = vscode.window.activeTextEditor.document.fileName;
    startingText = vscode.window.activeTextEditor.document.getText();
    language = vscode.window.activeTextEditor.document.languageId;
    lastDelete = false;
    lastMs = 0;
    data = [[0, []]];
    isRecording = true;
    startDate = new Date().getTime();
    // setTimeout(() => {
    //   if (isRecording) {
    //     stop();
    //   }
    // }, 30000);
  });

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(() => {
      incPlaybackCounter();
    })
  );
  vscode.commands.registerCommand("stories.stopTextRecording", () => stop());

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (isRecording) {
          if (data.length > 100000) {
            isRecording = false;
            vscode.window.showWarningMessage(
              "Recording automatically stopped, the recording data is getting really big."
            );
            stop();
            return;
          }
          const ms = new Date().getTime() - startDate;
          if (ms - 10 > lastMs) {
            data.push([ms, []]);
          }
          for (const change of event.contentChanges) {
            if (change.text === "") {
              if (lastDelete) {
                data[data.length - 1][1].push(change);
                continue;
              }
              data.push([ms, [change]]);
              lastDelete = true;
            } else {
              data[data.length - 1][1].push(change);
            }
          }
          lastMs = ms;
        }
      },
      null,
      context.subscriptions
    )
  );
}
