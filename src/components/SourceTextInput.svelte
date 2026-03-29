<script lang="ts">
  import { store, clearSelections } from '../lib/state.svelte';

  let hasSelections = $derived(store.selections.length > 0);

  function handleInput(e: Event) {
    store.sourceText = (e.target as HTMLTextAreaElement).value;
  }

  function handleClearAndEdit() {
    clearSelections();
  }
</script>

<section class="no-print">
  <h2 class="mb-2 text-lg font-semibold text-gray-900">1. Paste your text</h2>
  <textarea
    class="w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
      {hasSelections ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}"
    rows="8"
    placeholder="Paste or type your text here..."
    value={store.sourceText}
    oninput={handleInput}
    disabled={hasSelections}
  ></textarea>

  <div class="mt-3 flex min-h-10 flex-wrap items-center gap-4">
    <label class="flex items-center gap-2 text-sm {hasSelections ? 'text-gray-400' : 'text-gray-700'}">
      <input
        type="checkbox"
        class="accent-primary h-4 w-4 rounded"
        checked={store.settings.keepFormatting}
        disabled={hasSelections}
        onchange={() => {
          store.settings.keepFormatting = !store.settings.keepFormatting;
        }}
      />
      Keep original formatting
      <span class="text-xs text-gray-400">
        {#if store.settings.keepFormatting}
          (preserving all line breaks and spaces)
        {:else}
          (collapsing extra line breaks and spaces)
        {/if}
      </span>
    </label>

    {#if hasSelections}
      <button
        class="rounded-md border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
        onclick={handleClearAndEdit}
      >
        Clear gaps & edit
      </button>
    {/if}
  </div>
</section>
