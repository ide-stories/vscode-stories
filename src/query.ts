import fetch from "node-fetch";
import * as vscode from "vscode";
import { refreshTokenKey, accessTokenKey, apiBaseUrl } from "./constants";
import { Util } from "./util";

export const queryNoErr = async (path: string) => {
  try {
    const d = query(path);
    return d;
  } catch {}
};

export const query = async (path: string) => {
  try {
    const r = await fetch(apiBaseUrl + path, {
      headers: {
        "access-token": Util.getAccessToken(),
        "refresh-token": Util.getRefreshToken(),
      },
    });
    if (r.status !== 200) {
      throw new Error(await r.text());
    }
    const accessToken = r.headers.get("access-token");
    const refreshToken = r.headers.get("refresh-token");
    if (accessToken && refreshToken) {
      await Util.context.globalState.update(accessTokenKey, accessToken);
      await Util.context.globalState.update(refreshTokenKey, refreshToken);
      // tsvscode.postMessage({
      //   type: "tokens",
      //   accessToken: accessToken,
      //   refreshToken: refreshToken,
      // });
    }
    const d = await r.json();
    return d;
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage(err.message);
    throw err;
  }
};

// https://cloud.google.com/storage/docs/xml-api/reference-headers#xgoogcontentlengthrange
export const queryUpload = async (path: string, file: any) => {
  try {
    if (Util.getAccessToken() === "") {
      throw new Error("not authenticated!");
    }
    const r = await fetch(path, {
      method: "PUT",
      body: file,
      headers: {
        "content-type": "image/gif",
        "x-goog-content-length-range": "1,5242880",
      },
    });
    if (r.status !== 200) {
      throw new Error(await r.text());
    }
    const accessToken = r.headers.get("access-token");
    const refreshToken = r.headers.get("refresh-token");
    if (accessToken && refreshToken) {
      await Util.context.globalState.update(accessTokenKey, accessToken);
      await Util.context.globalState.update(refreshTokenKey, refreshToken);
      // tsvscode.postMessage({
      //   type: "tokens",
      //   accessToken: accessToken,
      //   refreshToken: refreshToken,
      // });
    }
    // const d = await r.json();
    // return d;
  } catch (err) {
    console.log(err);
    vscode.window.showErrorMessage(err.message);
    throw err;
  }
};
