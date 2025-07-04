export class PDFGenerator {
    async generate(title, outputText, wordBankElement, answerSectionElement) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Add title
        if (title) {
            yPosition = this.addTitle(doc, title, margin, yPosition, maxWidth);
        }

        // Add main content
        yPosition = this.addMainContent(doc, outputText, margin, yPosition, maxWidth, pageHeight);

        // Add Word Bank
        yPosition = this.addWordBank(doc, wordBankElement, margin, yPosition, maxWidth, pageHeight);

        // Add Answer Section
        this.addAnswerSection(doc, answerSectionElement, margin, yPosition, pageHeight);

        // Handle download or sharing
        await this.handleOutput(doc, title);
    }

    addTitle(doc, title, margin, yPosition, maxWidth) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        yPosition = this.addWrappedText(doc, title, margin, yPosition + 10, maxWidth, 8);
        return yPosition + 4;
    }

    addMainContent(doc, outputText, margin, yPosition, maxWidth, pageHeight) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        if (outputText && outputText.trim()) {
            const lines = outputText.split('\n');
            for (let line of lines) {
                if (line.trim()) {
                    yPosition = this.checkNewPage(doc, yPosition, pageHeight, margin);
                    yPosition = this.addWrappedText(doc, line, margin, yPosition, maxWidth);
                    yPosition += 3;
                } else {
                    yPosition += 6;
                }
            }
        }

        return yPosition + 10;
    }

    addWordBank(doc, wordBankElement, margin, yPosition, maxWidth, pageHeight) {
        const wordBankContent = wordBankElement.innerHTML;
        if (!wordBankContent || !wordBankContent.trim()) return yPosition;

        yPosition = this.checkNewPage(doc, yPosition, pageHeight, margin, 30);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Word Bank', margin, yPosition);
        yPosition += 4;

        const wordBankWords = wordBankElement.querySelector('.word-bank-words');
        if (wordBankWords) {
            const words = Array.from(wordBankWords.children)
                .map(span => span.textContent.trim())
                .filter(word => word);

            if (words.length > 0) {
                yPosition = this.addWordBankBox(doc, words, margin, yPosition, maxWidth);
            }
        }

        return yPosition;
    }

    addWordBankBox(doc, words, margin, yPosition, maxWidth) {
        const wordText = words.join(' / ');
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        const textLines = doc.splitTextToSize(wordText, maxWidth - 10);
        const lineSpacing = 6;
        const borderPadding = 4;
        const fontHeightApproximation = 4;
        const textBlockHeight = ((textLines.length - 1) * lineSpacing) + fontHeightApproximation;
        const borderHeight = textBlockHeight + (borderPadding * 2);

        doc.roundedRect(margin, yPosition, maxWidth, borderHeight, 2, 2);

        const textStartX = margin + borderPadding;
        const textStartY = yPosition + borderPadding + fontHeightApproximation;

        textLines.forEach((line, index) => {
            doc.text(line, textStartX, textStartY + (index * lineSpacing));
        });

        return yPosition + borderHeight + 10;
    }

    addAnswerSection(doc, answerSectionElement, margin, yPosition, pageHeight) {
        const answerSectionContent = answerSectionElement.innerHTML;
        if (!answerSectionContent || !answerSectionContent.trim()) return yPosition;

        yPosition = this.checkNewPage(doc, yPosition, pageHeight, margin, 30);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Answer Section', margin, yPosition);
        yPosition += 8;

        const answerPs = answerSectionElement.querySelectorAll('p');
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        answerPs.forEach(p => {
            yPosition = this.checkNewPage(doc, yPosition, pageHeight, margin);
            const answerText = p.textContent.trim();
            if (answerText) {
                doc.text(answerText, margin, yPosition);
                yPosition += 10;
            }
        });

        return yPosition;
    }

    addWrappedText(doc, text, x, y, maxWidth, lineHeight = 6) {
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineSpacing = lineHeight;

        lines.forEach((line, index) => {
            doc.text(line, x, y + (index * lineSpacing));
        });

        return y + (lines.length * lineSpacing);
    }

    checkNewPage(doc, currentY, pageHeight, margin, spaceNeeded = 20) {
        if (currentY + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            return margin;
        }
        return currentY;
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
    }

    async handleOutput(doc, title) {
        const filename = title ? `${title}.pdf` : 'cloze-test.pdf';

        // Check if we should use Web Share API (mobile devices only)
        if (this.isMobileDevice() && navigator.share) {
            try {
                // Create blob from PDF
                const pdfOutput = doc.output('blob');
                const pdfBlob = new Blob([pdfOutput], { type: 'application/pdf' });
                const file = new File([pdfBlob], filename, { type: 'application/pdf' });

                // Check if we can share files
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: title || 'Cloze Test',
                        text: 'Created with Clozet',
                        files: [file]
                    });
                    return; // Exit early if sharing succeeded
                } else {
                    // Fallback to sharing without file if file sharing isn't supported
                    const pdfDataUrl = doc.output('datauristring');
                    await navigator.share({
                        title: title || 'Cloze Test',
                        text: 'Created with Clozet',
                        url: pdfDataUrl
                    });
                    return;
                }
            } catch (shareError) {
                console.log('Share cancelled or failed:', shareError);
                // Fall through to download
            }
        }

        // Fallback to download for desktop or if sharing failed
        doc.save(filename);
    }
}