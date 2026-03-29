# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Clozet?

A client-side cloze test (fill-the-gaps) worksheet maker for language teachers. Teachers paste text, select words or word ranges as gaps, configure settings, and export a printable worksheet. 100% client-side, hosted on GitHub Pages.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run dev -- --host  # Dev server accessible on local network (for mobile testing)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

## Tech Stack

- **Svelte 5** (runes: `$state`, `$derived`) + **TypeScript**
- **Vite** (with `@tailwindcss/vite` plugin)
- **Tailwind CSS v4** — CSS-first config via `@import "tailwindcss"` and `@theme` block in `src/app.css`
- **jsPDF** — PDF export (programmatic, not html2canvas)
- **docx** — Word document export

## Architecture

Single-page app with a vertical step-by-step workflow. All sections are always visible (no progressive disclosure). The text appears in three forms:
1. **Source** — editable textarea (locked when gaps are selected)
2. **Gap selection** — clickable word tokens, no text editing
3. **Output preview** — live worksheet preview, always shows text (plain when no gaps, with underlines when gaps selected)

### State Management

All reactive state lives in `src/lib/state.svelte.ts` as a single `$state` object (`store`). Derived values (tokens, selection maps, gap output data) use `$derived` but are exposed via getter functions because Svelte 5 doesn't allow exporting `$derived` from `.svelte.ts` modules.

Key data flow:
- `store.sourceText` — updated on every keystroke
- `_tokens` (derived) → `parseText()` splits source text into `Token[]`
- `store.selections: GapSelection[]` — each selection has `tokenIds[]` and `type` ('individual' | 'range')
- `_gapOutputData` (derived) → walks tokens + selections to build the preview output

### Key Svelte 5 Patterns

- State file must use `.svelte.ts` extension for runes; pure logic files (parser, exports) use plain `.ts`
- Exported `$state` must be an object (not reassignable primitive) — that's why `store` is one big object
- Exported `$derived` is not allowed — use getter functions wrapping private `$derived` values

### Parser

`src/lib/parser.ts` splits text into tokens using a Unicode-aware regex (`/[^\p{P}\p{S}]+|[\p{P}\p{S}]+/gu`) that separates punctuation from words. So `"hello,"` becomes two tokens: `"hello"` (isWord: true) and `","` (isWord: false). Only word tokens are selectable as gaps. The `keepFormatting` flag controls whether multiple newlines/spaces are collapsed.

### Source Text Locking

When gaps are selected (`store.selections.length > 0`):
- The textarea is `disabled` with greyed-out styling
- The "Keep original formatting" checkbox is also disabled
- A "Clear gaps & edit" button appears to remove all selections and re-enable editing

There is no confirmation dialog — the textarea is simply locked.

### Gap Selection

- **Individual click** — toggles a single word as a gap (amber background)
- **Shift+click (desktop)** — creates a range from last selected to clicked word (blue background, connected strip)
- **Range select mode (mobile/desktop)** — toggle button, then two taps: start word → end word. Fully independent from normal clicks (doesn't reuse `lastSelectedTokenId`). Deactivating resets pending start.
- **Deselect** — clicking any word in a selection removes the entire `GapSelection` (including full ranges)
- Range tokens get connected visual styling: only start/end get rounded corners

### Components

- `SourceTextInput` — textarea + formatting toggle + "Clear gaps & edit" button (textarea locks when gaps exist)
- `GapSelectionView` — renders tokens as clickable buttons; handles individual click, shift+click range, and mobile range toggle
- `WordToken` — individual clickable word span with selection styling (amber for individual, blue for range, ring for pending range start)
- `SettingsPanel` — worksheet title, numbered gaps, word bank, answer section, gap length slider (5-30)
- `OutputPreview` — live worksheet preview; always shows text, renders title when set, gap number + underline wrapped in `whitespace-nowrap` to prevent splitting across lines
- `ExportBar` — PDF/DOCX/Copy Raw Text/Print buttons
- `TrailingSpace` — shared snippet for rendering trailing whitespace/newlines after tokens

### Export

- **PDF**: `jsPDF` builds document programmatically from `GapOutputData` (not from DOM). Supports mobile share via Web Share API. Uses worksheet title as filename. Gap width scaled 1.2x to compensate for proportional font vs monospace `ch` units.
- **DOCX**: `docx` package builds document programmatically. 14pt text, 1.5x line spacing, spacious answer section. Uses worksheet title as filename.
- **Copy Raw Text**: Builds plain text from `GapOutputData`, copies to clipboard via `navigator.clipboard.writeText()`
- **Print**: `window.print()` with `@media print` stylesheet hiding `.no-print` elements
- Shared constants (answer underscore count, word bank separator) in `src/lib/export-constants.ts`

### Tailwind v4 Notes

- Config via `@theme` block in `src/app.css`, not a JS config file
- Uses `@import "tailwindcss"` instead of `@tailwind` directives
- Custom colors defined: `--color-gap-individual` (amber), `--color-gap-range` (blue), `--color-primary`, `--color-primary-light`

## GitHub Pages Deployment

`vite.config.ts` sets `base: '/clozet/'` for correct asset paths on GitHub Pages.
