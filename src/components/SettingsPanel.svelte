<script lang="ts">
  import { store } from '../lib/state.svelte';
</script>

<section class="no-print">
  <h2 class="mb-2 text-lg font-semibold text-gray-900">3. Settings</h2>

  <div class="grid gap-4 sm:grid-cols-2">
    <div class="sm:col-span-2">
      <label class="block text-sm text-gray-700">
        Worksheet title (optional)
        <input
          type="text"
          class="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          placeholder="e.g. Unit 5 — Past Tense"
          bind:value={store.settings.worksheetTitle}
        />
      </label>
    </div>

    <label class="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        class="accent-primary h-4 w-4 rounded"
        bind:checked={store.settings.numberGaps}
      />
      Number the gaps
    </label>

    <label class="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        class="accent-primary h-4 w-4 rounded"
        bind:checked={store.settings.includeWordBank}
      />
      Include word bank
    </label>

    <label class="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        class="accent-primary h-4 w-4 rounded"
        bind:checked={store.settings.includeAnswerSection}
      />
      Separate answer section
    </label>

    <div class="sm:col-span-2">
      <label class="block text-sm text-gray-700">
        Gap length: {store.settings.fixedGapLengthCh} characters
        <input
          type="range"
          min="5"
          max="30"
          step="1"
          class="accent-primary mt-1 w-full max-w-xs"
          bind:value={store.settings.fixedGapLengthCh}
        />
      </label>
    </div>
  </div>
</section>
