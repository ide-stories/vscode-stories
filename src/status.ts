import { StoryType } from "./types";
import { window, StatusBarItem, StatusBarAlignment } from "vscode";
import { Config } from "./config";
import { sleep } from "./sleep";

function clean(x: number) {
  let res = `${Math.trunc(x)}`;
  if (res.length < 2) {
    res = `0${res}`;
  }
  return res;
}

const SECOND_MS = 1000;
const MINUTE_MS = SECOND_MS * 60;
const HOUR_MS = MINUTE_MS * 60;

export class RecordingStatus {
  private item: StatusBarItem;
  timeout?: NodeJS.Timer;
  counting = false;
  storyType = "";

  constructor(storyType: StoryType) {
    this.storyType = storyType;
    this.item = window.createStatusBarItem(StatusBarAlignment.Right);
    this.stop();
    this.item.show();
  }

  show() {
    this.item.show();
  }

  dispose() {
    this.recordingStopped();
    this.item.dispose();
  }

  stop() {
    this.recordingStopped();
    this.item.command = `stories.start${this.storyType}Recording`;
    this.item.text = "$(debug-start) Record Story (beta)";
    this.counting = false;
  }

  stopping() {
    this.recordingStopped();
    this.item.text = "Recording stopping...";
    this.counting = false;
  }

  recordingStopped() {
    if (this.timeout) {
      clearInterval(this.timeout);
    }
  }

  updateTime(originalText: string, start: number) {
    const time = Date.now() - start;
    let timeStr = `${clean((time / MINUTE_MS) % 60)}:${clean(
      (time / SECOND_MS) % 60
    )}`;
    if (time > HOUR_MS) {
      timeStr = `${Math.trunc(time / HOUR_MS)}:${timeStr}`;
    }
    this.item.text = `${originalText}: ${timeStr}`;
  }

  start() {
    this.item.command = `stories.stop${this.storyType}Recording`;
    this.item.text = "$(debug-stop) Recording";

    const update = this.updateTime.bind(this, this.item.text, Date.now());

    this.timeout = setInterval(update, 1000);

    update();
  }

  async countDown(seconds?: number) {
    if (seconds === undefined) {
      seconds = 3;
    }

    this.item.command = `stories.stop${this.storyType}Recording`;

    this.counting = true;

    for (let i = seconds; i > 0; i -= 1) {
      this.item.text = `$(debug-breakpoint-log-unverified) Starting in ${i} seconds...`;

      await sleep(1000);

      if (!this.counting) {
        throw new Error("Countdown canceled");
      }
    }

    this.counting = false;
    this.item.text = "Recording starting";
  }
}
