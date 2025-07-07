import { Utils } from './utils.js';

export class DOCXGenerator {
    async generate(title, outputText, wordBankElement, answerSectionElement) {
        // Create DOCX document using docx library
        const docxBlob = await this.createDocxDocument(title, outputText, wordBankElement, answerSectionElement);
        
        // Handle download or sharing
        await this.handleOutput(docxBlob, title);
    }

    async createDocxDocument(title, outputText, wordBankElement, answerSectionElement) {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

        const children = [];

        // Add title
        if (title && title.trim()) {
            children.push(
                new Paragraph({
                    text: title,
                    heading: HeadingLevel.HEADING_1,
                })
            );
        }

        // Add main content
        if (outputText && outputText.trim()) {
            const paragraphs = outputText.split('\n');
            for (const paragraph of paragraphs) {
                children.push(
                    new Paragraph({
                        text: paragraph,
                    })
                );
            }
        }

        // Add Word Bank
        if (wordBankElement && wordBankElement.innerHTML.trim()) {
            children.push(
                new Paragraph({
                    text: 'Word Bank',
                    heading: HeadingLevel.HEADING_2,
                })
            );
            
            const words = Utils.extractWordBankWords(wordBankElement);
            if (words.length > 0) {
                children.push(
                    new Paragraph({
                        text: words.join(' / '),
                    })
                );
            }
        }

        // Add Answer Section
        if (answerSectionElement && answerSectionElement.innerHTML.trim()) {
            children.push(
                new Paragraph({
                    text: 'Answer Section',
                    heading: HeadingLevel.HEADING_2,
                })
            );

            const answerPs = answerSectionElement.querySelectorAll('p');
            answerPs.forEach(p => {
                const answerText = p.textContent.trim();
                if (answerText) {
                    children.push(
                        new Paragraph({
                            text: answerText,
                        })
                    );
                }
            });
        }

        // Create document
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: children,
                },
            ],
        });

        // Generate DOCX blob
        const blob = await Packer.toBlob(doc);
        return blob;
    }

    isMobileDevice() {
        return Utils.isMobileDevice();
    }

    async handleOutput(docxBlob, title) {
        const filename = title ? `${title}.docx` : 'cloze-test.docx';

        // Check if we should use Web Share API (mobile devices only)
        if (this.isMobileDevice() && navigator.share) {
            try {
                // Create file from DOCX blob
                const file = new File([docxBlob], filename, { 
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
                });

                // Check if we can share files
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: title || 'Cloze Test',
                        text: 'Created with Clozet',
                        files: [file]
                    });
                    return; // Exit early if sharing succeeded
                } else {
                    // Fallback to sharing without file if file sharing isn't supported
                    // Create a data URL from the blob
                    const dataUrl = await this.blobToDataURL(docxBlob);
                    await navigator.share({
                        title: title || 'Cloze Test',
                        text: 'Created with Clozet',
                        url: dataUrl
                    });
                    return;
                }
            } catch (shareError) {
                console.log('Share error:', shareError);

                // Check if the error is due to user cancellation
                if (shareError.name === 'AbortError') {
                    console.log('Share was cancelled by user');
                    return; // Exit without downloading
                }

                // For other errors (e.g., not supported), fall through to download
                console.log('Share failed, falling back to download');
            }
        }

        // Fallback to download for desktop or if sharing failed (but not cancelled)
        this.downloadBlob(docxBlob, filename);
    }

    async blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
