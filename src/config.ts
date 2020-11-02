import * as vscode from "vscode";

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
}
