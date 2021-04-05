<script lang="ts">
    import { onMount } from "svelte";
    import type { GifStory } from "../shared/types";

    export let tsvscode: any;
    export let gifStory: GifStory | null = null;
    export let gifImg: string;

    let isLoading: boolean = true;

    onMount(() => {
        if (gifImg !== "") {
            isLoading = false;
        } else {
            tsvscode.postMessage({
                type: "onGif",
                value: gifStory.mediaId,
            });
        }
    });
</script>

{#if isLoading}
    <p>Loading...</p>
{:else}
    <img src={`data:image/gif;base64,${gifImg}`} alt="gif" />
{/if}
