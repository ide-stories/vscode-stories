<script lang="ts">
  import { onMount } from "svelte";

  import StoryBubble from "./StoryBubble.svelte";
  import type { FriendsStoryListResponse, StoryListResponse } from "../shared/types";
  import { fetchFriends, fetchStories, fetchUserStories } from "../shared/api";

  let loadingState: "initial" | "more" | "refetch" | "ready" = "initial";
  let fLoadingState: "initial" | "more" | "refetch" | "ready" = "initial";
  let uLoadingState: "initial" | "more" | "refetch" | "ready" = "initial";

  let cursor = 0;
  let fCursor = 0;
  let uCursor = 0;
  
  let storyListResponse: StoryListResponse = {stories: [], hasMore: false} as StoryListResponse;
  let userStoryListResponse: StoryListResponse = {stories: [], hasMore: false} as StoryListResponse;
  let friendsStoryListResponse: FriendsStoryListResponse = {stories: [], friendIds: [], hasMore: false} as FriendsStoryListResponse;
  let error = null;
  let authenticated = isLoggedIn;

  function instanceOfFSLR(data: any): data is FriendsStoryListResponse {
    return 'friendIds' in data;
  }

  function instanceOfSLR(data: any): data is StoryListResponse {
    return 'stories' in data;
  }

  const fetchOwnStories = async () => {
    let a = await fetchUserStories(uCursor, uLoadingState, userStoryListResponse);
    if (instanceOfSLR(a)) {
      userStoryListResponse = a;
    } else {
      error = a;
    }
    uLoadingState = "ready";
  };


  const fetchFriendStories = async () => {
    let a = await fetchFriends(fCursor, fLoadingState, friendsStoryListResponse);
    if (instanceOfFSLR(a)) {
      friendsStoryListResponse = a;
    } else {
      error = a;
    }
    fLoadingState = "ready";
  };

  const fetchExploreStories = async () => {
    let a = await fetchStories(cursor, loadingState, friendsStoryListResponse, storyListResponse);
    if (instanceOfSLR(a)) {
      storyListResponse = a;
    } else {
      error = a;
    }
    loadingState = "ready";
  };

  onMount(async () => {
    if (authenticated) {
      await fetchOwnStories();
      await fetchFriendStories(); // Has to come first, since fIds has to be initialized before fetchStories checks for friends
    }
    await fetchExploreStories();
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
      case "new-story":
        if (storyListResponse.stories.every((x) => x.id !== message.story.id)) {
          storyListResponse.stories = [message.story, ...storyListResponse.stories];
          userStoryListResponse.stories = [message.story, ...userStoryListResponse.stories];
        }
        break;
      case "refresh":
        if (loadingState === "ready") {
          cursor = 0;
          fCursor = 0;
          uCursor = 0;
          uLoadingState = "refetch";
          fLoadingState = "refetch";
          loadingState = "refetch";
          if (authenticated) {
            fetchFriendStories();
            fetchOwnStories();
          }
          fetchExploreStories();
        }
        break;
    }
  });
</script>

<main>
  {#if error}
    <p>An error has occured: {error.message}</p>
  {:else if loadingState === "initial" || loadingState === "refetch"}
    <p>loading stories...</p>
  {:else}
    {#if authenticated && userStoryListResponse.stories.length > 0}
      <p class="caption" style="margin-top: -2px;">Own Stories</p>
      <div class="story-grid">
        {#each userStoryListResponse.stories as story}
          <StoryBubble
            onClick={() => {
              tsvscode.postMessage({ type: 'onStoryPress', value: story });
            }}
            {...story} />
        {/each}
      </div>
      {#if userStoryListResponse.hasMore}
        <button
          disabled={uLoadingState !== 'ready'}
          on:click={() => {
            uLoadingState = 'more';
            uCursor++;
            if (authenticated) {
              fetchOwnStories();
            }
          }}>
        {#if uLoadingState === 'more'}
          loading<span class="one">.</span><span class="two">.</span><span class="three">.</span>
        {:else}
          load more
        {/if}
        </button>
      {/if}
      <hr />
    {/if}
    {#if authenticated && friendsStoryListResponse.stories.length > 0}
      <p class="caption" style="margin-top: -2px;">GitHub Friends</p>
      <div class="story-grid">
        {#each friendsStoryListResponse.stories as story}
          <StoryBubble
            onClick={() => {
              tsvscode.postMessage({ type: "onStoryPress", value: story });
            }}
            {...story}
          />
        {/each}
      </div>
      {#if friendsStoryListResponse.hasMore}
        <button
          disabled={fLoadingState !== "ready"}
          on:click={() => {
            fLoadingState = "more";
            fCursor++;
            if (authenticated) {
              fetchFriendStories();
            }
          }}
        >
          {#if fLoadingState === "more"}
            loading<span class="one">.</span><span class="two">.</span><span
              class="three">.</span
            >
          {:else}
            load more
          {/if}
        </button>
      {/if}
      <hr />
    {/if}
    <p class="caption">Explore</p>
    <div class="story-grid">
      {#each storyListResponse.stories as story}
        <StoryBubble
          onClick={() => {
            tsvscode.postMessage({ type: "onStoryPress", value: story });
          }}
          {...story}
        />
      {/each}
    </div>
    {#if storyListResponse.hasMore}
      <button
        disabled={loadingState !== "ready"}
        on:click={() => {
          loadingState = "more";
          cursor++;
          fetchExploreStories();
        }}
      >
        {#if loadingState === "more"}
          loading<span class="one">.</span><span class="two">.</span><span
            class="three">.</span
          >
        {:else}
          load more
        {/if}
      </button>
    {/if}
  {/if}
</main>

<style>
  button {
    margin-bottom: 20px;
  }
  button:disabled {
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
    -webkit-animation-delay: 0s;
    animation: dot 1.3s infinite;
    animation-delay: 0s;
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
