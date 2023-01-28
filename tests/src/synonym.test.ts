import { FlexibleTextSearch } from '../../src/flexible-text-search';

const fts = new FlexibleTextSearch();

describe('synonym', () => {
    it("should extract expected text by using a synonym. 'It is a cute ocean' is considered as 'It is a beautiful ocean' because of synonyms", async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. It is a cute ocean to four do five a six seven eight nine ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['It is a beautiful ocean'],
            postPhrases: ['the our meeting is over'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);

        let foundPrePhraseResponse;

        for (const foundPrePhrase of result.foundPrePhrases) {
            if (foundPrePhrase.searchText === request.prePhrases[0].toLowerCase()) {
                foundPrePhraseResponse = foundPrePhrase;
                break;
            }
        }

        expect(foundPrePhraseResponse.accuracy).toEqual(1);

        const expectedExtractedText =
            'to four do five a six seven eight nine ligula erat, imperdiet rutrum nisl at, placerat consectetur erat';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });
});
