<script lang="ts">
  import { onMount } from "svelte";

  import StoryBubble from "./StoryBubble.svelte";
  import type {
    TextStoryListItem,
    TextStoryListResponse,
  } from "../shared/types";
  import { query } from "../shared/query";

  let loadingState: "initial" | "more" | "refetch" | "ready" = "initial";
  let fLoadingState: "initial" | "more" | "refetch" | "ready" = "initial";

  let cursor = 0;
  let fCursor = 0;
  let fIds = []; // Has to be global, because the fetchStories function also checks for friends
  const fetchFriends = async () => {
    try {
      const response = await query(
        `/text-stories/friends/hot` + (fCursor ? `/${fCursor}/${fIds.join(",")}` : "" )
      );
      fIds = response.friendIds;
      hasMoreFriends = response.hasMore;

      const friendStoryIds = new Set();
      const newFriendStories = [];
      if (fLoadingState !== "refetch") {
        friendStories.forEach((s) => {
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

      friendStories = newFriendStories;
    } catch (err) {
      error = err;
    }
    fLoadingState = "ready";
  }
  const fetchStories = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/text-stories/hot` + (cursor ? `/${cursor}` : "")
      );
      const d = await response.json();
      const ids = new Set();
      const newStories = [];
      if (loadingState !== "refetch") {
        stories.forEach((s) => {
          if (fIds.includes(s.creatorId)) {
            s.creatorIsFriend = true;
          }
          newStories.push(s);
          ids.add(s.id);
        });
      }
      for (const s of d.stories) {
        if (!ids.has(s.id)) {
          if (fIds.includes(s.creatorId)) {
            s.creatorIsFriend = true;
          }
          newStories.push(s);
          ids.add(s.id);
        }
      }
      stories = newStories;
      hasMore = d.hasMore;
    } catch (err) {
      error = err;
    }
    loadingState = "ready";
  };

  let stories: TextStoryListItem[] = [];
  let friendStories: TextStoryListItem[] = [];
  let hasMore = false;
  let hasMoreFriends = false;
  let error = null;
  let authenticated = accessToken === "" ? false : true;

  onMount(async () => {
    if (authenticated) {
      await fetchFriends(); // Has to come first, since fIds has to be initialized before fetchStories checks for friends
    }
    await fetchStories();
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "new-story":
        if (stories.every((x) => x.id !== message.story.id)) {
          stories = [message.story, ...stories];
        }
        break;
      case "refresh":
        if (loadingState === "ready") {
          cursor = 0;
          fCursor = 0;
          fLoadingState = "refetch";
          loadingState = "refetch";
          if (authenticated) {
            fetchFriends();
          }
          fetchStories();
        }
        break;
    }
  });
</script>

<style>
  button {
    margin-bottom: 20px;
  }
  button:disabled{
    filter: opacity(0.75);
  }
  .caption {
    margin-top: -5px;
    text-transform: uppercase;
    font-size: x-small;
    text-align: left;
  }
  .story-grid {
    display: grid;
    gap: 10px;
    justify-content: space-around;
    grid-template-columns: repeat(auto-fit, 60px);
    margin-top: 5px;
    margin-bottom: 20px;
  }
  .one {
    opacity: 0;
    -webkit-animation: dot 1.3s infinite;
    -webkit-animation-delay: 0.0s;
    animation: dot 1.3s infinite;
    animation-delay: 0.0s;
  }
  .two {
    opacity: 0;
    -webkit-animation: dot 1.3s infinite;
    -webkit-animation-delay: 0.2s;
    animation: dot 1.3s infinite;
    animation-delay: 0.2s;
  }
  .three {
    opacity: 0;
    -webkit-animation: dot 1.3s infinite;
    -webkit-animation-delay: 0.3s;
    animation: dot 1.3s infinite;
    animation-delay: 0.3s;
  }
  @-webkit-keyframes dot {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
  }
  @keyframes dot {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
  }
</style>

<main>
  {#if error}
    <p>An error has occured: {error.message}</p>
  {:else if loadingState === 'initial' || loadingState === 'refetch'}
    <p>loading stories...</p>
  {:else}
    {#if authenticated && friendStories.length > 0}
      <p class="caption" style="margin-top: -2px;">GitHub Friends</p>
      <div class="story-grid">
        {#each friendStories as story}
          <StoryBubble
            onClick={() => {
              tsvscode.postMessage({ type: 'onStoryPress', value: story });
            }}
            {...story} />
        {/each}
      </div>
      {#if hasMoreFriends}
        <button
          disabled={fLoadingState !== 'ready'}
          on:click={() => {
            fLoadingState = 'more';
            fCursor++;
            if (authenticated) {
              fetchFriends();
            }
          }}>
        {#if fLoadingState === 'more'}
          loading<span class="one">.</span><span class="two">.</span><span class="three">.</span>
        {:else}
          load more
        {/if}
        </button>
      {/if}
      <hr />
    {/if}
    <p class="caption">Explore</p>
    <div class="story-grid">
      {#each stories as story}
        <StoryBubble
          onClick={() => {
            tsvscode.postMessage({ type: 'onStoryPress', value: story });
          }}
          {...story} />
      {/each}
    </div>
    {#if hasMore}
      <button
        disabled={loadingState !== 'ready'}
        on:click={() => {
          loadingState = 'more';
          cursor++;
          fetchStories();
        }}>
      {#if loadingState === 'more'}
        loading<span class="one">.</span><span class="two">.</span><span class="three">.</span>
      {:else}
        load more
      {/if}
      </button>
    {/if}
  {/if}
</main>
