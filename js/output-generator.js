export class OutputGenerator {
    generateOutputText(words, gappedWords, settings) {
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
                let gap = '_'.repeat(settings.gapLength);
                if (settings.numberGaps) {
                    gap = `(${gapCounter})\u00A0${gap}`;
                }
                outputContent += gap;
            } else {
                outputContent += word;
            }
        });

        return outputContent;
    }

    generateWordBank(gappedWords, includeWordBank) {
        if (!includeWordBank || gappedWords.length === 0) {
            return '';
        }

        const shuffledWords = [...gappedWords].sort(() => Math.random() - 0.5);
        const wordBankHtml = shuffledWords
            .map(g => `<span class="word-bank-word">${g.word}</span>`)
            .join(' / ');
        
        return `<h3>Word Bank</h3><div class="word-bank-words">${wordBankHtml}</div>`;
    }

    generateAnswerSection(gappedWords, separateAnswers, numberGaps) {
        if (!separateAnswers || gappedWords.length === 0) {
            return '';
        }

        let answers = '<h3>Answer Section</h3>';
        for (let i = 0; i < gappedWords.length; i++) {
            const prefix = numberGaps ? `(${i + 1})` : '';
            answers += `<p>${prefix} ____________________________</p>`;
        }
        
        return answers;
    }
}