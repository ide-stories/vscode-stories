import { query } from "./query";
import type { FriendsStoryListResponse, StoryListItem, StoryListResponse } from "./types";

export const fetchFriends = async (fCursor: number, fLoadingState: string, friendStories: FriendsStoryListResponse): Promise<FriendsStoryListResponse | any> => {
    try {
        const response = await query(
            `/stories/friends/hot` +
            (fCursor ? `/${fCursor}/${friendStories.friendIds.join(",")}` : "")
        );
        friendStories.friendIds = response.friendIds;
        friendStories.hasMore = response.hasMore;

        const friendStoryIds = new Set();
        const newFriendStories: StoryListItem[] = [];
        if (fLoadingState !== "refetch") {
            friendStories.stories.forEach((s) => {
                s.creatorIsFriend = true;
                newFriendStories.push(s);
                friendStoryIds.add(s.id);
            });
        }
        for (const s of response.stories) {
            if (!friendStoryIds.has(s.id)) {
                s.creatorIsFriend = true;
                newFriendStories.push(s);
                friendStoryIds.add(s.id);
            }
        }

        friendStories.stories = newFriendStories;
    } catch (err) {
        return err;
    }
    return friendStories;
};

export const fetchStories = async (cursor: number, loadingState: string, friendStories: FriendsStoryListResponse, storiesRes: StoryListResponse): Promise<StoryListResponse | any> => {
    try {
      const gifRes = await fetch(
        `${apiBaseUrl}/gif-stories/hot/` + (cursor ? `/${cursor}` : "")
      );
      const response = await fetch(
        `${apiBaseUrl}/text-stories/hot` + (cursor ? `/${cursor}` : "")
      );
      const d: StoryListResponse = await response.json();
      const g: StoryListResponse = await gifRes.json();
      const ids = new Set();
      const gids = new Set();
      const newStories = [];
      if (loadingState !== "refetch") {
        storiesRes.stories.forEach((s) => {
          if (friendStories.friendIds.includes(s.creatorId)) {
            s.creatorIsFriend = true;
          }
          newStories.push(s);
          ids.add(s.id);
        });
      }
      for (const s of d.stories) {
        if (!ids.has(s.id)) {
          if (friendStories.friendIds.includes(s.creatorId)) {
            s.creatorIsFriend = true;
          }
          newStories.push(s);
          ids.add(s.id);
        }
      }
      for (const s of g.stories) {
        if (!ids.has(s.id)) {
          if (friendStories.friendIds.includes(s.creatorId)) {
            s.creatorIsFriend = true;
          }
          newStories.push(s);
          gids.add(s.id);
        }
      }
      storiesRes.stories = newStories;
      if (d.hasMore || g.hasMore) {
        storiesRes.hasMore = true;
      }
    } catch (err) {
      return err;
    }
    return storiesRes;
  };
