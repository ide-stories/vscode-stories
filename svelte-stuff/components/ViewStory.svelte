<script lang="ts">
  import { onMount } from "svelte";
  import { query } from "../shared/query";
  import type { GifStory, TextStory, StoryListItem } from "../shared/types";
  import TextPlayer from "./TextPlayer.svelte";
  import GifPlayer from "./GifPlayer.svelte";
  import Menu from "./Menu.svelte";

  let incommingStory: StoryListItem = story;
  let isLoading = true;
  let textStory: TextStory | null = null;
  let gifStory: GifStory | null = null;
  let isFriend: boolean = false;
  let error: Error | null = null;

  onMount(async () => {
    try {
      if (isLoggedIn) {
        isFriend = incommingStory.creatorIsFriend;
      }

      var data;
      if (incommingStory.type === "gif") {
        data = await query(`/gif-story/${story.id}`);
        gifStory = data.story;

        if (gifImg === "") {
          tsvscode.postMessage({
            type: "onGif",
            value: story.id,
          });
        }
      } else {
        data = await query(`/text-story/${story.id}`);
        textStory = data.story;
      }
    } catch (err) {
      error = err;
    }
    isLoading = false;
  });
</script>

<div class="top">
  <img alt="avatar" class="pic" src={incommingStory.creatorAvatarUrl} />
  <div class="username-and-flair">
    <div class="username">{incommingStory.creatorUsername.slice(0, 30)}</div>
    {#if incommingStory.flair in flairMap}
      <img class="flair" src={flairMap[incommingStory.flair]} />
    {/if}
  </div>
  {#if !isLoading}
    <Menu
      storyType={incommingStory.type}
      {tsvscode}
      {textStory}
      {gifStory}
      {isFriend}
      creatorUsername={incommingStory.creatorUsername}
    />
  {/if}
</div>

{#if isLoading}
  <p>loading...</p>
{:else if error}
  <p style="color: red">{error.message}</p>
{:else if textStory}
  <TextPlayer
    startingChunks={textStory.text.split("\n")}
    textChunks={textStory.text.split("\n")}
    recordingSteps={textStory.recordingSteps}
  />
{:else if gifStory}
  <GifPlayer {gifImg} />
{:else}
  <p>could not find story</p>
{/if}

<style>
  .pic {
    border-radius: 50%;
  }

  .top {
    /* border: 2px solid red; */
    margin: 10px 0px;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
  }

  .username-and-flair {
    margin: 0px 10px;
    display: flex;
  }

  .flair {
    margin-left: 2px;
    height: 14px;
    width: 14px;
    margin-bottom: -3px;
  }
</style>
