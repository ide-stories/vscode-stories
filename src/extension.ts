import * as fs from "fs";
import fetch from "node-fetch";
import {
  adjectives,
  animals,
  colors,
  countries,
  names,
  starWars,
  uniqueNamesGenerator,
} from "unique-names-generator";
import * as vscode from "vscode";
import { Config } from "./config";
import { fetchFile } from "./fetchFile";
import { Recorder } from "./recorder";
import { shuffle } from "./shuffle";
import { RecordingStatus } from "./status";
import { StorySidebarProvider } from "./StorySidebarProvider";
import { Util } from "./util";
import { ViewStoryPanel } from "./ViewStoryPanel";

export function activate(context: vscode.ExtensionContext) {
  Util.context = context;

  if (!Config.hasConfig("username")) {
    Config.setConfig(
      "username",
      uniqueNamesGenerator({
        dictionaries: shuffle([
          adjectives,
          animals,
          colors,
          countries,
          names,
          starWars,
        ]),
        length: 2,
      })
    );
  }

  const recorder = new Recorder();
  const status = new RecordingStatus();

  async function stop() {
    await new Promise((resolve) => setTimeout(resolve, 125)); // Allows for click to be handled properly
    if (status.counting) {
      status.stop();
    } else if (recorder.active) {
      status.stopping();
      recorder.stop();
    } else if (recorder.running) {
      status.stop();
      recorder.stop(true);
    }
  }

  async function initRecording() {
    if (!(await Config.getFFmpegBinary())) {
      vscode.window.showWarningMessage(
        "FFmpeg binary location not defined, cannot record unless path is set."
      );
      return;
    }

    try {
      await status.countDown();
    } catch (err) {
      vscode.window.showWarningMessage("Recording cancelled");
      return;
    }

    return true;
  }

  async function record() {
    if (5) {
      vscode.window.showErrorMessage(
        "I have turned off recordings because people were uploading nsfw content."
      );
      return;
    }
    try {
      if (!(await initRecording())) {
        return;
      }

      const run = await recorder.run();
      status.start();

      const opts = await run.output();
      status.stop();
      let file = opts.file;
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "generating story",
          cancellable: false,
        },
        async () => {
          const newOpts = await recorder.postProcess(opts);
          file = newOpts.file;
        }
      );
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse("file://" + file)
      );

      const choice = await vscode.window.showInformationMessage(
        `Your story is ready to go!`,
        "Publish",
        "Discard"
      );
      switch (choice) {
        case "Publish":
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title:
                "If you have time to read this message, that means the story is still uploading and I'm using serverless so you probably got a cold start :) Don't hate the coder (Ben), hate the game (serverless).",
              cancellable: false,
            },
            async () => {
              try {
                const response = await fetchFile(
                  "https://stories-video-uploader-apim.azure-api.net/stories-video-uploader/video-uploader",
                  file
                );
                if (response.status === 413) {
                  vscode.window.showErrorMessage(
                    "Gif is too large, try recording for a shorter amount of time."
                  );
                  return;
                } else if (response.status !== 200) {
                  vscode.window.showErrorMessage(await response.text());
                  return;
                }
                const { token } = await response.json();
                const r2 = await fetch(
                  "https://bowl.azurewebsites.net/new-story",
                  {
                    method: "POST",
                    body: JSON.stringify({
                      token,
                      creatorUsername: Config.getConfig("username"),
                      creatorAvatarUrl: Config.getConfig("avatarUrl"),
                      flair: Config.getConfig("flair"),
                    }),
                    headers: { "content-type": "application/json" },
                  }
                );
                if (r2.status !== 200) {
                  vscode.window.showErrorMessage(await r2.text());
                  return;
                }
                const story = await r2.json();
                if (story) {
                  ViewStoryPanel.createOrShow(context.extensionUri, story);
                  provider._view?.webview.postMessage({
                    command: "new-story",
                    story,
                  });
                  provider2._view?.webview.postMessage({
                    command: "new-story",
                    story,
                  });
                }
              } catch (err) {
                vscode.window.showErrorMessage(err.message);
              }
            }
          );
          fs.unlinkSync(file);
          fs.unlinkSync(file.replace(".gif", ".mp4"));
          break;
        case "Discard":
          fs.unlinkSync(file);
          fs.unlinkSync(file.replace(".gif", ".mp4"));
          break;
      }
    } catch (e) {
      vscode.window.showErrorMessage(e.message);
      if (!recorder.active) {
        status.stop();
      }
    }
  }

  vscode.commands.registerCommand("stories.stop", () => stop());
  vscode.commands.registerCommand("stories.record", () => record());

  context.subscriptions.push(recorder, status);

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
