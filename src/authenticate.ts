import * as express from "express";
import * as vscode from "vscode";
import { refreshTokenKey, tokenKey } from "./constants";
import { Util } from "./util";

// https://github.com/shanalikhan/code-settings-sync/blob/master/src/service/github.oauth.service.ts
export const authenticate = () => {
  const app = express();
  const server = app.listen(54321);
  vscode.commands.executeCommand(
    "vscode.open",
    vscode.Uri.parse(`https://bowl.azurewebsites.net/auth/github`)
  );
  app.get("/callback/:token/:refreshToken", async (req, res) => {
    const { token, refreshToken } = req.params;
    if (!token || !refreshToken) {
      res.send(`ext: something went wrong`);
      server.close();
      return;
    }

    await Util.context.globalState.update(tokenKey, token);
    await Util.context.globalState.update(refreshTokenKey, refreshToken);

    res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src vscode-resource:; form-action vscode-resource:; frame-ancestors vscode-resource:; img-src vscode-resource: https:; script-src 'self' 'unsafe-inline' vscode-resource:; style-src 'self' 'unsafe-inline' vscode-resource:;"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      </head>
      <body>
          <h1>Success! You may now close this tab.</h1>
          <style>
            html, body {
              background-color: #1a1a1a;
              color: #c3c3c3;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100%;
              width: 100%;
              margin: 0;
            }
          </style>
      </body>
    </html>
    `);

    server.close();
  });
};
