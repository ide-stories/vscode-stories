import { readFileSync } from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const fetchFile = (url: string, path: string) => {
  const formData = new FormData();
  formData.append("file", readFileSync(path));
  return fetch(url, {
    method: "POST",
    body: formData,
    headers: formData.getHeaders(),
  });
};
