import vscode from "vscode";
import * as fs from "fs";
import { Config } from "./config";
import { Recorder } from "./recorder";
import { StorySidebarProvider } from "./StorySidebarProvider";
import { ViewStoryPanel } from "./ViewStoryPanel";
import { authenticate } from "./authenticate";
import { Util } from "./util";
import { gifUploadLimit } from "./constants";
import path from "path";
import { query } from "./query";
import { cloudUpload, mutationNoErr } from "./mutation";
import { v4 as uuidv4 } from "uuid";
import { status } from "./extension";

export class GifStory {
  private recorder = new Recorder();
  private status = status;
  private textFilename: string | undefined = "untitled";
  private language: string | undefined = "";
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
      let gifFilename = opts.file;
      this.textFilename = vscode.window.activeTextEditor?.document.fileName;
      this.language = vscode.window.activeTextEditor?.document.languageId;

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating story",
          cancellable: false,
        },
        async () => {
          const newOpts = await this.recorder.postProcess(opts);
          gifFilename = newOpts.file;
        }
      );
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse("file://" + vscode.Uri.file(gifFilename).path)
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
              title: "Uploading to the cloud",
              cancellable: false,
            },
            async () => {
              try {
                // Sanity check to avoid unnecessary uploads
                // backend api won't take it anyways :)
                const gifFile = fs.readFileSync(gifFilename);
                const gifFilestats = fs.statSync(gifFilename);
                const gifFileSizeInBytes = gifFilestats.size;
                const gifFileSizeLimitInBytes = gifUploadLimit;
                const gifFileSizeLimitInMB =
                  gifFileSizeLimitInBytes / (1024 * 1024);
                const mediaUUID = uuidv4();
                let story;

                // Here we get the signedUrl first, if the file size is within range
                // then a cloud upload is attempted, if that's succesful,
                // then we update the api database, and lastly
                // push to story panel
                await query(`/storage/write/${mediaUUID}.gif`)
                  .then((signedUrl) => {
                    if (gifFileSizeInBytes < gifFileSizeLimitInBytes) {
                      cloudUpload(signedUrl, gifFile).then(async () => {
                        story = await mutationNoErr("/new-gif-story", {
                          filename: path.basename(this.textFilename as string),
                          mediaId: mediaUUID,
                          programmingLanguageId: this.language,
                        }).catch((error) => {
                          vscode.window.showErrorMessage(`${error}`);
                          return;
                        });
                        story.type = "gif";
                        if (story) {
                          ViewStoryPanel.createOrShow(
                            this.context.extensionUri,
                            story
                          );
                          this.provider._view?.webview.postMessage({
                            command: "new-story",
                            story,
                          });
                          this.provider2._view?.webview.postMessage({
                            command: "new-story",
                            story,
                          });
                        }
                      });
                    } else {
                      vscode.window.showErrorMessage(
                        `File size too big, cloud limit is ${gifFileSizeLimitInMB} MB, try again.`
                      );
                      return;
                    }
                  })
                  .catch((error) => console.error(error));
              } catch (err) {
                vscode.window.showErrorMessage(err.message);
              }
            }
          );
          fs.unlinkSync(gifFilename);
          fs.unlinkSync(gifFilename.replace(".gif", ".mp4"));
          break;
        case "Discard":
          fs.unlinkSync(gifFilename);
          fs.unlinkSync(gifFilename.replace(".gif", ".mp4"));
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
