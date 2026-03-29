import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  BorderStyle,
  HeadingLevel,
} from 'docx';
import type { GapOutputData, Settings } from './types';

export async function exportDocx(data: GapOutputData, settings: Settings) {
  const paragraphs: Paragraph[] = [];

  // Title
  if (settings.worksheetTitle) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: settings.worksheetTitle,
            bold: true,
            size: 36,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 240 },
      })
    );
  }

  // Main text with gaps
  let currentRuns: TextRun[] = [];

  for (const item of data.items) {
    if (item.type === 'text') {
      currentRuns.push(new TextRun({ text: item.content, size: 28 }));
    } else if (item.type === 'newline') {
      paragraphs.push(
        new Paragraph({
          children: currentRuns,
          spacing: { after: 120, line: 360 },
        })
      );
      currentRuns = [];
    } else if (item.type === 'gap') {
      const gapText = '_'.repeat(Math.round(item.gapWidthCh ?? 15));
      if (settings.numberGaps) {
        currentRuns.push(
          new TextRun({ text: `(${item.gapNumber}) `, size: 24 })
        );
      }
      currentRuns.push(new TextRun({ text: gapText, size: 28 }));
      currentRuns.push(new TextRun({ text: ' ', size: 28 }));
    }
  }

  if (currentRuns.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: currentRuns,
        spacing: { after: 120, line: 360 },
      })
    );
  }

  // Word bank
  if (settings.includeWordBank && data.wordBank.length > 0) {
    paragraphs.push(new Paragraph({ children: [], spacing: { before: 240 } }));
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'WORD BANK', bold: true, size: 24 }),
        ],
        spacing: { after: 120 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: '999999',
          },
        },
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.wordBank.join('   |   '),
            size: 26,
          }),
        ],
        spacing: { after: 120 },
      })
    );
  }

  // Answer section
  if (settings.includeAnswerSection && data.answers.length > 0) {
    paragraphs.push(new Paragraph({ children: [], spacing: { before: 360 } }));
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'ANSWERS', bold: true, size: 24 }),
        ],
        spacing: { after: 200 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: '999999',
          },
        },
      })
    );
    for (const answer of data.answers) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${answer.number}. ${'_'.repeat(50)}`,
              size: 26,
            }),
          ],
          spacing: { after: 360 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = settings.worksheetTitle
    ? `${settings.worksheetTitle}.docx`
    : 'cloze-worksheet.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
