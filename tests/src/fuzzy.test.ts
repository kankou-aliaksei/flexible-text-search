import { FlexibleTextSearch } from '../../src';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: `http://localhost:9200`
    }
});

describe('fuzzy', () => {
    it("should extract text for an inaccurate phrase 'hello beaudiful ocean'", async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum hello beaudiful ocean ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['hello beautiful ocean'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        const expectedExtractedText =
            'ligula erat, imperdiet rutrum nisl at, placerat consectetur erat';

        let foundPrePhraseResponse;

        for (const foundPrePhrase of result.foundPrePhrases) {
            if (foundPrePhrase.searchText === request.prePhrases[0].toLowerCase()) {
                foundPrePhraseResponse = foundPrePhrase;
                break;
            }
        }

        expect(foundPrePhraseResponse.accuracy).toEqual(1);

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    it("should extract text for an inaccurate phrase 'hetlo beaudiful ocea'", async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum hetlo beaudiful ocea ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['hello beautiful ocean'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        const expectedExtractedText =
            'ligula erat, imperdiet rutrum nisl at, placerat consectetur erat';

        let foundPrePhraseResponse;

        for (const foundPrePhrase of result.foundPrePhrases) {
            if (foundPrePhrase.searchText === request.prePhrases[0].toLowerCase()) {
                foundPrePhraseResponse = foundPrePhrase;
                break;
            }
        }

        expect(foundPrePhraseResponse.accuracy).toEqual(1);

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    it("should extract text for an inaccurate phrase 'hetlo beaudiful oceans'", async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum hetlo beaudiful oceans ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['hello beautiful ocean'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        const expectedExtractedText =
            'ligula erat, imperdiet rutrum nisl at, placerat consectetur erat';

        let foundPrePhraseResponse;

        for (const foundPrePhrase of result.foundPrePhrases) {
            if (foundPrePhrase.searchText === request.prePhrases[0].toLowerCase()) {
                foundPrePhraseResponse = foundPrePhrase;
                break;
            }
        }

        expect(foundPrePhraseResponse.accuracy).toEqual(1);

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    it("should extract text for an inaccurate phrase 'hetlo beaudifum oceans'", async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum hetlo beaudiful oceans ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['hello beautiful ocean'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        const expectedExtractedText =
            'ligula erat, imperdiet rutrum nisl at, placerat consectetur erat';

        let foundPrePhraseResponse;

        for (const foundPrePhrase of result.foundPrePhrases) {
            if (foundPrePhrase.searchText === request.prePhrases[0].toLowerCase()) {
                foundPrePhraseResponse = foundPrePhrase;
                break;
            }
        }

        expect(foundPrePhraseResponse.accuracy).toEqual(1);

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    it("should extract text for an inaccurate phrase 'I am goimg to do a recolding session'", async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum I am goimg to do a recolding session, rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['I am going to do a recording session'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        const expectedExtractedText = 'rutrum nisl at, placerat consectetur erat';

        let foundPrePhraseResponse;

        for (const foundPrePhrase of result.foundPrePhrases) {
            if (foundPrePhrase.searchText === request.prePhrases[0].toLowerCase()) {
                foundPrePhraseResponse = foundPrePhrase;
                break;
            }
        }

        expect(foundPrePhraseResponse.accuracy).toEqual(1);

        expect(result.extractedText).toEqual(expectedExtractedText);
    });
});
