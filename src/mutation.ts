import fetch from "node-fetch";
import * as vscode from "vscode";
import { Util } from "./util";

export const mutationNoErr = async (path: string, body: any) => {
  try {
    const d = mutation(path, body);
    return d;
  } catch {}
};

export const mutation = async (path: string, body: any) => {
  try {
    const r = await fetch("https://bowl.azurewebsites.net" + path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "access-token": Util.getAccessToken(),
        "refresh-token": Util.getRefreshToken(),
      },
    });
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
