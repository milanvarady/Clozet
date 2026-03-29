<script lang="ts">
  import { getGapOutputData, getTokens, store } from '../lib/state.svelte';
</script>

<section>
  <h2 class="no-print mb-2 text-lg font-semibold text-gray-900">
    4. Preview
  </h2>

  <div
    id="worksheet-preview"
    class="rounded-lg border border-gray-200 bg-white p-6 text-base leading-loose break-words print:rounded-none print:border-none print:p-0"
  >
    {#if store.settings.worksheetTitle}
      <h2 class="mb-4 text-xl font-bold text-gray-900">{store.settings.worksheetTitle}</h2>
    {/if}

    {#if getTokens().length === 0}
      <p class="no-print text-sm text-gray-400 italic">Enter some text above to see the preview.</p>
    {:else if store.selections.length === 0}
      <div class="worksheet-text">
        {#each getTokens() as token}
          <span>{token.text}</span>
          {#if token.trailingSpace.includes('\n')}
            {#each token.trailingSpace.match(/\n/g) ?? [] as _}
              <br />
            {/each}
          {:else if token.trailingSpace}
            {' '}
          {/if}
        {/each}
      </div>
    {:else}
      <div class="worksheet-text">
        {#each getGapOutputData().items as item}
          {#if item.type === 'text'}
            <span>{item.content}</span>
          {:else if item.type === 'newline'}
            <br />
          {:else if item.type === 'gap'}
            <span class="inline-flex whitespace-nowrap items-baseline">{#if store.settings.numberGaps}<span class="text-sm text-gray-500">({item.gapNumber})</span>{/if}<span
              class="mx-0.5 inline border-b-2 border-gray-800 tracking-[0.5em]"
            >{'\u00A0'.repeat(Math.round(item.gapWidthCh ?? 10))}</span></span>
          {/if}
        {/each}
      </div>

      {#if store.settings.includeWordBank && getGapOutputData().wordBank.length > 0}
        <div class="word-bank mt-6 rounded border border-gray-300 p-4">
          <h3 class="mb-2 text-sm font-semibold text-gray-700 uppercase">
            Word Bank
          </h3>
          <p class="text-sm leading-relaxed">
            {#each getGapOutputData().wordBank as word, i}
              <span class="mx-2 inline-block">{word}</span>
              {#if i < getGapOutputData().wordBank.length - 1}
                <span class="text-gray-300">|</span>
              {/if}
            {/each}
          </p>
        </div>
      {/if}

      {#if store.settings.includeAnswerSection && getGapOutputData().answers.length > 0}
        <div class="answer-section mt-6 border-t border-gray-300 pt-4">
          <h3 class="mb-3 text-sm font-semibold text-gray-700 uppercase">
            Answers
          </h3>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {#each getGapOutputData().answers as { number }}
              <div class="flex items-center gap-2 text-sm">
                <span class="w-6 text-right text-gray-500">{number}.</span>
                <span
                  class="inline-block flex-1 border-b border-gray-400"
                  style="max-width: 200px">&nbsp;</span
                >
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</section>
