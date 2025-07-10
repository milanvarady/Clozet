export class OutputGenerator {
    generateOutputText(words, gappedWords, settings) {
        let outputContent = '';
        let gapCounter = 0;
        let processedRanges = new Set();

        let i = 0;
        while (i < words.length) {
            const word = words[i];

            if (word.includes('\n')) {
                outputContent += word;
                i++;
                continue;
            }

            const gappedWord = gappedWords.find(g => g.index === i);
            if (gappedWord) {
                if (gappedWord.isRange !== false && !processedRanges.has(i)) {
                    // Handle range selection
                    gapCounter++;
                    
                    // Determine start and end of the range based on rangeId
                    const rangeId = gappedWord.isRange;
                    const range = gappedWords.filter(g => g.isRange === rangeId);
                    const rangeStart = Math.min(...range.map(r => r.index));
                    const rangeEnd = Math.max(...range.map(r => r.index));
                    
                    // Calculate total character count for the range
                    let totalChars = 0;
                    for (let j = rangeStart; j <= rangeEnd; j++) {
                        if (words[j] && !words[j].includes('\n')) {
                            totalChars += words[j].length;
                        }
                        processedRanges.add(j);
                    }
                    
                    // Create variable-length gap based on character count
                    let gapLength = Math.max(settings.gapLength, Math.floor(totalChars * 1.5));
                    let gap = '_'.repeat(gapLength);
                    if (settings.numberGaps) {
                        gap = `(${gapCounter})\u00A0${gap}`;
                    }
                    outputContent += gap;
                    
                    // Skip to end of range
                    i = rangeEnd;
                } else if (gappedWord.isRange === false) {
                    // Handle single word selection
                    gapCounter++;
                    let gap = '_'.repeat(settings.gapLength);
                    if (settings.numberGaps) {
                        gap = `(${gapCounter})\u00A0${gap}`;
                    }
                    outputContent += gap;
                }
                // If it's a range word already processed, skip it
            } else {
                outputContent += word;
            }
            i++;
        }

        return outputContent;
    }

    generateWordBank(gappedWords, includeWordBank) {
        if (!includeWordBank || gappedWords.length === 0) {
            return '';
        }

        // Group words by ranges and create unique entries
        const uniqueEntries = new Map();
        const processedRanges = new Set();
        
        gappedWords.forEach(g => {
            if (g.isRange !== false && !processedRanges.has(g.isRange)) {
                // For ranges, combine all words in the range
                const rangeWords = gappedWords.filter(w => w.isRange === g.isRange);
                const combinedWords = rangeWords.map(w => w.word).join(' ');
                uniqueEntries.set(g.isRange, combinedWords);
                processedRanges.add(g.isRange);
            } else if (g.isRange === false) {
                // For single words, add them directly
                uniqueEntries.set(`single_${g.index}`, g.word);
            }
        });
        
        const shuffledEntries = Array.from(uniqueEntries.values()).sort(() => Math.random() - 0.5);
        const wordBankHtml = shuffledEntries
            .map(entry => `<span class="word-bank-word">${entry}</span>`)
            .join(' / ');
        
        return `<h3>Word Bank</h3><div class="word-bank-words">${wordBankHtml}</div>`;
    }

    generateAnswerSection(gappedWords, separateAnswers, numberGaps) {
        if (!separateAnswers || gappedWords.length === 0) {
            return '';
        }

        // Count unique gaps (ranges count as one gap)
        const uniqueGaps = new Set();
        const processedRanges = new Set();
        
        gappedWords.forEach(g => {
            if (g.isRange !== false && !processedRanges.has(g.isRange)) {
                uniqueGaps.add(g.isRange);
                processedRanges.add(g.isRange);
            } else if (g.isRange === false) {
                uniqueGaps.add(`single_${g.index}`);
            }
        });
        
        let answers = '<h3>Answer Section</h3>';
        const gapCount = uniqueGaps.size;
        for (let i = 0; i < gapCount; i++) {
            const prefix = numberGaps ? `(${i + 1})` : '';
            answers += `<p>${prefix} ____________________________</p>`;
        }
        
        return answers;
    }
}