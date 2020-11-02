import fetch from "node-fetch";
import { mutation, mutationNoErr } from "./mutation";
import { queryNoErr } from "./query";

const cache: Record<string, any> = {};
const fetchingMap: Record<string, boolean> = {};

export const getStoryById = async (id: string) => {
  if (!(id in cache)) {
    if (fetchingMap[id]) {
      return null;
    }
    fetchingMap[id] = true;
    const data = await queryNoErr("/text-story/" + id);
    if (data) {
      cache[id] = data.story;
    }
    fetchingMap[id] = false;
  }

  return cache[id];
};

export const likeStory = async (id: string, newLikeAmount: number) => {
  try {
    await mutation("/like-text-story/" + id, {});
  } catch {
    return;
  }
  if (id in cache) {
    cache[id].numLikes = newLikeAmount;
  }
};
