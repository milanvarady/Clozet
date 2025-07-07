export class WordSelector {
    constructor() {
        this.selectedWords = new Set();
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
    }

    createWordButton(word, index, toggleCallback) {
        const button = document.createElement('button');
        button.textContent = word;
        button.dataset.index = index;
        
        button.addEventListener('click', () => {
            const isSelected = this.selectedWords.has(index);
            
            if (isSelected) {
                this.selectedWords.delete(index);
                button.classList.remove('secondary');
            } else {
                this.selectedWords.add(index);
                button.classList.add('secondary');
            }
            
            toggleCallback(word, index);
        });
        
        return button;
    }
}