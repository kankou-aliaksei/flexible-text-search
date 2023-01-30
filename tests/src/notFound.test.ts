import { FlexibleTextSearch } from '../../src';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: `http://localhost:9200`
    }
});

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
            postPhrases: ['our meeting is now over', 'our meeting is over']
        };

        const result = await fts.extractText(request);

        expect(result.extractedText).toBeUndefined();
    });
});
