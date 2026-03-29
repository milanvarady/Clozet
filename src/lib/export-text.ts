import type { GapOutputData, Settings } from './types';
import { ANSWER_UNDERSCORE_COUNT, WORD_BANK_SEPARATOR } from './export-constants';

export function buildPlainText(data: GapOutputData, settings: Settings): string {
  let text = '';

  // Title
  if (settings.worksheetTitle) {
    text += settings.worksheetTitle + '\n\n';
  }

  // Main content
  for (const item of data.items) {
    if (item.type === 'text') {
      text += item.content;
    } else if (item.type === 'newline') {
      text += '\n';
    } else if (item.type === 'gap') {
      if (settings.numberGaps) {
        text += `(${item.gapNumber}) `;
      }
      text += '_'.repeat(Math.round(item.gapWidthCh ?? 15)) + ' ';
    }
  }

  // Word bank
  if (settings.includeWordBank && data.wordBank.length > 0) {
    text += '\n\nWORD BANK\n';
    text += data.wordBank.join(WORD_BANK_SEPARATOR);
  }

  // Answer section
  if (settings.includeAnswerSection && data.answers.length > 0) {
    text += '\n\nANSWERS\n';
    for (const answer of data.answers) {
      text += `${answer.number}. ${'_'.repeat(ANSWER_UNDERSCORE_COUNT)}\n`;
    }
  }

  return text;
}

export async function copyPlainText(data: GapOutputData, settings: Settings): Promise<void> {
  const text = buildPlainText(data, settings);
  await navigator.clipboard.writeText(text);
}
