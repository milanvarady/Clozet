import { parseText } from './parser';
import type { GapSelection, GapOutputData, GapOutputItem, Settings, Token } from './types';

export const defaultSettings: Settings = {
  keepFormatting: false,
  numberGaps: true,
  includeWordBank: true,
  includeAnswerSection: false,
  fixedGapLengthCh: 15,
  gapLengthConstant: 1.5,
  worksheetTitle: '',
};

// All mutable state lives in a single object
export const store = $state({
  sourceTextDraft: '',
  sourceTextCommitted: '',
  settings: { ...defaultSettings } as Settings,
  selections: [] as GapSelection[],
  lastSelectedTokenId: null as number | null,
  mobileRangeMode: false,
  mobileRangeStart: null as number | null,
});

// Derived state as getters (Svelte 5 doesn't allow exporting $derived from modules)
const _tokens = $derived<Token[]>(
  parseText(store.sourceTextCommitted, store.settings.keepFormatting)
);
export function getTokens(): Token[] {
  return _tokens;
}

const _selectedTokenIdSet = $derived<Set<number>>(
  new Set(store.selections.flatMap((s) => s.tokenIds))
);
export function getSelectedTokenIdSet(): Set<number> {
  return _selectedTokenIdSet;
}

const _tokenToSelectionMap = $derived<Map<number, GapSelection>>(
  new Map(store.selections.flatMap((s) => s.tokenIds.map((id) => [id, s] as const)))
);
export function getTokenToSelectionMap(): Map<number, GapSelection> {
  return _tokenToSelectionMap;
}

const _gapOutputData = $derived<GapOutputData>(
  buildGapOutput(_tokens, store.selections, store.settings)
);
export function getGapOutputData(): GapOutputData {
  return _gapOutputData;
}

export function commitSourceText() {
  store.sourceTextCommitted = store.sourceTextDraft;
  store.selections = [];
  store.lastSelectedTokenId = null;
  store.mobileRangeMode = false;
  store.mobileRangeStart = null;
}

export function clearSelections() {
  store.selections = [];
  store.lastSelectedTokenId = null;
  store.mobileRangeMode = false;
  store.mobileRangeStart = null;
}

export function handleWordClick(tokenId: number, shiftKey: boolean) {
  const tokenToSelMap = _tokenToSelectionMap;

  // 1. If in range mode, handle separately (don't mix with normal click logic)
  if (store.mobileRangeMode) {
    if (store.mobileRangeStart === null) {
      // First tap: set start word
      store.mobileRangeStart = tokenId;
      return;
    }

    // Second tap: create range from start to this word
    const start = Math.min(store.mobileRangeStart, tokenId);
    const end = Math.max(store.mobileRangeStart, tokenId);
    const rangeIds = _tokens
      .filter((t) => t.isWord && t.id >= start && t.id <= end)
      .map((t) => t.id);

    store.selections = store.selections.filter(
      (s) => !s.tokenIds.some((id) => rangeIds.includes(id))
    );
    store.selections = [...store.selections, { tokenIds: rangeIds, type: 'range' }];
    store.mobileRangeMode = false;
    store.mobileRangeStart = null;
    store.lastSelectedTokenId = tokenId;
    return;
  }

  // 2. Already selected? Deselect entire GapSelection
  const existing = tokenToSelMap.get(tokenId);
  if (existing) {
    store.selections = store.selections.filter((s) => s !== existing);
    store.lastSelectedTokenId = null;
    return;
  }

  // 3. Shift+click range (desktop shortcut)
  if (shiftKey && store.lastSelectedTokenId !== null) {
    const start = Math.min(store.lastSelectedTokenId, tokenId);
    const end = Math.max(store.lastSelectedTokenId, tokenId);
    const rangeIds = _tokens
      .filter((t) => t.isWord && t.id >= start && t.id <= end)
      .map((t) => t.id);

    store.selections = store.selections.filter(
      (s) => !s.tokenIds.some((id) => rangeIds.includes(id))
    );
    store.selections = [...store.selections, { tokenIds: rangeIds, type: 'range' }];
    store.lastSelectedTokenId = tokenId;
    return;
  }

  // 4. Normal individual selection
  store.selections = [...store.selections, { tokenIds: [tokenId], type: 'individual' }];
  store.lastSelectedTokenId = tokenId;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildGapOutput(
  tokens: Token[],
  selections: GapSelection[],
  settings: Settings
): GapOutputData {
  const items: GapOutputItem[] = [];
  const answers: { number: number; answer: string }[] = [];
  const wordBankItems: string[] = [];

  const selectedIds = new Set(selections.flatMap((s) => s.tokenIds));
  const tokenSelMap = new Map(
    selections.flatMap((s) => s.tokenIds.map((id) => [id, s] as const))
  );

  const renderedSelections = new Set<GapSelection>();

  const sortedSelections = [...selections].sort(
    (a, b) => Math.min(...a.tokenIds) - Math.min(...b.tokenIds)
  );
  const selectionNumberMap = new Map<GapSelection, number>();
  sortedSelections.forEach((s, i) => selectionNumberMap.set(s, i + 1));

  let pendingText = '';

  for (const token of tokens) {
    if (!selectedIds.has(token.id)) {
      pendingText += token.text + token.trailingSpace;
      continue;
    }

    const sel = tokenSelMap.get(token.id)!;
    if (renderedSelections.has(sel)) {
      continue;
    }

    if (pendingText) {
      const parts = pendingText.split('\n');
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          items.push({ type: 'text', content: parts[i] });
        }
        if (i < parts.length - 1) {
          items.push({ type: 'newline', content: '\n' });
        }
      }
      pendingText = '';
    }

    renderedSelections.add(sel);
    const gapNumber = selectionNumberMap.get(sel)!;

    const answerTokens = tokens.filter((t) => sel.tokenIds.includes(t.id));
    const answer = answerTokens.map((t) => t.text).join(' ');

    let gapWidthCh: number;
    if (sel.type === 'range') {
      const totalChars = answerTokens.reduce(
        (sum, t) => sum + t.text.length,
        0
      );
      gapWidthCh = Math.max(
        settings.fixedGapLengthCh,
        totalChars * settings.gapLengthConstant
      );
    } else {
      gapWidthCh = settings.fixedGapLengthCh;
    }

    items.push({
      type: 'gap',
      content: '',
      gapNumber,
      gapWidthCh,
      answer,
    });

    const lastTokenInSel = answerTokens[answerTokens.length - 1];
    if (lastTokenInSel.trailingSpace) {
      pendingText += lastTokenInSel.trailingSpace;
    }

    answers.push({ number: gapNumber, answer });
    wordBankItems.push(answer);
  }

  if (pendingText) {
    const parts = pendingText.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (parts[i]) {
        items.push({ type: 'text', content: parts[i] });
      }
      if (i < parts.length - 1) {
        items.push({ type: 'newline', content: '\n' });
      }
    }
  }

  return {
    items,
    answers: answers.sort((a, b) => a.number - b.number),
    wordBank: shuffleArray(wordBankItems),
  };
}
