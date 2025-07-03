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
    const outputSection = document.getElementById('outputSection');

    downloadPdf.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const title = worksheetTitle.value.trim();

        html2canvas(outputSection, { media: 'print' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            doc.save(title ? `${title}.pdf` : 'cloze-test.pdf');
        });
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