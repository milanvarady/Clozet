# Clozet

A free, client-side cloze test (fill-the-gaps) worksheet maker for language teachers. Paste text, select words as gaps, and export a printable worksheet. No sign-up, no server — everything runs in your browser.

**Try it at** [milanvarady.github.io/Clozet](https://milanvarady.github.io/Clozet/)

## Features

- Click words to create gaps, or select entire phrases with range selection (Shift+click or tap-based range mode on mobile)
- Numbered gaps with customizable gap length
- Shuffled word bank
- Separate answer section for longer responses
- Keeps or collapses original formatting (useful when pasting from PDFs or websites)
- Worksheet title

## Export

- PDF (with mobile share support)
- Word (.docx)
- Copy as plain text
- Print directly from the browser

## Tech stack

Svelte 5, TypeScript, Tailwind CSS v4, Vite. PDF export via jsPDF, Word export via docx.

## Development

```bash
npm install
npm run dev            # Start dev server
npm run build          # Production build to dist/
```

Deployed to GitHub Pages via GitHub Actions on push to `main`.
