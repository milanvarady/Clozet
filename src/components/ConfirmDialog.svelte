<script lang="ts">
  interface Props {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let {
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onconfirm,
    oncancel,
  }: Props = $props();
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onkeydown={(e) => e.key === 'Escape' && oncancel()}
  >
    <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
      <h3 class="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p class="mb-6 text-gray-600">{message}</p>
      <div class="flex justify-end gap-3">
        <button
          class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          onclick={oncancel}
        >
          {cancelText}
        </button>
        <button
          class="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          onclick={onconfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
