<script lang="ts">
  import type { Token, SelectionType } from '../lib/types';

  interface Props {
    token: Token;
    isSelected: boolean;
    selectionType: SelectionType | null;
    rangePosition: 'start' | 'end' | 'middle' | 'single' | null;
    isRangePending: boolean;
    onclick: (tokenId: number, shiftKey: boolean) => void;
  }

  let {
    token,
    isSelected,
    selectionType,
    rangePosition,
    isRangePending,
    onclick,
  }: Props = $props();

  function handleClick(e: MouseEvent) {
    onclick(token.id, e.shiftKey);
  }

  const roundingMap: Record<string, string> = {
    start: 'rounded-l-md',
    end: 'rounded-r-md',
    middle: 'rounded-none',
    single: 'rounded-md',
  };

  function classes(): string {
    const base = 'inline cursor-pointer border-none px-1 py-0.5 font-mono text-sm transition-colors select-none';

    if (isRangePending) {
      return `${base} bg-blue-100 text-blue-800 rounded-md ring-2 ring-blue-400 ring-offset-1`;
    }

    if (!isSelected) {
      return `${base} bg-transparent text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded`;
    }

    if (selectionType === 'range') {
      return `${base} bg-blue-200 text-blue-900 font-medium ${roundingMap[rangePosition ?? 'single']}`;
    }

    return `${base} bg-amber-200 text-amber-900 font-medium rounded-md`;
  }
</script>

<button
  type="button"
  class={classes()}
  onclick={handleClick}
>
  {token.text}
</button>
