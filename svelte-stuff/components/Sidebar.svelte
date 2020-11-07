<script lang="ts">
  import { onMount } from "svelte";

  import StoryBubble from "./StoryBubble.svelte";
  import type {
    TextStoryListItem,
    TextStoryListResponse,
  } from "../shared/types";

  let loadingState: "initial" | "more" | "refetch" | "ready" = "initial";

  let cursor = 0;
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/text-stories/hot` + (cursor ? `/${cursor}` : "")
      );
      const d = await response.json();
      const ids = new Set();
      const newStories = [];
      if (loadingState !== "refetch") {
        stories.forEach((s) => {
          newStories.push(s);
          ids.add(s.id);
        });
      }
      for (const s of d.stories) {
        if (!ids.has(s.id)) {
          newStories.push(s);
          ids.add(s.id);
        }
      }
      stories = newStories;
      hasMore = d.hasMore;
      cursor++;
    } catch (err) {
      error = err;
    }
    loadingState = "ready";
  };

  let stories: TextStoryListItem[] = [];
  let hasMore = false;
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
          loadingState = "refetch";
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
