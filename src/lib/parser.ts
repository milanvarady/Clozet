import type { Token } from './types';

export function parseText(text: string, keepFormatting: boolean): Token[] {
  if (!text.trim()) return [];

  let processed = text;
  if (!keepFormatting) {
    processed = processed.replace(/\n{2,}/g, '\n');
    processed = processed.replace(/ {2,}/g, ' ');
    processed = processed
      .split('\n')
      .map((line) => line.trim())
      .join('\n');
  }

  const tokens: Token[] = [];
  // Match non-whitespace chunks followed by optional whitespace
  const regex = /(\S+)(\s*)/g;
  let match: RegExpExecArray | null;
  let id = 0;

  while ((match = regex.exec(processed)) !== null) {
    const chunk = match[1];
    const trailingSpace = match[2];

    // Split chunk into word parts and punctuation parts
    // e.g. "hello," → ["hello", ","]
    // e.g. "(hello)" → ["(", "hello", ")"]
    // e.g. "..." → ["..."]
    const parts = chunk.match(/[^\p{P}\p{S}]+|[\p{P}\p{S}]+/gu) || [chunk];

    for (let i = 0; i < parts.length; i++) {
      const isLast = i === parts.length - 1;
      tokens.push({
        id: id++,
        text: parts[i],
        isWord: true,
        trailingSpace: isLast ? trailingSpace : '',
      });
    }
  }

  return tokens;
}
