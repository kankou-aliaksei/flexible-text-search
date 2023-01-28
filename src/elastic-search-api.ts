import http, { RequestOptions } from 'http';
import { ElasticSearchApiOptions } from './types';
import { MtermvectorsResponse, TermvectorsTerm } from '@elastic/elasticsearch/lib/api/types';

http.globalAgent.maxSockets = parseInt(process.env.MAX_SOCKETS || '50');

export class ElasticSearchApi {
    private readonly httpDefaultOptions: RequestOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    public constructor(options: ElasticSearchApiOptions = {} as ElasticSearchApiOptions) {
        this.httpDefaultOptions.timeout =
            options.timeout || parseInt(process.env.ES_RQ_TIMEOUT || '60000');
        this.httpDefaultOptions.host = options.host || process.env.ES_HOST || 'localhost';
        this.httpDefaultOptions.port =
            options.port || parseInt(process.env.ES_RQ_TIMEOUT || '9200');
    }

    public getTermVectors(id, elasticsearchIndex): Promise<Record<string, TermvectorsTerm>> {
        return new Promise((resolve, reject) => {
            const payload = {
                docs: [
                    {
                        _index: elasticsearchIndex,
                        _id: id
                    }
                ]
            };

            const path = `/${elasticsearchIndex}/_mtermvectors`;

            const options = { ...this.httpDefaultOptions, path, method: 'POST' };

            const req = http.request(options, res => {
                let buffer = '';
                res.on('data', chunk => {
                    buffer += chunk;
                });
                res.on('end', () => {
                    try {
                        const rs: MtermvectorsResponse = JSON.parse(buffer) as MtermvectorsResponse;
                        const terms = rs.docs[0].term_vectors
                            ? rs.docs[0].term_vectors.content.terms
                            : ([] as unknown as Record<string, TermvectorsTerm>);
                        resolve(terms);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('error', e => {
                reject(e.message);
            });
            req.write(JSON.stringify(payload));
            req.end();
        });
    }
}
