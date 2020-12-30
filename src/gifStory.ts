import { StoryType } from "./types";
import vscode from "vscode";
import fetch from "node-fetch";
import * as fs from "fs";
import { Config } from "./config";
import { fetchFile } from "./fetchFile";
import { RecordingStatus } from "./status";
import { Recorder } from "./recorder";
import { StorySidebarProvider } from "./StorySidebarProvider";
import { ViewStoryPanel } from "./ViewStoryPanel";
import { authenticate } from "./authenticate";
import { Util } from "./util";

export class GifStory {
  private recorder = new Recorder();
  private status = new RecordingStatus(StoryType.gif);
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

  test1 = () => {
    console.log("test 1 from gif story");
  };

  test2 = () => {
    console.log("test 2 from gif story");
  };

  stop = async () => {
    await new Promise((resolve) => setTimeout(resolve, 125)); // Allows for click to be handled properly
    if (this.status.counting) {
      this.status.stop();
    } else if (this.recorder.active) {
      this.status.stopping();
      this.recorder.stop();
    } else if (this.recorder.running) {
      this.status.stop();
      this.recorder.stop(true);
    }
  };

  private initRecording = async () => {
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

    if (!(await Config.getFFmpegBinary())) {
      vscode.window.showWarningMessage(
        "FFmpeg binary location not defined, cannot record unless path is set."
      );
      return;
    }

    try {
      await this.status.countDown();
    } catch (err) {
      vscode.window.showWarningMessage("Recording cancelled");
      return;
    }

    return true;
  };

  record = async () => {
    try {
      if (!(await this.initRecording())) {
        return;
      }

      const run = await this.recorder.run();
      this.status.start();

      const opts = await run.output();
      this.status.stop();
      let file = opts.file;
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "generating story",
          cancellable: false,
        },
        async () => {
          const newOpts = await this.recorder.postProcess(opts);
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
                  ViewStoryPanel.createOrShow(this.context.extensionUri, story);
                  this.provider._view?.webview.postMessage({
                    command: "new-story",
                    story,
                  });
                  this.provider2._view?.webview.postMessage({
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
      if (!this.recorder.active) {
        this.status.stop();
      }
    }
  };
}
