document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const keepFormatting = document.getElementById('keepFormatting');
    const wordSelection = document.getElementById('wordSelection');
    const numberGaps = document.getElementById('numberGaps');
    const includeWordBank = document.getElementById('includeWordBank');
    const separateAnswers = document.getElementById('separateAnswers');
    const gapLength = document.getElementById('gapLength');
    const gapLengthValue = document.getElementById('gapLengthValue');
    const worksheetTitle = document.getElementById('worksheetTitle');
    const outputTitle = document.getElementById('outputTitle');
    const outputText = document.getElementById('outputText');
    const wordBank = document.getElementById('wordBank');
    const answerSection = document.getElementById('answerSection');

    let words = [];
    let gappedWords = [];

    inputText.addEventListener('input', updateWordSelection);
    worksheetTitle.addEventListener('input', updateOutput);

    keepFormatting.addEventListener('change', updateWordSelection);

    function updateWordSelection() {
        const text = inputText.value;
        gappedWords = []; // Clear gaps on text change

        if (text.trim() === '') {
            wordSelection.innerHTML = '<p>Paste text first</p>';
            words = [];
            updateOutput();
            return;
        }

        if (keepFormatting.checked) {
            // Split while keeping delimiters (whitespace, newlines)
            words = text.split(/(\s+|[.!?,])/);
        } else {
            // Treat as a single line, but still keep spaces and punctuation to preserve them
            words = text.replace(/\n/g, ' ').split(/(\s+|[.!?,])/);
        }

        wordSelection.innerHTML = '';
        words.forEach((word, index) => {
            // Only create buttons for actual words, not whitespace
            if (word.includes('\n')) {
                const lineBreak = document.createElement('div');
                lineBreak.classList.add('word-selection-line-break');
                wordSelection.appendChild(lineBreak);
            } else if (word && word.trim()) {
                const button = document.createElement('button');
                button.textContent = word;
                button.dataset.index = index;
                button.addEventListener('click', () => {
                    toggleGap(word, index, button);
                });
                wordSelection.appendChild(button);
            }
        });
        updateOutput();
    }

    function toggleGap(word, index, button) {
        const gappedWordIndex = gappedWords.findIndex(g => g.index === index);
        if (gappedWordIndex > -1) {
            gappedWords.splice(gappedWordIndex, 1);
            button.classList.remove('secondary');
        } else {
            gappedWords.push({ word, index });
            button.classList.add('secondary');
        }
        updateOutput();
    }

    function updateOutput() {
        const title = worksheetTitle.value.trim();
        if (title) {
            outputTitle.textContent = title;
        } else {
            outputTitle.textContent = '';
        }

        if (inputText.value.trim() === '') {
            outputText.innerHTML = '<p>The generated text will appear here.</p>';
            wordBank.innerHTML = '';
            answerSection.innerHTML = '';
            downloadPdf.disabled = true;
            printButton.disabled = true;
            return;
        }

        downloadPdf.disabled = false;
        printButton.disabled = false;

        let outputContent = '';
        let gapCounter = 0;

        words.forEach((word, index) => {
            if (word.includes('\n')) {
                outputContent += word; // Add the newline character itself
                return;
            }

            const gappedWord = gappedWords.find(g => g.index === index);

            if (gappedWord) {
                gapCounter++;
                let gap = '_'.repeat(gapLength.value);
                if (numberGaps.checked) {
                    gap = `(${gapCounter})\u00A0${gap}`;
                }
                outputContent += gap;
            } else {
                outputContent += word;
            }
        });

        outputText.textContent = outputContent;

        if (includeWordBank.checked && gappedWords.length > 0) {
            const shuffledWords = [...gappedWords].sort(() => Math.random() - 0.5);
            wordBank.innerHTML = '<h3>Word Bank</h3><div class="word-bank-words">' + shuffledWords.map(g => `<span class="word-bank-word">${g.word}</span>`).join(' / ') + '</div>';
        } else {
            wordBank.innerHTML = '';
        }

        if (separateAnswers.checked && gappedWords.length > 0) {
            let answers = '<h3>Answer Section</h3>';
            for (let i = 0; i < gappedWords.length; i++) {
                answers += `<p>${numberGaps.checked ? `(${i + 1})` : ''} __________________</p>`;
            }
            answerSection.innerHTML = answers;
        } else {
            answerSection.innerHTML = '';
        }
    }

    const downloadPdf = document.getElementById('downloadPdf');
    const printButton = document.getElementById('printButton');

    downloadPdf.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;

        // Create new PDF document
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);

        let yPosition = margin;

        // Helper function to add text with word wrapping and custom line spacing
        function addWrappedText(text, x, y, maxWidth, lineHeight = 6) {
            const lines = doc.splitTextToSize(text, maxWidth);
            const lineSpacing = 6; // Increased from default 6 for better readability

            lines.forEach((line, index) => {
                doc.text(line, x, y + (index * lineSpacing));
            });

            return y + (lines.length * lineSpacing);
        }

        // Helper function to check if we need a new page
        function checkNewPage(currentY, spaceNeeded = 20) {
            if (currentY + spaceNeeded > pageHeight - margin) {
                doc.addPage();
                return margin;
            }
            return currentY;
        }

        try {
            // Add title if exists
            const title = worksheetTitle.value.trim();
            if (title) {
                doc.setFontSize(16);
                doc.setFont(undefined, 'bold');
                yPosition = addWrappedText(title, margin, yPosition + 10, maxWidth, 8);
                yPosition += 4;
            }

            // Set normal font for body text
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');

            // Get the output text content
            const outputTextContent = outputText.textContent;

            if (outputTextContent && outputTextContent.trim()) {
                // Split text into lines while preserving the structure
                const lines = outputTextContent.split('\n');

                for (let line of lines) {
                    if (line.trim()) {
                        yPosition = checkNewPage(yPosition);
                        yPosition = addWrappedText(line, margin, yPosition, maxWidth);
                        yPosition += 3; // Small gap between lines
                    } else {
                        yPosition += 6; // Larger gap for empty lines
                    }
                }
            }

            yPosition += 10; // Space before word bank

            // Add Word Bank if it exists
            const wordBankContent = wordBank.innerHTML;
            if (wordBankContent && wordBankContent.trim()) {
                yPosition = checkNewPage(yPosition, 30);

                // Word Bank title
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text('Word Bank', margin, yPosition);
                yPosition += 4;

                // Get words from word bank
                const wordBankWords = wordBank.querySelector('.word-bank-words');
                if (wordBankWords) {
                    const words = Array.from(wordBankWords.children)
                        .map(span => span.textContent.trim())
                        .filter(word => word);

                    if (words.length > 0) {
                        const wordText = words.join(' / ');

                        // Set font for the word bank
                        doc.setFontSize(12);
                        doc.setFont(undefined, 'normal');
                        const textLines = doc.splitTextToSize(wordText, maxWidth - 10);

                        const lineSpacing = 6; // The desired space between the baseline of each line in mm
                        const borderPadding = 4; // A balanced padding for inside the box
                        const fontHeightApproximation = 4; // An approximation for the height of 12pt characters in mm

                        // 1. Correctly calculate the actual height of the text block
                        const textBlockHeight = ((textLines.length - 1) * lineSpacing) + fontHeightApproximation;

                        // 2. Calculate the border height based on the correct text height and padding
                        const borderHeight = textBlockHeight + (borderPadding * 2);

                        // Draw the correctly sized border
                        doc.roundedRect(margin, yPosition, maxWidth, borderHeight, 2, 2);

                        // Define where the text should start inside the border
                        const textStartX = margin + borderPadding;
                        const textStartY = yPosition + borderPadding + fontHeightApproximation;

                        // 3. Render each line manually to ensure our 'lineSpacing' is used
                        textLines.forEach((line, index) => {
                            doc.text(line, textStartX, textStartY + (index * lineSpacing));
                        });

                        // Update the yPosition for the next element on the page
                        yPosition += borderHeight + 10;
                    }
                }
            }

            // Add Answer Section if it exists
            const answerSectionContent = answerSection.innerHTML;
            if (answerSectionContent && answerSectionContent.trim()) {
                yPosition = checkNewPage(yPosition, 30);

                // Answer Section title
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text('Answer Section', margin, yPosition);
                yPosition += 8;

                // Get answer lines
                const answerPs = answerSection.querySelectorAll('p');
                doc.setFontSize(12);
                doc.setFont(undefined, 'normal');

                answerPs.forEach(p => {
                    yPosition = checkNewPage(yPosition);
                    const answerText = p.textContent.trim();
                    if (answerText) {
                        doc.text(answerText, margin, yPosition);
                        yPosition += 10;
                    }
                });
            }

            // Save the PDF
            const filename = title ? `${title}.pdf` : 'cloze-test.pdf';
            doc.save(filename);

        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Error: ' + error.message);
        }
    });

    [numberGaps, includeWordBank, separateAnswers, gapLength].forEach(el => {
        el.addEventListener('change', updateOutput);
    });

    gapLength.addEventListener('input', () => {
        gapLengthValue.textContent = gapLength.value;
        updateOutput();
    });

    // Initial update to reflect default settings
    updateWordSelection();
    gapLengthValue.textContent = gapLength.value;
});