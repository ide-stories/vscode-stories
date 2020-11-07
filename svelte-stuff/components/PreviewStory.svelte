<script lang="ts">
  import TextPlayer from "./TextPlayer.svelte";
</script>

<TextPlayer
  startingChunks={initialText.split('\n')}
  textChunks={initialText.split('\n')}
  recordingSteps={initRecordingSteps} />;
