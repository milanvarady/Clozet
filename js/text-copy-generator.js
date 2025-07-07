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
            
            const wordBankWords = wordBankElement.querySelector('.word-bank-words');
            if (wordBankWords) {
                const words = Array.from(wordBankWords.children)
                    .map(span => span.textContent.trim())
                    .filter(word => word);
                
                if (words.length > 0) {
                    text += `${words.join(' / ')}\n\n`;
                }
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
        // Show a temporary success message
        this.showTemporaryMessage('✅ Text copied to clipboard!', 'success');
    }

    showCopyError() {
        // Show a temporary error message
        this.showTemporaryMessage('❌ Failed to copy text. Please try again.', 'error');
    }

    showTemporaryMessage(message, type) {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transition: opacity 0.3s ease;
            ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}
