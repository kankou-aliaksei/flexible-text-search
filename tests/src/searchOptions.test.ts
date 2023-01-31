import { readFileSync } from 'fs';

import { FlexibleTextSearch } from '../../src';

describe('searchOptions.minScore', () => {
    it('should find 2 pre phrases which match >= 0.80 accuracy', async () => {
        const fts = new FlexibleTextSearch({
            esSearchIndex: 'text-search',
            esClientOptions: {
                node: `https://localhost:9400`,
                auth: {
                    username: 'elastic',
                    password: process.env.ES_PASSWORD!
                },
                tls: {
                    ca: readFileSync('./tests/http_ca.crt')
                }
            },
            searchOptions: {
                minScore: 80,
                maxDistanceBetweenWords: 1.5
            }
        });

        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. It is a cute ocean to four do five a six It is a ocean seven eight nine ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['It is a beautiful ocean'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        expect(result.foundPrePhrases.length).toEqual(2);
    });

    it('should find 1 pre phrase which match >= 0.81 accuracy', async () => {
        const fts = new FlexibleTextSearch({
            esSearchIndex: 'text-search',
            esClientOptions: {
                node: `https://localhost:9400`,
                auth: {
                    username: 'elastic',
                    password: process.env.ES_PASSWORD!
                },
                tls: {
                    ca: readFileSync('./tests/http_ca.crt')
                }
            },
            searchOptions: {
                minScore: 81,
                maxDistanceBetweenWords: 1.5
            }
        });

        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. It is a cute ocean to four do five a six It is a ocean seven eight nine ligula erat, imperdiet rutrum nisl at, placerat consectetur erat. the our meeting is over Nullam sollicitudin mi consequat, maximus ante eu, sodales lectus. Morbi vel tristique mauris. Maecenas auctor vel lacus sit amet finibus. Phasellus vitae dapibus est. Donec pharetra, quam et vulputate vehicula, felis arcu cursus nisi, ut eleifend augue mauris molestie nisl. Proin non orci diam. Ut ullamcorper ligula eget bibendum consectetur.',
            prePhrases: ['It is a beautiful ocean'],
            postPhrases: ['the our meeting is over']
        };

        const result = await fts.extractText(request);

        expect(result.foundPrePhrases.length).toEqual(1);
    });
});
