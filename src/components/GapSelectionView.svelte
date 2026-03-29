<script lang="ts">
  import {
    store,
    getTokens,
    getSelectedTokenIdSet,
    getTokenToSelectionMap,
    handleWordClick,
  } from '../lib/state.svelte';
  import WordToken from './WordToken.svelte';
  import type { SelectionType } from '../lib/types';

  function getSelectionType(tokenId: number): SelectionType | null {
    const sel = getTokenToSelectionMap().get(tokenId);
    return sel ? sel.type : null;
  }

  function isRangeStart(tokenId: number): boolean {
    const sel = getTokenToSelectionMap().get(tokenId);
    return sel?.type === 'range' && sel.tokenIds[0] === tokenId;
  }

  function isRangeEnd(tokenId: number): boolean {
    const sel = getTokenToSelectionMap().get(tokenId);
    return (
      sel?.type === 'range' && sel.tokenIds[sel.tokenIds.length - 1] === tokenId
    );
  }

  function isRangeMiddle(tokenId: number): boolean {
    const sel = getTokenToSelectionMap().get(tokenId);
    if (!sel || sel.type !== 'range') return false;
    return sel.tokenIds[0] !== tokenId && sel.tokenIds[sel.tokenIds.length - 1] !== tokenId;
  }

  function toggleRangeMode() {
    store.mobileRangeMode = !store.mobileRangeMode;
    if (!store.mobileRangeMode) {
      store.mobileRangeStart = null;
    }
  }

  function onWordClick(tokenId: number, shiftKey: boolean) {
    handleWordClick(tokenId, shiftKey);
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
          <WordToken
            {token}
            isSelected={getSelectedTokenIdSet().has(token.id)}
            selectionType={getSelectionType(token.id)}
            isRangeStart={isRangeStart(token.id)}
            isRangeEnd={isRangeEnd(token.id)}
            isRangeMiddle={isRangeMiddle(token.id)}
            isRangePending={store.mobileRangeMode && store.mobileRangeStart === token.id}
            onclick={onWordClick}
          />
        {/if}
        {#if token.trailingSpace.includes('\n')}
          {#each token.trailingSpace.match(/\n/g) ?? [] as _}
            <br />
          {/each}
        {:else}
          {' '}
        {/if}
      {/each}
    </div>
  {/if}
</section>
