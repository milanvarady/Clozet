export class DOMManager {
    constructor() {
        this.elements = {
            inputText: document.getElementById('inputText'),
            keepFormatting: document.getElementById('keepFormatting'),
            wordSelection: document.getElementById('wordSelection'),
            numberGaps: document.getElementById('numberGaps'),
            includeWordBank: document.getElementById('includeWordBank'),
            separateAnswers: document.getElementById('separateAnswers'),
            gapLength: document.getElementById('gapLength'),
            gapLengthValue: document.getElementById('gapLengthValue'),
            worksheetTitle: document.getElementById('worksheetTitle'),
            outputTitle: document.getElementById('outputTitle'),
            outputText: document.getElementById('outputText'),
            wordBank: document.getElementById('wordBank'),
            answerSection: document.getElementById('answerSection'),
            downloadPdf: document.getElementById('downloadPdf'),
            downloadDocx: document.getElementById('downloadDocx'),
            copyText: document.getElementById('copyText'),
            printButton: document.getElementById('printButton')
        };
    }

    getInputText() {
        return this.elements.inputText.value;
    }

    getKeepFormatting() {
        return this.elements.keepFormatting.checked;
    }

    getWorksheetTitle() {
        return this.elements.worksheetTitle.value.trim();
    }

    getOutputText() {
        return this.elements.outputText.textContent;
    }

    getWordBankElement() {
        return this.elements.wordBank;
    }

    getAnswerSectionElement() {
        return this.elements.answerSection;
    }

    getSettings() {
        return {
            numberGaps: this.elements.numberGaps.checked,
            includeWordBank: this.elements.includeWordBank.checked,
            separateAnswers: this.elements.separateAnswers.checked,
            gapLength: parseInt(this.elements.gapLength.value)
        };
    }

    updateGapLengthDisplay() {
        this.elements.gapLengthValue.textContent = this.elements.gapLength.value;
    }

    updateTitle() {
        this.elements.outputTitle.textContent = this.getWorksheetTitle();
    }

    showEmptyWordSelection() {
        this.elements.wordSelection.innerHTML = '<p>Paste text first</p>';
    }

    showEmptyState() {
        this.elements.outputText.innerHTML = '<p id="outputPlaceholder">The generated text will appear here.</p>';
        this.elements.wordBank.innerHTML = '';
        this.elements.answerSection.innerHTML = '';
        this.elements.downloadPdf.disabled = true;
        this.elements.downloadDocx.disabled = true;
        this.elements.copyText.disabled = true;
        this.elements.printButton.disabled = true;
    }

    enableButtons() {
        this.elements.downloadPdf.disabled = false;
        this.elements.downloadDocx.disabled = false;
        this.elements.copyText.disabled = false;
        this.elements.printButton.disabled = false;
    }

    updateOutput(outputText, wordBank, answerSection) {
        this.elements.outputText.textContent = outputText;
        this.elements.wordBank.innerHTML = wordBank;
        this.elements.answerSection.innerHTML = answerSection;
    }

    getWordSelectionElement() {
        return this.elements.wordSelection;
    }
}