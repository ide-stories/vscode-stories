import fetch from "node-fetch";
import * as vscode from "vscode";

export const queryNoErr = async (path: string) => {
  try {
    const d = query(path);
    return d;
  } catch {}
};

export const query = async (path: string) => {
  try {
    const r = await fetch("https://bowl.azurewebsites.net" + path);
    if (r.status !== 200) {
      throw new Error(await r.text());
    }
    const d = await r.json();
    return d;
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage(err.message);
    throw err;
  }
};
