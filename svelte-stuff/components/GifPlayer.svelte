<script lang="ts">
    export let gifImg: string;
</script>

<img src={`data:image/gif;base64,${gifImg}`} alt="gif" />
