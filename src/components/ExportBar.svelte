<script lang="ts">
  import { exportPdf } from '../lib/export-pdf';
  import { exportDocx } from '../lib/export-docx';
  import { copyPlainText } from '../lib/export-text';
  import { getGapOutputData, store } from '../lib/state.svelte';

  let exporting = $state(false);
  let copied = $state(false);

  async function handlePdf() {
    exporting = true;
    try {
      await exportPdf(getGapOutputData(), store.settings);
    } finally {
      exporting = false;
    }
  }

  async function handleDocx() {
    exporting = true;
    try {
      await exportDocx(getGapOutputData(), store.settings);
    } finally {
      exporting = false;
    }
  }

  async function handleCopyText() {
    try {
      await copyPlainText(getGapOutputData(), store.settings);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      // clipboard may fail in insecure contexts
    }
  }

  function handlePrint() {
    window.print();
  }
</script>

<section class="no-print">
  <h2 class="mb-2 text-lg font-semibold text-gray-900">5. Export</h2>
  <div class="flex flex-wrap gap-3">
    <button
      class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light disabled:opacity-50"
      onclick={handlePdf}
      disabled={exporting || store.selections.length === 0}
    >
      Download PDF
    </button>
    <button
      class="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white disabled:opacity-50"
      onclick={handleDocx}
      disabled={exporting || store.selections.length === 0}
    >
      Download Word (.docx)
    </button>
    <button
      class="min-w-36 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      onclick={handleCopyText}
      disabled={store.selections.length === 0}
    >
      {copied ? 'Copied!' : 'Copy Raw Text'}
    </button>
    <button
      class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      onclick={handlePrint}
      disabled={store.selections.length === 0}
    >
      Print
    </button>
  </div>
</section>
