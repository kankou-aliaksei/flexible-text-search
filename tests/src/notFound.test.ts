import { FlexibleTextSearch } from '../../src/flexible-text-search';

const fts = new FlexibleTextSearch();

describe('notFound', () => {
    it('should extract expected text for ... POST_PHRASE ...', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl.',
            prePhrases: [
                'now going to start the recording session',
                'now going to start the recording session',
                'going to do a recording session',
                'going to do a recording session'
            ],
            postPhrases: ['our meeting is now over', 'our meeting is over'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText = 'Not found';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });
});
