<script lang="ts">
  import StoryBubble from "./StoryBubble.svelte";
  import type { TextStoryListResponse } from "./types";

  const fetchStories: Promise<TextStoryListResponse> = (async () => {
    const response = await fetch(`${apiBaseUrl}/text-stories/hot`);
    return await response.json();
  })();
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  {#await fetchStories}
    <p>loading stories...</p>
  {:then data}
    {#each data.stories as story}
      <StoryBubble name={story.creatorUsername} />
    {/each}
  {:catch error}
    <p>An error has occured: {error.message}</p>
  {/await}
</main>
