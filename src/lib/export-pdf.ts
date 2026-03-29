import { jsPDF } from 'jspdf';
import type { GapOutputData, Settings } from './types';
import { ANSWER_UNDERSCORE_COUNT, WORD_BANK_COLUMNS } from './export-constants';

export async function exportPdf(data: GapOutputData, settings: Settings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  if (settings.worksheetTitle) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    y = addWrappedText(doc, settings.worksheetTitle, margin, y + 10, maxWidth, 8);
    y += 4;
  }

  // Main content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  const plainText = buildPlainTextForPdf(data, settings);
  const lines = plainText.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      y = checkNewPage(doc, y, pageHeight, margin);
      y = addWrappedText(doc, line, margin, y, maxWidth);
      y += 3;
    } else {
      y += 6;
    }
  }
  y += 10;

  // Word bank
  if (settings.includeWordBank && data.wordBank.length > 0) {
    y = checkNewPage(doc, y, pageHeight, margin, 30);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Word Bank', margin, y);
    y += 4;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const cols = WORD_BANK_COLUMNS;
    const rows = Math.ceil(data.wordBank.length / cols);
    const colWidth = (maxWidth - 8) / cols;
    const rowHeight = 7;
    const borderPadding = 4;
    const borderHeight = rows * rowHeight + borderPadding * 2;

    doc.roundedRect(margin, y, maxWidth, borderHeight, 2, 2);

    for (let i = 0; i < data.wordBank.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + borderPadding + col * colWidth + colWidth / 2;
      const yPos = y + borderPadding + 4 + row * rowHeight;
      doc.text(data.wordBank[i], x, yPos, { align: 'center' });
    }

    y += borderHeight + 10;
  }

  // Answer section
  if (settings.includeAnswerSection && data.answers.length > 0) {
    y = checkNewPage(doc, y, pageHeight, margin, 30);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Answers', margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    for (const answer of data.answers) {
      y = checkNewPage(doc, y, pageHeight, margin);
      doc.text(`${answer.number}. ${'_'.repeat(ANSWER_UNDERSCORE_COUNT)}`, margin, y);
      y += 10;
    }
  }

  // Output
  const filename = settings.worksheetTitle
    ? `${settings.worksheetTitle}.pdf`
    : 'cloze-worksheet.pdf';

  if (isMobile() && navigator.share) {
    try {
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: settings.worksheetTitle || 'Cloze Worksheet',
          files: [file],
        });
        return;
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
    }
  }

  doc.save(filename);
}

function buildPlainTextForPdf(data: GapOutputData, settings: Settings): string {
  let text = '';
  for (const item of data.items) {
    if (item.type === 'text') {
      text += item.content;
    } else if (item.type === 'newline') {
      text += '\n';
    } else if (item.type === 'gap') {
      if (settings.numberGaps) {
        text += `(${item.gapNumber}) `;
      }
      // 1.2x scale: PDF uses proportional fonts, so underscores are narrower than monospace `ch` units
      text += '_'.repeat(Math.round((item.gapWidthCh ?? 15) * 1.2)) + ' ';
    }
  }
  return text;
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 6
): number {
  const lines: string[] = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string, index: number) => {
    doc.text(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function checkNewPage(
  doc: jsPDF,
  currentY: number,
  pageHeight: number,
  margin: number,
  spaceNeeded = 20
): number {
  if (currentY + spaceNeeded > pageHeight - margin) {
    doc.addPage();
    return margin;
  }
  return currentY;
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
