export class Utils {
    static isMobileDevice() {
        // Primary mobile detection using user agent
        const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Modern approach: Use userAgentData if available, with fallback to userAgent
        let platformMobile = false;
        if (navigator.userAgentData && navigator.userAgentData.mobile) {
            platformMobile = true;
        } else if (navigator.userAgent) {
            // Check for iPad specifically (often reports as desktop in userAgent)
            // Modern iPads may not be detected by the regex above
            platformMobile = navigator.userAgent.includes('Mac') && navigator.maxTouchPoints && navigator.maxTouchPoints > 2;
        }
        
        return userAgentMobile || platformMobile;
    }

    static extractWordBankWords(wordBankElement) {
        if (!wordBankElement || !wordBankElement.innerHTML.trim()) {
            return [];
        }

        const wordBankWords = wordBankElement.querySelector('.word-bank-words');
        if (!wordBankWords) {
            return [];
        }

        return Array.from(wordBankWords.children)
            .map(span => span.textContent.trim())
            .filter(word => word);
    }

    static showTemporaryMessage(message, type = 'success') {
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
