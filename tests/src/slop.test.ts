import { FlexibleTextSearch } from '../../src/flexible-text-search';

const fts = new FlexibleTextSearch();

describe('slop', () => {
    it('should extract expected text if slop credits are not exhausted', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum I one am two going three to four do five a six seven eight recolding nine session ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['I am going to do a recording session'],
            postPhrases: ['the our meeting is over'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);

        const expectedExtractedText =
            'ligula erat, imperdiet rutrum nisl at, placerat consectetur erat';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    it('should not extract expected text if slop credits are not exhausted', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum I one two three am four five going six to seven do eight nine a ten eleven twelve recording session ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['I am going to do a recording session'],
            postPhrases: ['the our meeting is over'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);

        const expectedExtractedText = 'Not found';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });
});
