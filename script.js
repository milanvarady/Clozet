document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
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
    const downloadPdf = document.getElementById('downloadPdf');
    const printButton = document.getElementById('printButton');

    // State
    let words = [];
    let gappedWords = [];

    // Event listeners
    inputText.addEventListener('input', updateWordSelection);
    worksheetTitle.addEventListener('input', updateOutput);
    keepFormatting.addEventListener('change', updateWordSelection);
    downloadPdf.addEventListener('click', generatePDF);

    [numberGaps, includeWordBank, separateAnswers, gapLength].forEach(el => {
        el.addEventListener('change', updateOutput);
    });

    gapLength.addEventListener('input', () => {
        gapLengthValue.textContent = gapLength.value;
        updateOutput();
    });

    function updateWordSelection() {
        const text = inputText.value;
        gappedWords = []; // Clear gaps on text change

        if (text.trim() === '') {
            wordSelection.innerHTML = '<p>Paste text first</p>';
            words = [];
            updateOutput();
            return;
        }

        // Split text while preserving delimiters
        if (keepFormatting.checked) {
            words = text.split(/(\s+|[.!?,])/);
        } else {
            words = text.replace(/\n/g, ' ').split(/(\s+|[.!?,])/);
        }

        renderWordSelection();
        updateOutput();
    }

    function renderWordSelection() {
        const fragment = document.createDocumentFragment();

        words.forEach((word, index) => {
            if (word.includes('\n')) {
                const lineBreak = document.createElement('div');
                lineBreak.classList.add('word-selection-line-break');
                fragment.appendChild(lineBreak);
            } else if (word && word.trim()) {
                const button = document.createElement('button');
                button.textContent = word;
                button.dataset.index = index;
                button.addEventListener('click', () => toggleGap(word, index, button));
                fragment.appendChild(button);
            }
        });

        wordSelection.innerHTML = '';
        wordSelection.appendChild(fragment);
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
        updateTitle();

        if (inputText.value.trim() === '') {
            showEmptyState();
            return;
        }

        enableButtons();
        generateOutputText();
        generateWordBank();
        generateAnswerSection();
    }

    function updateTitle() {
        outputTitle.textContent = worksheetTitle.value.trim();
    }

    function showEmptyState() {
        outputText.innerHTML = '<p>The generated text will appear here.</p>';
        wordBank.innerHTML = '';
        answerSection.innerHTML = '';
        downloadPdf.disabled = true;
        printButton.disabled = true;
    }

    function enableButtons() {
        downloadPdf.disabled = false;
        printButton.disabled = false;
    }

    function generateOutputText() {
        let outputContent = '';
        let gapCounter = 0;

        words.forEach((word, index) => {
            if (word.includes('\n')) {
                outputContent += word;
                return;
            }

            const gappedWord = gappedWords.find(g => g.index === index);
            if (gappedWord) {
                gapCounter++;
                let gap = '_'.repeat(parseInt(gapLength.value));
                if (numberGaps.checked) {
                    gap = `(${gapCounter})\u00A0${gap}`;
                }
                outputContent += gap;
            } else {
                outputContent += word;
            }
        });

        outputText.textContent = outputContent;
    }

    function generateWordBank() {
        if (!includeWordBank.checked || gappedWords.length === 0) {
            wordBank.innerHTML = '';
            return;
        }

        const shuffledWords = [...gappedWords].sort(() => Math.random() - 0.5);
        const wordBankHtml = shuffledWords.map(g => `<span class="word-bank-word">${g.word}</span>`).join(' / ');
        wordBank.innerHTML = `<h3>Word Bank</h3><div class="word-bank-words">${wordBankHtml}</div>`;
    }

    function generateAnswerSection() {
        if (!separateAnswers.checked || gappedWords.length === 0) {
            answerSection.innerHTML = '';
            return;
        }

        let answers = '<h3>Answer Section</h3>';
        for (let i = 0; i < gappedWords.length; i++) {
            const prefix = numberGaps.checked ? `(${i + 1})` : '';
            answers += `<p>${prefix} __________________</p>`;
        }
        answerSection.innerHTML = answers;
    }

    async function generatePDF() {
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

        function addWrappedText(text, x, y, maxWidth, lineHeight = 6) {
            const lines = doc.splitTextToSize(text, maxWidth);
            const lineSpacing = 6;

            lines.forEach((line, index) => {
                doc.text(line, x, y + (index * lineSpacing));
            });

            return y + (lines.length * lineSpacing);
        }

        function checkNewPage(currentY, spaceNeeded = 20) {
            if (currentY + spaceNeeded > pageHeight - margin) {
                doc.addPage();
                return margin;
            }
            return currentY;
        }

        // Function to detect if we're on a mobile device
        function isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
        }

        try {
            // Add title
            const title = worksheetTitle.value.trim();
            if (title) {
                doc.setFontSize(16);
                doc.setFont(undefined, 'bold');
                yPosition = addWrappedText(title, margin, yPosition + 10, maxWidth, 8);
                yPosition += 4;
            }

            // Add main content
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');

            const outputTextContent = outputText.textContent;
            if (outputTextContent && outputTextContent.trim()) {
                const lines = outputTextContent.split('\n');
                for (let line of lines) {
                    if (line.trim()) {
                        yPosition = checkNewPage(yPosition);
                        yPosition = addWrappedText(line, margin, yPosition, maxWidth);
                        yPosition += 3;
                    } else {
                        yPosition += 6;
                    }
                }
            }

            yPosition += 10;

            // Add Word Bank
            yPosition = addWordBankToPDF(doc, yPosition, margin, maxWidth, checkNewPage);

            // Add Answer Section
            yPosition = addAnswerSectionToPDF(doc, yPosition, margin, checkNewPage);

            // Generate filename
            const filename = title ? `${title}.pdf` : 'cloze-test.pdf';

            // Check if we should use Web Share API (mobile devices only)
            if (isMobileDevice() && navigator.share) {
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

        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Error: ' + error.message);
        }
    }

    function addWordBankToPDF(doc, yPosition, margin, maxWidth, checkNewPage) {
        const wordBankContent = wordBank.innerHTML;
        if (!wordBankContent || !wordBankContent.trim()) return yPosition;

        yPosition = checkNewPage(yPosition, 30);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Word Bank', margin, yPosition);
        yPosition += 4;

        const wordBankWords = wordBank.querySelector('.word-bank-words');
        if (wordBankWords) {
            const words = Array.from(wordBankWords.children)
                .map(span => span.textContent.trim())
                .filter(word => word);

            if (words.length > 0) {
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

                yPosition += borderHeight + 10;
            }
        }

        return yPosition;
    }

    function addAnswerSectionToPDF(doc, yPosition, margin, checkNewPage) {
        const answerSectionContent = answerSection.innerHTML;
        if (!answerSectionContent || !answerSectionContent.trim()) return yPosition;

        yPosition = checkNewPage(yPosition, 30);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Answer Section', margin, yPosition);
        yPosition += 8;

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

        return yPosition;
    }

    // Initialize
    gapLengthValue.textContent = gapLength.value;
    updateWordSelection();
});