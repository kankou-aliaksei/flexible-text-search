import { FlexibleTextSearch } from '../../src';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: `http://localhost:9200`
    }
});

describe('findText', () => {
    it('should find an expected phrase', async () => {
        const request = {
            content:
                "Many desktop publishing packages and web page Nice editors to meet you now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
            phrases: ['Nice to meet you']
        };

        const result = await fts.findText(request);

        const expectedFoundText = 'Nice editors to meet you';

        expect(result[0].foundText).toEqual(expectedFoundText);
    });

    it('should return true if text exists', async () => {
        const request = {
            content:
                "Many desktop publishing packages and web page Nice editors to meet you now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
            phrases: ['Nice to meet you']
        };

        const result = await fts.doesTextExist(request);

        expect(result).toEqual(true);
    });

    it('should find a text if phrase contains two words', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend relax plan ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui.',
            phrases: ['relax plan', 'plan and assessment']
        };

        const result = await fts.findText(request);

        console.log(JSON.stringify(result));

        expect(result[0].foundText).toEqual('relax plan');
        expect(result.length).toEqual(1);
    });
});
