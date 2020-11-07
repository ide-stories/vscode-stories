<script lang="ts">
  import { onMount } from "svelte";
  import { sleep } from "../shared/sleep";
  import { executeChanges } from "../shared/text-utils";
  import type { TextStory } from "../shared/types";
  import { tweened } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  let speed = 1;
  export let startingChunks: string[];
  export let textChunks: string[];
  export let recordingSteps: TextStory["recordingSteps"] | null;
  let state: "running" | "done" | "static" =
    recordingSteps && recordingSteps.length ? "running" : "static";

  const progress = tweened(0, {
    duration: 100,
    easing: cubicOut,
  });

  const go = async () => {
    if (!recordingSteps || !recordingSteps.length) {
      progress.set(1);
      state = "done";
      return;
    }
    state = "running";
    const playBackDateStart = new Date().getTime();
    const finalMs = recordingSteps[recordingSteps.length - 1][0];
    let i = 0;
    while (i < recordingSteps.length) {
      const [ms, changeBlock] = recordingSteps[i];
      const currentDuration =
        (new Date().getTime() - playBackDateStart) * speed;
      if (currentDuration < ms) {
        progress.set(currentDuration / finalMs);
        await sleep(10);
        continue;
      }
      executeChanges(textChunks, changeBlock);
      textChunks = textChunks;
      i++;
    }
    progress.set(1);
    state = "done";
  };

  onMount(async () => {
    await go();
  });
</script>

<style>
  progress {
    display: block;
    width: 100%;
    height: 2px;
  }
  progress::-webkit-progress-value {
    background-color: rgb(0, 122, 204);
  }
  .row {
    display: flex;
    align-items: center;
  }
  .row > button {
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .plain-button {
    all: unset;
    margin: 0px 4px;
    padding: 4px;
    cursor: pointer;
  }
  .active {
    background-color: yellowgreen;
    color: #000;
    border-radius: 50%;
  }
</style>

{#if state === 'done'}
  <button
    on:click={() => {
      textChunks = [...startingChunks];
      progress.set(0);
      go();
    }}>replay</button>
{/if}
<div class="row">
  <div>Change speed:</div>
  {#each [0.5, 1, 2, 3] as n}
    <button
      class:active={n === speed}
      class="plain-button"
      on:click={() => {
        speed = n;
      }}>{n}x</button>
  {/each}
</div>
<progress value={$progress} />
<pre>
    {textChunks.join('\n')}
</pre>
