<script lang="ts">
  import { onMount } from "svelte";
  import { mutation } from "../shared/mutation";
  import { query } from "../shared/query";
  import type { GifStory, TextStory } from "../shared/types";
  import TextPlayer from "./TextPlayer.svelte";

  let isLoading = true;
  let textStory: TextStory | null = null;
  let gifStory: GifStory | null = null;
  let isFriend: boolean = false;
  let error: Error | null = null;
  let likeClickable = true;
  let authenticated = isLoggedIn;

  onMount(async () => {
    try {
      if (authenticated) {
        isFriend = story.creatorIsFriend;
      }

      var data;
      if (story.type === "gif") {
        data = await query(`/gif-story/${story.id}`);
        gifStory = data.story;
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

<style>
  .pic {
    height: 32px;
    width: 32px;
    border-radius: 50%;
  }

  .top {
    margin: 10px 0px;
    display: flex;
    align-items: center;
    width: 100%;
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

  .heart {
    cursor: pointer;
    width: 20px;
    height: 20px;
  }

  .likes {
    margin-left: 3px;
  }
  .trash {
    cursor: pointer;
    margin-left: 10px;
  }
  .friend {
    cursor: pointer;
    margin-left: 10px;
  }
  .menu {
    display: none;
    margin-left: auto;
    overflow: hidden;
  }
  .menu .dropbtn {
    color: white;
    margin: 0;
    font-size: 10px;
  }
  .menu:hover .dropbtn {
    background-color: black;
    opacity: 0.2;
  }
  .menu-content {
    position: absolute;
    right: 0;
    display: none;
    background-color: #f9f9f9;
    min-width: 120px;
    z-index: 1;
  }
  .menu-content a {
    float: none;
    color: black;
    padding: 8px 12px;
    text-decoration: none;
    display: block;
    text-align: left;
  }
  .menu-content a#reportBtn {
    color: red;
  }
  .menu-content a:hover {
    background-color: #ddd;
  }
  .menu:hover .menu-content {
    display: block;
  }
</style>

<div class="top">
  <img alt="avatar" class="pic" src={story.creatorAvatarUrl} />
  <div class="username-and-flair">
    <div class="username">{story.creatorUsername.slice(0, 30)}</div>
    {#if story.flair in flairMap}
      <img class="flair" src={flairMap[story.flair]} />
    {/if}
  </div>
  {#if textStory}
    {#if !textStory.hasLiked && likeClickable}
      <svg
        on:click={async () => {
          likeClickable = false;
          try {
            await mutation(`/like-text-story/${textStory.id}`, {});
            textStory.hasLiked = true;
            textStory.numLikes++;
          } catch {}
          likeClickable = true;
        }}
        viewBox="0 0 24 24"
        fill="#fff"
        class="heart"><g>
          <path
            d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z" />
        </g></svg>
    {:else if likeClickable}
      <svg
        on:click={async () => {
          likeClickable = false;
          try {
            await mutation(`/unlike-text-story/${textStory.id}`, {});
            textStory.hasLiked = false;
            textStory.numLikes--;
          } catch {}
          likeClickable = true;
        }}
        viewBox="0 0 24 24"
        fill="rgb(224, 36, 94)"
        class="heart"><g>
          <path
            d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
        </g></svg>
    {:else if !textStory.hasLiked && !likeClickable}
      <svg viewBox="0 0 24 24" fill="#fff" class="heart"><g>
          <path
            d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z" />
        </g></svg>
    {:else if textStory.hasLiked && !likeClickable}
      <svg viewBox="0 0 24 24" fill="rgb(224, 36, 94)" class="heart"><g>
          <path
            d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z" />
        </g></svg>
    {/if}
    <div class="likes">{textStory.numLikes.toLocaleString()}</div>
    {#if currentUserId === textStory.creatorId || currentUserId === 'dac7eb0f-808b-4842-b193-5d68cc082609'}
      <svg
        on:click={async () => {
          try {
            await mutation('/delete-text-story/' + textStory.id, {});
            tsvscode.postMessage({ type: 'close' });
            tsvscode.postMessage({
              type: 'onInfo',
              value: `Delete successful, but the story is still showing because I'm too lazy to clear the cache atm`,
            });
          } catch {}
        }}
        class="trash"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"><polyline points="3 6 5 6 21 6" />
        <path
          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" /></svg>
    {/if}
    {#if !isFriend && currentUserId !== textStory.creatorId}
      <svg
        on:click={async () => {
          try {
            await mutation(`/add-friend/${story.creatorUsername}`, {});
            const friendsData = await query(`/is-friend/${story.creatorUsername}`);
            if (friendsData.ok === true) {
              isFriend = true;
            } else {
              tsvscode.postMessage({ type: "onError", value: "Something went wrong! This user might have blocked you." });
            }
          } catch {}
        }}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        class="friend"><g>
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path
            fill="white"
            d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H9zm-3-3v-3h3v-2H6V7H4v3H1v2h3v3z" />
        </g></svg>
    {:else if currentUserId !== textStory.creatorId}
      <svg
        on:click={async () => {
          await mutation(`/remove-friend/${story.creatorUsername}`, {});
          isFriend = false;
        }}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        class="friend"><g>
          <path
            fill="white"
            d="M14,8c0-2.21-1.79-4-4-4S6,5.79,6,8s1.79,4,4,4S14,10.21,14,8z M2,18v1c0,0.55,0.45,1,1,1h14c0.55,0,1-0.45,1-1v-1 c0-2.66-5.33-4-8-4S2,15.34,2,18z M18,10h4c0.55,0,1,0.45,1,1v0c0,0.55-0.45,1-1,1h-4c-0.55,0-1-0.45-1-1v0 C17,10.45,17.45,10,18,10z" />
        </g></svg>
    {/if}
  {/if}
  <div class="menu">
    <button class="dropbtn">OPTIONS 
      <i class="fa fa-caret-down"></i>
    </button>
    <div class="menu-content">
      <a href="#">Hide stories</a>
      <a href="#" id="reportBtn">Report user</a>
    </div>
  </div>
</div>

{#if isLoading}
  <p>loading...</p>
{:else if error}
  <p style="color: red">{error.message}</p>
{:else if textStory}
  <TextPlayer
    startingChunks={textStory.text.split('\n')}
    textChunks={textStory.text.split('\n')}
    recordingSteps={textStory.recordingSteps} />
{:else}
  <p>could not find story</p>
{/if}
