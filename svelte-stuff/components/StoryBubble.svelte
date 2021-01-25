<script lang="ts">
  export let creatorAvatarUrl;
  export let creatorUsername;
  export let flair;
  export let colorscheme = "blue";
  export let onClick; export let creatorIsFriend: boolean;</script>

<style>
  :root {
    --size-avatar: 56px;
    --size-border: 2px;
    --size-flair: 18px;
  }
  .avatar {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    height: var(--size-avatar);
    justify-content: center;
    overflow: hidden;
    padding: var(--size-border);
    width: var(--size-avatar);
  }
  .avatar-rainbow {
    background-image: linear-gradient(
      225deg,
      #95009b 10%,
      #f20085 30%,
      #ffca00 80%
    );
  }
  .avatar-red {
    background-image: linear-gradient(
      225deg,
      red 0%
      darkred 100%,
    );
  }
  .avatar-yellow {
    background-image: linear-gradient(
      225deg,
      lightyellow 0%
      yellow 100%,
    );
  }
  .avatar-green {
    background-image: linear-gradient(
      225deg,
      green 0%
      darkgreen 100%,
    );
  }
  .avatar-blue {
    background-image: linear-gradient(
      225deg,
      #f20085,
      #ffca00
    );
  }
  .avatar-purple {
    background-image: linear-gradient(
      225deg,
      mediumpurple 0%
      purple 100%,
    );
  }
  .avatar#friend {
    background-image: linear-gradient(
      225deg,
      #95009b 5%,
      #f20085 20%,
      #ffca00 60%
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
    <div class="avatar avatar-{colorscheme} has-story" id="friend">
      <img alt="avatar" src={creatorAvatarUrl} />
    </div>
  {:else}
    <div class="avatar avatar-{colorscheme} has-story">
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