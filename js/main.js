import { DOMManager } from './dom-manager.js';
import { TextProcessor } from './text-processor.js';
import { WordSelector } from './word-selector.js';
import { OutputGenerator } from './output-generator.js';
import { PDFGenerator } from './pdf-generator.js';
import { DOCXGenerator } from './docx-generator.js';
import { TextCopyGenerator } from './text-copy-generator.js';

class ClozetApp {
    constructor() {
        this.domManager = new DOMManager();
        this.wordSelector = new WordSelector();
        this.outputGenerator = new OutputGenerator();
        this.pdfGenerator = new PDFGenerator();
        this.docxGenerator = new DOCXGenerator();
        this.textCopyGenerator = new TextCopyGenerator();

        this.state = {
            words: [],
            gappedWords: [],
            ranges: new Map() // Track ranges for variable gap lengths
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.domManager.updateGapLengthDisplay();
        this.updateWordSelection();
    }

    setupEventListeners() {
        const elements = this.domManager.elements;

        elements.inputText.addEventListener('input', () => this.updateWordSelection());
        elements.worksheetTitle.addEventListener('input', () => this.updateOutput());
        elements.keepFormatting.addEventListener('change', () => this.updateWordSelection());
        elements.downloadPdf.addEventListener('click', () => this.generatePDF());
        elements.downloadDocx.addEventListener('click', () => this.generateDOCX());
        elements.copyText.addEventListener('click', () => this.copyText());

        [elements.numberGaps, elements.includeWordBank, elements.separateAnswers, elements.gapLength].forEach(el => {
            el.addEventListener('change', () => this.updateOutput());
        });

        elements.gapLength.addEventListener('input', () => {
            this.domManager.updateGapLengthDisplay();
            this.updateOutput();
        });

        // Range mode toggle for mobile support
        const rangeModeToggle = document.getElementById('rangeMode');
        if (rangeModeToggle) {
            rangeModeToggle.addEventListener('change', () => {
                this.wordSelector.setRangeMode(rangeModeToggle.checked);
            });
        }
    }

    updateWordSelection() {
        const text = this.domManager.getInputText();
        this.state.gappedWords = []; // Clear gaps on text change

        if (text.trim() === '') {
            this.domManager.showEmptyWordSelection();
            this.state.words = [];
            this.updateOutput();
            return;
        }

        this.state.words = TextProcessor.splitText(text, this.domManager.getKeepFormatting());
        this.wordSelector.render(this.state.words, (word, index, rangeId) => this.toggleGap(word, index, rangeId));
        this.updateOutput();
    }

    toggleGap(word, index, rangeId = false) {
        const gappedWordIndex = this.state.gappedWords.findIndex(g => g.index === index);

        if (gappedWordIndex > -1) {
            this.state.gappedWords.splice(gappedWordIndex, 1);
        } else {
            this.state.gappedWords.push({ word, index, isRange: rangeId });
        }
        this.updateOutput();
    }

    updateOutput() {
        this.domManager.updateTitle();

        if (this.domManager.getInputText().trim() === '') {
            this.domManager.showEmptyState();
            return;
        }

        this.domManager.enableButtons();
        this.generateOutputs();
    }

    generateOutputs() {
        const settings = this.domManager.getSettings();

        const outputText = this.outputGenerator.generateOutputText(
            this.state.words,
            this.state.gappedWords,
            settings
        );

        const wordBank = this.outputGenerator.generateWordBank(
            this.state.gappedWords,
            settings.includeWordBank
        );

        const answerSection = this.outputGenerator.generateAnswerSection(
            this.state.gappedWords,
            settings.separateAnswers,
            settings.numberGaps
        );

        this.domManager.updateOutput(outputText, wordBank, answerSection);
    }

    getDocumentData() {
        return {
            title: this.domManager.getWorksheetTitle(),
            outputText: this.domManager.getOutputText(),
            wordBank: this.domManager.getWordBankElement(),
            answerSection: this.domManager.getAnswerSectionElement()
        };
    }

    async generatePDF() {
        try {
            const data = this.getDocumentData();
            await this.pdfGenerator.generate(data.title, data.outputText, data.wordBank, data.answerSection);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Error: ' + error.message);
        }
    }

    async generateDOCX() {
        try {
            const data = this.getDocumentData();
            await this.docxGenerator.generate(data.title, data.outputText, data.wordBank, data.answerSection);
        } catch (error) {
            console.error('DOCX generation failed:', error);
            alert('Failed to generate DOCX. Error: ' + error.message);
        }
    }

    async copyText() {
        try {
            const data = this.getDocumentData();
            await this.textCopyGenerator.copyToClipboard(data.title, data.outputText, data.wordBank, data.answerSection);
        } catch (error) {
            console.error('Copy text failed:', error);
            // Error message is already shown by textCopyGenerator
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ClozetApp();
});