export class TextProcessor {
    static splitText(text, keepFormatting) {
        // Split text while preserving delimiters
        if (keepFormatting) {
            return text.split(/(\s+|[.!?,])/);
        } else {
            return text.replace(/\n/g, ' ').split(/(\s+|[.!?,])/);
        }
    }
}
