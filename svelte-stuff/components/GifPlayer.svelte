<script lang="ts">
    import { onMount } from "svelte";
    export let gifImg: string;

    let isLoading = true;

    onMount(() => {
        if (gifImg !== "") {
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <p>Loading...</p>
{:else}
    <img src={`data:image/gif;base64,${gifImg}`} alt="gif" />
{/if}
