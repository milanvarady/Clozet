<script lang="ts">
  interface Props {
    trailingSpace: string;
  }

  let { trailingSpace }: Props = $props();
</script>

{#if trailingSpace.includes('\n')}
  {#each trailingSpace.match(/\n/g) ?? [] as _}
    <br />
  {/each}
{:else if trailingSpace}
  {' '}
{/if}
