<script lang="ts">
  import SourceTextInput from './components/SourceTextInput.svelte';
  import GapSelectionView from './components/GapSelectionView.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import OutputPreview from './components/OutputPreview.svelte';
  import ExportBar from './components/ExportBar.svelte';
</script>

<div class="min-h-screen bg-gray-50 print:bg-white">
  <header class="no-print border-b border-gray-200 bg-white">
    <div class="mx-auto max-w-3xl px-4 py-4">
      <h1 class="text-2xl font-bold text-gray-900">Clozet</h1>
      <p class="text-sm text-gray-500">
        Create cloze test worksheets for your students
      </p>
    </div>
  </header>

  <main class="mx-auto max-w-3xl space-y-8 px-4 py-6">
    <SourceTextInput />
    <GapSelectionView />
    <SettingsPanel />
    <OutputPreview />
    <ExportBar />
  </main>
</div>
