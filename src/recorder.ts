import {
  Recorder as ScreenRecorder,
  RecordingOptions as Recop,
  GIFCreator,
} from "@arcsine/screen-recorder";

import { Config } from "./config";
import { RecordingOptions } from "./types";
import { ChildProcess } from "child_process";

type Proc = {
  proc: ChildProcess;
  stop: (now?: boolean) => void;
  finish: Promise<Recop>;
};

// https://github.com/arciisine/vscode-chronicler/blob/master/src/recorder.ts
export class Recorder {
  constructor(private proc?: Proc) {}

  get active() {
    return !!this.proc;
  }

  get finish() {
    return this.proc?.finish;
  }

  dispose() {
    this.stop();
  }

  async postProcess(opts: RecordingOptions) {
    try {
      await this.proc?.finish;
      const result = await GIFCreator.generate({
        ...opts,
        scale: opts.gifScale || 1,
      });

      if (result) {
        const animated = await result.finish;
        opts.file = animated;
      }
      return opts;
    } finally {
      this.proc?.stop(true);
      delete this.proc;
    }
  }

  async run(override: Partial<RecordingOptions> = {}) {
    const binary = (await Config.getFFmpegBinary())!;
    const defs = Config.getRecordingDefaults();

    const opts = {
      ...defs,
      file: await Config.getFilename(),
      ...override,
      ffmpeg: {
        binary,
      },
    };

    if (this.proc) {
      throw new Error("Recording already in progress");
    }

    this.proc = await ScreenRecorder.recordActiveWindow(opts);

    return {
      output: async () => {
        const newOpts: RecordingOptions = (await this.proc?.finish) as any;
        return newOpts;
      },
    };
  }

  get running() {
    return !!this.proc;
  }

  stop(force = false) {
    if (!this.running) {
      throw new Error("info:No recording running");
    }
    try {
      this.proc?.stop(force);
    } catch {
      this.proc?.stop(true);
    }
  }
}
