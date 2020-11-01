import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { OSUtil } from "@arcsine/screen-recorder/lib/os";
import { DownloadUtil } from "@arcsine/screen-recorder";
import { Util } from "./util";
import { RecordingOptions } from "./types";

const home = process.env.HOME || process.env.USERPROFILE;

// https://github.com/arciisine/vscode-chronicler/blob/master/src/config.ts
export class Config {
  private static get _config() {
    return vscode.workspace.getConfiguration();
  }

  static hasConfig(key: string) {
    const conf = this.getConfig(key);
    return conf !== null && conf !== undefined && conf !== "";
  }

  static getConfig(key: string) {
    return this._config.has(`stories.${key}`)
      ? this._config.get(`stories.${key}`)
      : null;
  }

  static async setConfig(key: string, value: any) {
    return await this._config.update(
      `stories.${key}`,
      value,
      vscode.ConfigurationTarget.Global
    );
  }

  static getRecordingDefaults() {
    return {
      // audio: true,
      duration: 30,
      fps: 15,
      animatedGif: true,
      countdown: 3,
    } as RecordingOptions;
  }

  static async getDestFolder() {
    return "~/Recordings"
      .replace(/^~/, home || ".")
      .replace("${workspaceFolder}", Util.getWorkspacePath() || ".");
  }

  static async getFilename() {
    const dir = this.hasConfig("recording-location") 
    ? this.getConfig("recording-location") as string 
    : await this.getDestFolder();
    const folders = vscode.workspace.workspaceFolders;
    const ws = folders
      ? folders![0].name.replace(/[^A-Za-z0-9\-_]+/g, "_")
      : `vscode`;
    const base = `${ws}-${new Date().getTime()}.mp4`;

    if (!(await fs.existsSync(dir))) {
      await fs.mkdirSync(dir);
    }

    return path.join(dir, base);
  }

  static async getLocation(
    key: string | null,
    options: {
      title: string;
      folder?: boolean;
      defaultName?: string;
      executable?: boolean;
      platformDefaults?: {
        darwin?: string[];
        win32?: string[];
        x11?: string[];
      };
      validator?: (res: string) => Promise<boolean> | boolean;
      onAdd?: (file: string) => Promise<any> | any;
    }
  ) {
    if (!key || !this.hasConfig(key)) {
      const platform = os.platform();

      const folders = options.platformDefaults
        ? options.platformDefaults[platform as "darwin" | "win32"] ||
          options.platformDefaults.x11 ||
          []
        : [];

      let valid = undefined;

      if (options.folder) {
        for (const p of folders) {
          if (await fs.existsSync(p)) {
            valid = p;
            break;
          }
        }
      } else if (options.defaultName && options.executable) {
        try {
          valid = await OSUtil.findFileOnPath(options.defaultName!, folders);
        } catch (e) {
          /* ignore */
        }
      }

      let file;

      if (valid) {
        file = valid;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 150));
        const res = await vscode.window.showOpenDialog({
          openLabel: `Select ${options.title}`,
          canSelectFiles: !options.folder,
          canSelectFolders: options.folder,
          canSelectMany: false,
          defaultUri: valid ? vscode.Uri.file(valid) : undefined,
        });

        if (!res || res.length === 0) {
          return;
        }

        file = res[0].fsPath;
      }

      if (
        (await fs.existsSync(file)) &&
        (!options.validator || (await options.validator(file)))
      ) {
        if (key) {
          await this.setConfig(key, file);
        }
      } else {
        throw new Error(`Invalid location for ${options.title}: ${file}`);
      }

      if (options.onAdd) {
        await options.onAdd(file);
      }

      return file;
    } else {
      return this.getConfig(key) as string;
    }
  }

  static async getFFmpegBinary() {
    if (this.hasConfig("ffmpeg-binary")) {
      return this.getConfig("ffmpeg-binary") as string;
    }

    const binName = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
    const res = await vscode.window.showInformationMessage(
      "FFMpeg is not set, would you like to find it in the filesystem or download the latest version?",
      "Find in filesystem",
      "Download"
    );

    if (res === "Download") {
      const output = await this.getLocation(null, {
        title: "Download location",
        folder: true,
        executable: false,
      });
      if (!output) {
        throw new Error("FFMpeg download location not selected");
      }

      let downloader: Promise<string>;

      vscode.window.withProgress(
        {
          title: "Downloading FFMpeg",
          location: vscode.ProgressLocation.Notification,
        },
        async (progress, token) => {
          downloader = DownloadUtil.downloadComponent({
            destination: output,
            progress: (pct) => {
              progress.report({ increment: Math.trunc(pct * 100) });
            },
          });
          await downloader;
        }
      );

      const loc = await downloader!;
      await this.setConfig("ffmpeg-binary", loc);
      return loc;
    } else if (res === "Find in filesystem") {
      return await this.getLocation("ffmpeg-binary", {
        title: "FFMpeg Binary",
        folder: false,
        defaultName: binName,
        executable: true,
        validator: (file) => /ffmpeg/i.test(file),
      });
    }
  }
}
