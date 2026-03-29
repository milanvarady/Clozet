import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  BorderStyle,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
} from 'docx';
import type { GapOutputData, Settings } from './types';
import { ANSWER_UNDERSCORE_COUNT, WORD_BANK_COLUMNS } from './export-constants';

export async function exportDocx(data: GapOutputData, settings: Settings) {
  const paragraphs: (Paragraph | Table)[] = [];

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
    const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const cellBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
    const cols = WORD_BANK_COLUMNS;
    const rows: TableRow[] = [];
    for (let r = 0; r < Math.ceil(data.wordBank.length / cols); r++) {
      const cells: TableCell[] = [];
      for (let c = 0; c < cols; c++) {
        const word = data.wordBank[r * cols + c] ?? '';
        cells.push(
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: word, size: 24 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            borders: cellBorders,
            width: { size: 100 / cols, type: WidthType.PERCENTAGE },
          })
        );
      }
      rows.push(new TableRow({ children: cells }));
    }
    paragraphs.push(new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } }));
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
              text: `${answer.number}. ${'_'.repeat(ANSWER_UNDERSCORE_COUNT)}`,
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
