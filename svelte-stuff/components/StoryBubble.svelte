<script lang="ts">
  export let creatorAvatarUrl;
  export let creatorUsername;
  export let flair;
  export let onClick;
</script>

<style>
  :root {
    --size-avatar: 54px;
    --size-border: 2px;
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
    margin-left: 2px;
    height: 14px;
    width: 14px;
    margin-bottom: -3px;
  }
</style>

<div on:click={onClick} class="unit">
  <div class="avatar has-story">
    <img alt="avatar" src={creatorAvatarUrl} />
  </div>
  <div class="name-container">
    <div>{creatorUsername.slice(0, 8)}</div>
    {#if flair && flair in flairMap}
      <div class="flair">
        <img alt={`${flair}-flair`} src={flairMap[flair]} />
      </div>
    {/if}
  </div>
</div>
