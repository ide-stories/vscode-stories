export const _prod_ = process.env.NODE_ENV === "production";
export const accessTokenKey = "@stories/token" + (_prod_ ? "" : "dev");
export const refreshTokenKey = "@stories/refresh-token" + (_prod_ ? "" : "dev");
export const apiBaseUrl = _prod_
  ? "https://bowl.azurewebsites.net"
  : "http://localhost:8080";
