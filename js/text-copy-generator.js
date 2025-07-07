import { Utils } from './utils.js';

export class TextCopyGenerator {
    async copyToClipboard(title, outputText, wordBankElement, answerSectionElement) {
        try {
            const plainText = this.generatePlainText(title, outputText, wordBankElement, answerSectionElement);
            
            // Use the modern Clipboard API if available
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(plainText);
                this.showCopySuccess();
            } else {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(plainText);
            }
        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyError();
        }
    }

    generatePlainText(title, outputText, wordBankElement, answerSectionElement) {
        let text = '';

        // Add title
        if (title && title.trim()) {
            text += `${title}\n`;
        }

        // Add main content
        if (outputText && outputText.trim()) {
            text += `${outputText}\n\n`;
        }

        // Add Word Bank
        if (wordBankElement && wordBankElement.innerHTML.trim()) {
            text += 'Word Bank\n';
            
            const words = Utils.extractWordBankWords(wordBankElement);
            if (words.length > 0) {
                text += `${words.join(' / ')}\n\n`;
            }
        }

        // Add Answer Section
        if (answerSectionElement && answerSectionElement.innerHTML.trim()) {
            text += 'Answer Section\n';
            
            const answerPs = answerSectionElement.querySelectorAll('p');
            answerPs.forEach(p => {
                const answerText = p.textContent.trim();
                if (answerText) {
                    text += `${answerText}\n`;
                }
            });
        }

        return text.trim();
    }

    fallbackCopyToClipboard(text) {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showCopySuccess();
            } else {
                this.showCopyError();
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.showCopyError();
        }
        
        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        Utils.showTemporaryMessage('✅ Text copied to clipboard!', 'success');
    }

    showCopyError() {
        Utils.showTemporaryMessage('❌ Failed to copy text. Please try again.', 'error');
    }
}
