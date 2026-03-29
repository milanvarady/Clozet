<script lang="ts">
  import {
    store,
    getTokens,
    getSelectedTokenIdSet,
    getTokenToSelectionMap,
    handleWordClick,
  } from '../lib/state.svelte';
  import WordToken from './WordToken.svelte';
  import TrailingSpace from './TrailingSpace.svelte';
  import type { SelectionType } from '../lib/types';

  function getTokenSelectionInfo(tokenId: number): {
    type: SelectionType | null;
    position: 'start' | 'end' | 'middle' | 'single' | null;
  } {
    const sel = getTokenToSelectionMap().get(tokenId);
    if (!sel) return { type: null, position: null };
    if (sel.type !== 'range') return { type: sel.type, position: 'single' };
    if (sel.tokenIds[0] === tokenId) return { type: 'range', position: 'start' };
    if (sel.tokenIds[sel.tokenIds.length - 1] === tokenId) return { type: 'range', position: 'end' };
    return { type: 'range', position: 'middle' };
  }

  function toggleRangeMode() {
    store.mobileRangeMode = !store.mobileRangeMode;
    if (!store.mobileRangeMode) {
      store.mobileRangeStart = null;
    }
  }
</script>

<section class="no-print">
  <h2 class="mb-2 text-lg font-semibold text-gray-900">
    2. Select words to create gaps
  </h2>

  {#if getTokens().length === 0}
    <p class="text-sm text-gray-400 italic">Enter some text above to get started.</p>
  {:else}
    <p class="mb-3 text-sm text-gray-500">
      Click words to select them as gaps. Hold <kbd
        class="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs"
        >Shift</kbd
      > and click to select a range.
    </p>

    <div class="mb-3">
      <button
        type="button"
        class="min-w-48 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors
          {store.mobileRangeMode
          ? 'border-primary bg-primary text-white'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
        onclick={toggleRangeMode}
      >
        {#if store.mobileRangeMode}
          {#if store.mobileRangeStart !== null}
            Now tap the end word
          {:else}
            Tap the start word
          {/if}
        {:else}
          Range select mode
        {/if}
      </button>

      {#if store.selections.length > 0}
        <span class="ml-3 text-sm text-gray-500">
          {store.selections.length} gap{store.selections.length !== 1 ? 's' : ''} selected
        </span>
      {/if}
    </div>

    <div
      class="rounded-lg border border-gray-200 bg-gray-50 p-4 leading-relaxed"
    >
      {#each getTokens() as token (token.id)}
        {#if token.isWord}
          {@const info = getTokenSelectionInfo(token.id)}
          <WordToken
            {token}
            isSelected={getSelectedTokenIdSet().has(token.id)}
            selectionType={info.type}
            rangePosition={info.position}
            isRangePending={store.mobileRangeMode && store.mobileRangeStart === token.id}
            onclick={handleWordClick}
          />
        {/if}
        <TrailingSpace trailingSpace={token.trailingSpace} />
      {/each}
    </div>
  {/if}
</section>
