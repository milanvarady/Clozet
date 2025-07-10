export class WordSelector {
    constructor() {
        this.selectedWords = new Set();
        this.lastSelectedIndex = null;
        this.ranges = new Map(); // Map to track ranges: key is range id, value is {start, end}
        this.rangeCounter = 0;
        this.rangeModeEnabled = false;
    }

    setRangeMode(enabled) {
        this.rangeModeEnabled = enabled;
        
        // Clear lastSelectedIndex when switching to range mode
        if (enabled) {
            this.lastSelectedIndex = null;
        }
    }

    render(words, toggleCallback) {
        const wordSelectionElement = document.getElementById('wordSelection');
        const fragment = document.createDocumentFragment();

        words.forEach((word, index) => {
            if (word.includes('\n')) {
                const lineBreak = document.createElement('div');
                lineBreak.classList.add('word-selection-line-break');
                fragment.appendChild(lineBreak);
            } else if (word && word.trim()) {
                const button = this.createWordButton(word, index, toggleCallback);
                fragment.appendChild(button);
            }
        });

        wordSelectionElement.innerHTML = '';
        wordSelectionElement.appendChild(fragment);
        
        // Clear selected words when re-rendering
        this.selectedWords.clear();
        this.lastSelectedIndex = null;
        this.ranges.clear();
        this.rangeCounter = 0;
    }

    createWordButton(word, index, toggleCallback) {
        const button = document.createElement('button');
        button.textContent = word;
        button.dataset.index = index;
        
        button.addEventListener('click', (event) => {
            const isSelected = this.selectedWords.has(index);
            const shiftKeyPressed = event.shiftKey;
            
            if ((shiftKeyPressed || this.rangeModeEnabled) && this.lastSelectedIndex !== null) {
                this.handleRangeSelection(index, toggleCallback);
                // Reset lastSelectedIndex after range creation in range mode
                if (this.rangeModeEnabled) {
                    this.lastSelectedIndex = null;
                } else {
                    this.lastSelectedIndex = index;
                }
            } else if (isSelected) {
                this.deselectWord(index, button, toggleCallback);
                this.lastSelectedIndex = index;
            } else {
                this.selectWord(word, index, button, toggleCallback);
                this.lastSelectedIndex = index;
            }
        });
        
        return button;
    }

    handleRangeSelection(endIndex, toggleCallback) {
        const startIndex = this.lastSelectedIndex;
        const rangeStart = Math.min(startIndex, endIndex);
        const rangeEnd = Math.max(startIndex, endIndex);
        
        // Check if ALL words in the range are already selected as part of the SAME range
        let shouldDeselect = true;
        let firstRangeId = null;
        
        for (let i = rangeStart; i <= rangeEnd; i++) {
            if (this.selectedWords.has(i)) {
                const button = document.querySelector(`button[data-index='${i}']`);
                if (button && button.classList.contains('range-selected')) {
                    const rangeId = button.dataset.rangeId;
                    if (firstRangeId === null) {
                        firstRangeId = rangeId;
                    } else if (firstRangeId !== rangeId) {
                        // Different range IDs, don't deselect
                        shouldDeselect = false;
                        break;
                    }
                } else {
                    // Not all words are range-selected
                    shouldDeselect = false;
                    break;
                }
            } else {
                // Word not selected, don't deselect
                shouldDeselect = false;
                break;
            }
        }
        
        // Only deselect if ALL words are part of the same range
        if (shouldDeselect && firstRangeId !== null) {
            const range = this.ranges.get(parseInt(firstRangeId));
            if (range) {
                this.deselectRange(range.start, range.end, toggleCallback);
            }
        } else {
            // Create new range selection
            this.selectRange(rangeStart, rangeEnd, toggleCallback);
        }
    }

    selectRange(start, end, toggleCallback) {
        // Remove existing ranges that overlap with the new range
        const rangesToRemove = [];
        this.ranges.forEach((range, key) => {
            if ((start <= range.end && end >= range.start)) {
                rangesToRemove.push({ key, range });
            }
        });
        
        // Remove overlapping ranges
        rangesToRemove.forEach(({ key, range }) => {
            this.deselectRange(range.start, range.end, toggleCallback);
        });
        
        // Clear any single selections in the range
        this.clearOverlappingSelections(start, end, toggleCallback);
        
        // Create new range
        const rangeId = this.rangeCounter++;
        this.ranges.set(rangeId, { start, end });
        
        // Select the range
        for (let i = start; i <= end; i++) {
            const button = document.querySelector(`button[data-index='${i}']`);
            if (button) {
                button.classList.add('range-selected');
                button.classList.remove('secondary');
                button.dataset.rangeId = rangeId;
                this.selectedWords.add(i);
                
                // Get the actual word from the button
                const word = button.textContent;
                toggleCallback(word, i, rangeId); // pass rangeId instead of boolean
            }
        }
    }

    deselectRange(start, end, toggleCallback) {
        for (let i = start; i <= end; i++) {
            const button = document.querySelector(`button[data-index='${i}']`);
            if (button && button.classList.contains('range-selected')) {
                const rangeId = button.dataset.rangeId;
                if (rangeId) {
                    this.ranges.delete(parseInt(rangeId));
                }
                
                button.classList.remove('range-selected');
                button.classList.remove('secondary');
                delete button.dataset.rangeId;
                this.selectedWords.delete(i);
                
                const word = button.textContent;
                toggleCallback(word, i, false); // false indicates deselection
            }
        }
    }

    clearOverlappingSelections(start, end, toggleCallback) {
        // Clear any existing selections that overlap with the new range
        for (let i = start; i <= end; i++) {
            if (this.selectedWords.has(i)) {
                const button = document.querySelector(`button[data-index='${i}']`);
                if (button) {
                    // If it's a single selection, remove it
                    if (button.classList.contains('secondary') && !button.classList.contains('range-selected')) {
                        button.classList.remove('secondary');
                        this.selectedWords.delete(i);
                        toggleCallback(button.textContent, i, false);
                    }
                    // If it's part of another range, remove that range
                    else if (button.classList.contains('range-selected')) {
                        const rangeId = button.dataset.rangeId;
                        if (rangeId) {
                            const range = this.ranges.get(parseInt(rangeId));
                            if (range) {
                                this.deselectRange(range.start, range.end, toggleCallback);
                            }
                        }
                    }
                }
            }
        }
    }

    selectWord(word, index, button, toggleCallback) {
        // Clear any existing range that contains this word
        this.clearOverlappingSelections(index, index, toggleCallback);
        
        this.selectedWords.add(index);
        button.classList.add('secondary');
        button.classList.remove('range-selected');
        delete button.dataset.rangeId;
        
        toggleCallback(word, index, false);
    }

    deselectWord(index, button, toggleCallback) {
        // Check if this word is part of a range
        if (button.classList.contains('range-selected')) {
            const rangeId = button.dataset.rangeId;
            if (rangeId) {
                const range = this.ranges.get(parseInt(rangeId));
                if (range) {
                    this.deselectRange(range.start, range.end, toggleCallback);
                    return;
                }
            }
        }
        
        // Regular single word deselection
        this.selectedWords.delete(index);
        button.classList.remove('secondary', 'range-selected');
        delete button.dataset.rangeId;
        
        const word = button.textContent;
        toggleCallback(word, index, false);
    }
}
