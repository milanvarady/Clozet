export class TextProcessor {
    splitText(text, keepFormatting) {
        // Split text while preserving delimiters
        if (keepFormatting) {
            return text.split(/(\s+|[.!?,])/);
        } else {
            return text.replace(/\n/g, ' ').split(/(\s+|[.!?,])/);
        }
    }

    hasLineBreak(word) {
        return word.includes('\n');
    }

    isValidWord(word) {
        return word && word.trim();
    }
}