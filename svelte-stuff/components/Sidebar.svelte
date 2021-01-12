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
  let fIds = [];
  const fetchData = async () => {
    try {
      const res = await query(
        `/text-stories/friends/hot` + (fCursor ? `/${fCursor}/${fIds.join(",")}` : "" )
      );
      fIds = res.friendIds;

      const response = await fetch(
        `${apiBaseUrl}/text-stories/hot` + (cursor ? `/${cursor}` : "")
      );
      const d = await response.json();
      const ids = new Set();
      const ids2 = new Set();
      const newStories = [];
      const newFriendStories = [];
      if (loadingState !== "refetch") {
        stories.forEach((s) => {
          if (fIds.includes(s.creatorId)) {
            s.creatorIsFriend = true;
          }
          newStories.push(s);
          ids.add(s.id);
        });
      }
      if (fLoadingState !== "refetch") {
        friendStories.forEach((s) => {
          s.creatorIsFriend = true;
          newFriendStories.push(s);
          ids2.add(s.id);
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
      for (const s of res.stories) {
        if (!ids2.has(s.id)) {
          s.creatorIsFriend = true;
          newFriendStories.push(s);
          ids2.add(s.id);
        }
      }
      stories = newStories;
      friendStories = newFriendStories;
      hasMore = d.hasMore;
      hasMoreFriends = res.hasMore;
    } catch (err) {
      error = err;
    }
    loadingState = "ready";
    fLoadingState = "ready";
  };

  let stories: TextStoryListItem[] = [];
  let friendStories: TextStoryListItem[] = [];
  let hasMore = false;
  let hasMoreFriends = false;
  let error = null;

  onMount(async () => {
    await fetchData();
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
          loadingState = "refetch";
          fLoadingState = "refetch";
          fetchData();
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
    {#if friendStories.length > 0}
      <p class="caption">GitHub Friends</p>
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
            fetchData();
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
          fetchData();
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
