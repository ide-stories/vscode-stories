<script lang="ts">
  export let creatorAvatarUrl;
  export let creatorUsername;
  export let flair;
  export let onClick;
  export let creatorIsFriend;
</script>

<style>
  :root {
    --size-avatar: 56px;
    --size-border: 2px;
    --size-flair: 18px;
  }
  .avatar {
    align-items: center;
    background-image: linear-gradient(
      45deg,
      #00a0f3 15%,
      #0090d8 35%,
      #0082d3 50%,
      #007cc0 65%,
      #006db4 85%
    );
    box-sizing: border-box;
    display: flex;
    height: var(--size-avatar);
    justify-content: center;
    overflow: hidden;
    padding: var(--size-border);
    width: var(--size-avatar);
  }
  .avatar#friend {
    background-image: linear-gradient(
      45deg,
      #6f42c1 15%,
      #683eb5 35%,
      #6039a8 50%,
      #59359c 65%,
      #50308c 85%
    );
  }

  .avatar,
  .avatar > img {
    border: var(--size-border) solid var(--vscode-editor-background);
    border-radius: 50%;
  }

  .avatar > img {
    border-width: calc(0.5 * var(--size-border));
    height: auto;
    margin: 0;
    transform: scale(1.1);
    transition: transform 0.6s ease-in-out;
    width: 100%;
  }

  .has-story img {
    transform: scale(1);
  }

  .unit {
    cursor: pointer;
    font-size: calc(var(--vscode-font-size) * 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .name-container {
    margin-top: 4px;
    display: flex;
  }

  .flair {
    margin-top: 13px;
    margin-left: 25px;
    height: var(--size-flair);
    width: var(--size-flair);
    margin-bottom: -5px;
    position: absolute;
  }
</style>

<div on:click={onClick} class="unit">
  {#if creatorIsFriend}
    <div class="avatar has-story" id="friend">
      <img alt="avatar" src={creatorAvatarUrl} />
    </div>
  {:else}
    <div class="avatar has-story">
      <img alt="avatar" src={creatorAvatarUrl} />
    </div>
  {/if}
  <div class="flair">
    {#if flair && flair in flairMap}
      <img alt={`${flair}-flair`} src={flairMap[flair]} />
    {/if}
  </div>
  <div class="name-container">
    <div>{creatorUsername.slice(0, 11)}</div>
  </div>
</div>
