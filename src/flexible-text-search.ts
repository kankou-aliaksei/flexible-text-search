import {
    ExtractedTextEntity,
    FlexibleTextOptions,
    ExtractTextRequest,
    FindTextRequest,
    FoundEntity,
    LogLevel,
    NearestPositionsResponse,
    PhraseEntity,
    Position,
    PositionEntity,
    TextType,
    FinalSearchOptions,
    SearchOptions
} from './types';

import elasticsearch, { Client } from '@elastic/elasticsearch';
import esb from 'elastic-builder';
import { ceil } from 'mathjs';
import _ from 'underscore';
import { Logger } from 'tslog';
import {
    generateCombinations,
    getPositions,
    getPositionTextBetweenPhrases,
    removeStartEndPunctuationCharacters
} from './util';
import {
    getHighlightedTerms,
    leaveOneFoundEntityWithBestAccuracyForEachRange
} from './text-search-util';
import { ILogObj } from 'tslog/dist/types/interfaces';
import { SearchHit, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types';
import { ClientOptions } from '@elastic/elasticsearch/lib/client';

const HIGHLIGHT_FRAGMENT_SIZE = 10000000;
const HIGHLIGHT_PRE_TAG = '<em>';
const HIGHLIGHT_POST_TAG = '</em>';

const SEARCH_FIELD_NAME = 'content';
const JOIN_SYMBOL = process.env.JOIN_SYMBOL || ';';

const START_OR_END_WITH_PUNCTUATION_SYMBOL_PATTERN =
    /^\s*[.,/#!$%\\^&*;:{}=\-_`~()?]\s*|\s*[.,/#!$%\\^&*;:{}=\-_`~()?]\s*$/;
const DO_DOCUMENTS_DELETE = true;

export class FlexibleTextSearch {
    private readonly esClient: Client;
    private readonly options: FlexibleTextOptions = {} as FlexibleTextOptions;
    private readonly log: Logger<ILogObj>;
    private readonly searchOptions: FinalSearchOptions = {
        minScore: 60,
        maxDistanceBetweenWords: 1.2,
        fuzziness: 'AUTO',
        fuzzyPrefixLength: 0,
        fuzzyMaxExpansions: 100,
        fuzzyMinSymbols: 3,
        doesPhraseSearchOnlyOnceWithBestAccuracy: false
    };

    public constructor(options: FlexibleTextOptions = {} as FlexibleTextOptions) {
        this.options.esSearchIndex = options.esSearchIndex || 'text-search';

        const esClientOpts: ClientOptions = options.esClientOptions || {
            node: `http://localhost:9200`
        };

        this.esClient = new elasticsearch.Client(esClientOpts);

        this.log = new Logger({ minLevel: options.logLevel || LogLevel.Info });

        this.setFinalSearchOptions(options.searchOptions);
    }

    public async extractText(extractTextRequest: ExtractTextRequest): Promise<ExtractedTextEntity> {
        try {
            const content = extractTextRequest.content;

            const prePhrases: PhraseEntity[] = extractTextRequest.prePhrases.map(phrase => ({
                value: phrase,
                type: 'PRE_PHRASE'
            }));
            const postPhrases: PhraseEntity[] = extractTextRequest.postPhrases.map(phrase => ({
                value: phrase,
                type: 'POST_PHRASE'
            }));

            const phrasesToSearch: PhraseEntity[] = prePhrases.concat(postPhrases);

            const foundPhrases: FoundEntity[] = _.flatten(
                (await this.searchPhrases(content, phrasesToSearch)).filter(
                    foundEntities => foundEntities.length
                )
            );

            let foundPrePhrases = foundPhrases.filter(phrase => phrase.textType === 'PRE_PHRASE');
            let foundPostPhrases = foundPhrases.filter(phrase => phrase.textType === 'POST_PHRASE');

            foundPrePhrases = _.sortBy(foundPrePhrases, foundPhrase => foundPhrase.startOffset);
            foundPostPhrases = _.sortBy(foundPostPhrases, foundPhrase => foundPhrase.startOffset);

            foundPrePhrases = leaveOneFoundEntityWithBestAccuracyForEachRange(foundPrePhrases);
            foundPostPhrases = leaveOneFoundEntityWithBestAccuracyForEachRange(foundPostPhrases);

            if (!foundPrePhrases.length || !foundPostPhrases.length) {
                return {
                    content,
                    phrasesToSearch,
                    foundPrePhrases: [],
                    foundPostPhrases: [],
                    extractedText: undefined
                };
            }

            const extractedPhrases = this.extractPhrases(
                content,
                foundPrePhrases,
                foundPostPhrases
            );

            const foundText = this.joinFoundPhrases(extractedPhrases);

            return {
                content,
                phrasesToSearch,
                extractedText: foundText,
                foundPrePhrases,
                foundPostPhrases
            };
        } catch (error) {
            this.log.error(error);
            throw error;
        }
    }

    public async findText(findTextRequest: FindTextRequest): Promise<FoundEntity[]> {
        try {
            const content = findTextRequest.content;

            const phrasesToSearch: PhraseEntity[] = findTextRequest.phrases.map(phrase => ({
                value: phrase,
                type: 'TEXT'
            }));

            return _.flatten(
                (await this.searchPhrases(content, phrasesToSearch)).filter(
                    foundEntities => foundEntities.length
                )
            );
        } catch (error) {
            this.log.error(error);
            throw error;
        }
    }

    public async doesTextExist(findTextRequest: FindTextRequest): Promise<boolean> {
        try {
            const result = await this.findText(findTextRequest);
            return result.length > 0;
        } catch (error) {
            this.log.error(error);
            throw error;
        }
    }

    private async searchPhrases(
        content: string,
        phrases: PhraseEntity[]
    ): Promise<FoundEntity[][]> {
        return Promise.all(phrases.map(phrase => this.searchText(content, phrase)));
    }

    private async searchText(content: string, phrase: PhraseEntity): Promise<FoundEntity[]> {
        const textToSearch = phrase.value.toLowerCase();
        const textType = phrase.type;

        if (this.searchOptions.minScore > 100 || this.searchOptions.minScore < 1) {
            throw new Error('The minimum score must be from 1 to 100');
        }

        return (await this.indexAndSearch(content, textToSearch, textType)).filter(
            foundEntity => !_.isNull(foundEntity)
        );
    }

    /**
     *
     * minScore must be 0-100
     *
     */
    private async indexAndSearch(
        content: string,
        textToSearch: string,
        textType: TextType
    ): Promise<FoundEntity[]> {
        let documentId: string | undefined;

        try {
            documentId = await this.indexTextToSearch(content);

            const words: string[] = textToSearch.split(' ');

            if (words.length <= 3) {
                this.log.debug(`${documentId} | We search all words since the word count <= 3`);
                return await this.foundInIndex(content, textToSearch, documentId, words, textType);
            }

            if (this.searchOptions.minScore === 100) {
                this.log.debug(
                    `${documentId} | We search all words since the minimum score is 100`
                );
                return await this.foundInIndex(content, textToSearch, documentId, words, textType);
            }

            const minFoundWordsNumber = ceil((words.length * this.searchOptions.minScore) / 100);

            this.log.debug(
                `${documentId} | Number of search words: ${words.length} | Min score: ${this.searchOptions.minScore} | Min matched number of words: ${minFoundWordsNumber}`
            );

            if (minFoundWordsNumber === words.length) {
                this.log
                    .debug(`${documentId} | We search all words since the minimum number of search words according to score
                is matched with initial count`);
                return await this.foundInIndex(content, textToSearch, documentId, words, textType);
            }

            return await this.findTextWithMinimalWords(
                minFoundWordsNumber,
                words,
                documentId,
                content,
                textToSearch,
                textType
            );
        } catch (e) {
            this.log.error('An error occurred during indexAndSearch');
            this.log.error(e);
            throw e;
        } finally {
            try {
                if (DO_DOCUMENTS_DELETE && documentId) {
                    this.log.debug(`Deleting of the ${documentId} document`);
                    await this.esClient.delete({
                        index: this.options.esSearchIndex!,
                        id: documentId
                    });
                } else {
                    this.log.debug(`Indexed ${documentId} document has not been deleted`);
                }
            } catch (err) {
                this.log.error(`${documentId} | The error occurred during deleting`);
            }
        }
    }

    private extractPhrases(
        content: string,
        foundPrePhrases: FoundEntity[],
        foundPostPhrases: FoundEntity[]
    ): string[] {
        const extractedPhrases: string[] = [];
        let prePhrases = foundPrePhrases;
        let postPhrases = foundPostPhrases;

        while (prePhrases.length) {
            const foundPrePhrase = prePhrases[0];
            postPhrases = postPhrases.filter(
                postPhrase => postPhrase.startOffset > foundPrePhrase.endOffset
            );
            if (postPhrases.length) {
                extractedPhrases.push(
                    content.substring(foundPrePhrase.endOffset, postPhrases[0].startOffset).trim()
                );
                prePhrases = prePhrases.filter(
                    prePhrase => prePhrase.startOffset > postPhrases[0].endOffset
                );
                postPhrases.splice(0, 1);
            } else {
                this.log.debug(
                    `Post phrases for '${JSON.stringify(foundPrePhrase)} pre phrase was not found`
                );
                return extractedPhrases;
            }
        }

        return extractedPhrases;
    }

    private joinFoundPhrases(extractedPhrases: string[]): string | undefined {
        if (extractedPhrases.length) {
            return extractedPhrases
                .map(phrase =>
                    removeStartEndPunctuationCharacters(
                        phrase,
                        START_OR_END_WITH_PUNCTUATION_SYMBOL_PATTERN
                    )
                )
                .join(JOIN_SYMBOL);
        }
        return undefined;
    }

    private async foundInIndex(
        content: string,
        textToSearch: string,
        documentId: string,
        searchWords: string[],
        textType: TextType
    ): Promise<FoundEntity[]> {
        this.log.debug('textToSearch: ' + textToSearch);
        this.log.debug(`${documentId} | Search word combination is`, searchWords);

        const spanNears = this.generateSpanNear(searchWords);

        const highlight = esb
            .highlight()
            .type('plain')
            .fragmentSize(HIGHLIGHT_FRAGMENT_SIZE)
            .fields([SEARCH_FIELD_NAME])
            .preTags(HIGHLIGHT_PRE_TAG)
            .postTags(HIGHLIGHT_POST_TAG);

        const query = esb
            .boolQuery()
            .filter(esb.idsQuery('_doc', [documentId]))
            .must(spanNears);

        const requestBody = esb
            .requestBodySearch()
            .explain(true)
            .source(false)
            .query(query)
            .highlight(highlight)
            .toJSON();

        try {
            const request = {
                index: this.options.esSearchIndex,
                ...requestBody
            };

            // Deleting an extra property to be compatible with the Elasticsearch v8
            // tslint:disable-next-line
            delete (request as any).query.bool.filter.ids.type;

            this.log.debug('Request: ' + JSON.stringify(request, undefined, 4));

            const result = await this.esClient.search(request);

            const hit: SearchHit = result.hits.hits.pop() as SearchHit;

            this.log.debug('Response:' + JSON.stringify(hit, undefined, 4));

            if (hit) {
                this.log.debug(
                    `${documentId} | Elasticsearch request ${JSON.stringify(requestBody)}`
                );

                const highlightedContent = hit.highlight![SEARCH_FIELD_NAME].pop()!;

                const positionsOfHighlightedEntities = getPositionTextBetweenPhrases(
                    highlightedContent,
                    HIGHLIGHT_PRE_TAG,
                    HIGHLIGHT_POST_TAG
                );

                this.log.debug(
                    'positionsOfHighlightedEntities: ' +
                        JSON.stringify(positionsOfHighlightedEntities, undefined, 4)
                );

                const highlightedTerms = getHighlightedTerms(
                    hit._explanation!.details[0].description,
                    SEARCH_FIELD_NAME
                ).filter(wordTerms => wordTerms.length);

                const flattenHighlightedTerms = _.flatten(highlightedTerms);

                this.log.debug('flattenHighlightedTerms: ', flattenHighlightedTerms);

                for (const highlightedEntity of positionsOfHighlightedEntities) {
                    if (!flattenHighlightedTerms.includes(highlightedEntity.text.toLowerCase())) {
                        await this.addedTermsForSynonyms(highlightedEntity, hit, highlightedTerms);
                    }
                }

                const terms = highlightedTerms;

                const firstWordPositions = this.getPositionEntity(content, terms[0], true);

                if (terms.length === 1) {
                    return firstWordPositions.map(position => ({
                        searchText: textToSearch,
                        searchWords,
                        foundText: content.substring(position.startPosition, position.endPosition),
                        startOffset: position.startPosition,
                        endOffset: position.endPosition,
                        accuracy: searchWords.length / textToSearch.split(' ').length,
                        textType
                    }));
                }

                this.log.debug(
                    `terms[terms.length - 2] ${JSON.stringify(
                        terms[terms.length - 2]
                    )} | terms[terms.length - 1] ${JSON.stringify(terms[terms.length - 1])}`
                );

                const { startPositions, previousPositions, nextPositions } =
                    this.findNearestPositions(
                        content,
                        terms,
                        firstWordPositions,
                        positionsOfHighlightedEntities
                    );

                return this.findEntitiesBasedOnPositions(
                    startPositions,
                    previousPositions,
                    nextPositions,
                    textType,
                    terms,
                    textToSearch,
                    searchWords,
                    content
                );
            }
            this.log.debug(`${documentId} | Content was not found`);
            return [];
        } catch (err) {
            this.log.error(
                `${documentId} | Elasticsearch request: ${JSON.stringify(
                    requestBody,
                    undefined,
                    4
                )}`
            );
            throw err;
        }
    }

    private findEntitiesBasedOnPositions(
        initialStartPositions: PositionEntity[],
        initialPreviousPositions: PositionEntity[],
        initialNextPositions: PositionEntity[],
        textType: TextType,
        terms: string[][],
        textToSearch: string,
        searchWords: string[],
        content: string
    ): FoundEntity[] {
        const foundEntities: FoundEntity[] = [];
        let startPositions = initialStartPositions;
        let previousPositions = initialPreviousPositions;
        let nextPositions = initialNextPositions;

        while (startPositions.length) {
            const startPosition = startPositions.splice(0, 1).pop();
            previousPositions = previousPositions.filter(
                previousPosition => previousPosition.startPosition > startPosition!.endPosition
            );
            if (previousPositions.length) {
                const previousPosition = previousPositions.splice(0, 1).pop();

                if (terms.length === 2) {
                    const foundEntity: FoundEntity = {
                        searchText: textToSearch,
                        searchWords,
                        foundText: content.substring(
                            startPosition!.startPosition,
                            previousPosition!.endPosition
                        ),
                        startOffset: startPosition!.startPosition,
                        endOffset: previousPosition!.endPosition,
                        accuracy: searchWords.length / textToSearch.split(' ').length,
                        textType
                    };
                    foundEntities.push(foundEntity);
                }

                nextPositions = nextPositions.filter(
                    nextPosition => nextPosition.startPosition > previousPosition!.endPosition
                );
                if (nextPositions.length) {
                    const nextPosition = nextPositions.splice(0, 1).pop();
                    startPositions = startPositions.filter(
                        position => position.startPosition > nextPosition!.endPosition
                    );
                    if (startPositions.length) {
                        previousPositions = previousPositions.filter(
                            position => position.startPosition > startPositions[0].endPosition
                        );
                    }
                    const foundEntity = {
                        searchText: textToSearch,
                        searchWords,
                        foundText: content.substring(
                            startPosition!.startPosition,
                            nextPosition!.endPosition
                        ),
                        startOffset: startPosition!.startPosition,
                        endOffset: nextPosition!.endPosition,
                        accuracy: searchWords.length / textToSearch.split(' ').length,
                        textType
                    };
                    foundEntities.push(foundEntity);
                }
            }
        }

        return foundEntities;
    }

    private getPositionEntity(
        content: string,
        terms: string[],
        isSymbolsAfter: boolean = false,
        isSymbolsBefore: boolean = false
    ): PositionEntity[] {
        return _.sortBy(
            _.flatten(
                terms.map(term => {
                    const startPositions = getPositions(
                        content,
                        term,
                        isSymbolsAfter,
                        isSymbolsBefore
                    );
                    return startPositions.map(startPosition => ({
                        term,
                        startPosition,
                        endPosition: startPosition + term.length
                    }));
                })
            ),
            positionEntity => positionEntity.startPosition
        );
    }

    private filterTerms(
        positionedEntities: PositionEntity[],
        allowedPositions: Position[]
    ): PositionEntity[] {
        return positionedEntities.filter(term =>
            _.find(
                allowedPositions,
                allowedPosition =>
                    term.startPosition >= allowedPosition.startPosition &&
                    term.endPosition <= allowedPosition.endPosition
            )
        );
    }

    /**
     * Index text to search in Elasticsearch
     *
     */
    private async indexTextToSearch(textToSearch: string): Promise<string> {
        try {
            const result: WriteResponseBase = await this.esClient.index({
                index: this.options.esSearchIndex!,
                refresh: 'wait_for',
                document: {
                    [SEARCH_FIELD_NAME]: textToSearch
                }
            });

            return result._id;
        } catch (e) {
            this.log.error('An error occurred during text indexing');
            this.log.error(e);
            throw e;
        }
    }

    private generateSpanNear(words: string[]): esb.SpanNearQuery {
        // Slop controls the maximum number of intervening unmatched positions permitted
        const slop = ceil((words.length - 1) * this.searchOptions.maxDistanceBetweenWords);

        this.log.debug(
            `maxDistanceBetweenWords: ${this.searchOptions.maxDistanceBetweenWords}, slop: ${slop}`
        );

        const clauses = words.map(word => {
            if (word.length > this.searchOptions.fuzzyMinSymbols) {
                const fuzzyQuery = esb
                    .fuzzyQuery(SEARCH_FIELD_NAME, word)
                    .fuzziness(this.searchOptions.fuzziness)
                    .prefixLength(this.searchOptions.fuzzyPrefixLength)
                    .transpositions(true)
                    .maxExpansions(this.searchOptions.fuzzyMaxExpansions);
                return esb.spanMultiTermQuery().match(fuzzyQuery);
            }
            return esb.spanTermQuery().field(SEARCH_FIELD_NAME).value(word);
        });

        return esb.spanNearQuery().clauses(clauses).slop(slop).inOrder(true);
    }

    /**
     *
     * Leave the position objects with the maximum end position for the group with the same start position
     *
     */
    private leavePositionEntitiesWithMaxEndPositionForGroupWithSameStartPosition(
        positionEntities: PositionEntity[]
    ): PositionEntity[] {
        const groupedByStartPositionWithMaxEndPosition = _.values(
            _.groupBy(positionEntities, 'startPosition')
        ).map(groupedByStartPosition => {
            const maxEndPositionInGroupOfStartPosition: PositionEntity = _.max(
                groupedByStartPosition,
                positionEntity => positionEntity.endPosition
            ) as PositionEntity;
            return groupedByStartPosition.filter(
                positionEntity =>
                    positionEntity.endPosition === maxEndPositionInGroupOfStartPosition.endPosition
            );
        });

        return _.flatten(groupedByStartPositionWithMaxEndPosition);
    }

    private async findTextWithMinimalWords(
        minFoundWordsNumber: number,
        words: string[],
        documentId: string,
        content: string,
        textToSearch: string,
        textType: TextType
    ): Promise<FoundEntity[]> {
        let results: FoundEntity[] = [];

        if (minFoundWordsNumber < words.length) {
            let actualSearchWordNumber = words.length;
            while (minFoundWordsNumber <= actualSearchWordNumber) {
                if (actualSearchWordNumber === words.length) {
                    this.log.debug(`${documentId} | Search by all words: ${String(words)}`);
                    const foundEntities: FoundEntity[] = await this.foundInIndex(
                        content,
                        textToSearch,
                        documentId,
                        words,
                        textType
                    );
                    if (foundEntities.length) {
                        this.log.debug(
                            `${documentId} | The search has been completed | result was found`
                        );
                        results = results.concat(foundEntities);
                        if (this.searchOptions.doesPhraseSearchOnlyOnceWithBestAccuracy) {
                            return results;
                        }
                    }
                    actualSearchWordNumber--;
                } else {
                    const wordCombinations = generateCombinations(words, actualSearchWordNumber--);
                    if (this.searchOptions.doesPhraseSearchOnlyOnceWithBestAccuracy) {
                        for (const wordCombination of wordCombinations) {
                            const foundEntities = await this.foundInIndex(
                                content,
                                textToSearch,
                                documentId,
                                wordCombination,
                                textType
                            );
                            if (foundEntities.length) {
                                results.concat(foundEntities);
                                this.log.debug(
                                    `${documentId} | The search has been completed | result was found`
                                );
                                return results;
                            }
                        }
                    } else {
                        for (const wordCombination of wordCombinations) {
                            const foundEntities = await this.foundInIndex(
                                content,
                                textToSearch,
                                documentId,
                                wordCombination,
                                textType
                            );
                            if (foundEntities.length) {
                                results = results.concat(foundEntities);
                                this.log.debug(
                                    `${documentId} | The search has been completed | result was found`
                                );
                            }
                        }
                    }
                }
            }

            this.log.debug(`${documentId} | The search has been completed | result was NOT found`);

            return results;
        }
        throw new Error('Wrong words number');
    }

    private findNearestPositions(
        content: string,
        terms: string[][],
        firstWordPositions: PositionEntity[],
        positionsOfHighlightedEntities: Position[]
    ): NearestPositionsResponse {
        const lastButOneWordPositions = this.getPositionEntity(
            content,
            terms[terms.length - 2],
            true
        );
        const lastWordPositions = this.getPositionEntity(
            content,
            terms[terms.length - 1],
            false,
            true
        );

        let startPositions = this.filterTerms(firstWordPositions, positionsOfHighlightedEntities);
        let previousPositions = this.filterTerms(
            lastButOneWordPositions,
            positionsOfHighlightedEntities
        );
        let nextPositions = this.filterTerms(lastWordPositions, positionsOfHighlightedEntities);

        if (terms.length === 2) {
            previousPositions = nextPositions;
        }

        startPositions =
            this.leavePositionEntitiesWithMaxEndPositionForGroupWithSameStartPosition(
                startPositions
            );
        previousPositions =
            this.leavePositionEntitiesWithMaxEndPositionForGroupWithSameStartPosition(
                previousPositions
            );
        nextPositions =
            this.leavePositionEntitiesWithMaxEndPositionForGroupWithSameStartPosition(
                nextPositions
            );

        return { startPositions, previousPositions, nextPositions };
    }

    private async addedTermsForSynonyms(
        highlightedEntity: Position,
        hit: SearchHit,
        highlightedTerms: string[][]
    ): Promise<void> {
        this.log.info(
            `${highlightedEntity.text} found but not in highlighted terms. It can be a synonym.`
        );

        const termVectors = await this.esClient.termvectors({
            id: hit._id,
            index: this.options.esSearchIndex!
        });

        const terms = termVectors.term_vectors!.content.terms;

        const termVectorKeys = Object.keys(terms);
        for (const termVectorKey of termVectorKeys) {
            const startOffsets: number[] = terms[termVectorKey].tokens!.map(
                token => token.start_offset!
            );
            if (
                startOffsets.includes(highlightedEntity.startPosition) &&
                termVectorKey !== highlightedEntity.text
            ) {
                this.log.debug(`${highlightedEntity.text} is synonym of ${termVectorKey}`);
                for (const highlightedTerm of highlightedTerms) {
                    if (
                        highlightedTerm.includes(termVectorKey) &&
                        !highlightedTerm.includes(highlightedEntity.text)
                    ) {
                        highlightedTerm.push(highlightedEntity.text);
                    }
                }
            }
        }
    }

    private setFinalSearchOptions(searchOptions: SearchOptions | undefined) {
        if (searchOptions) {
            if (searchOptions.minScore) {
                this.searchOptions.minScore = searchOptions.minScore;
            }
            if (searchOptions.maxDistanceBetweenWords) {
                this.searchOptions.maxDistanceBetweenWords = searchOptions.maxDistanceBetweenWords;
            }
            if (searchOptions.fuzziness) {
                this.searchOptions.fuzziness = searchOptions.fuzziness;
            }
            if (searchOptions.fuzzyPrefixLength) {
                this.searchOptions.fuzzyPrefixLength = searchOptions.fuzzyPrefixLength;
            }
            if (searchOptions.fuzzyMaxExpansions) {
                this.searchOptions.fuzzyMaxExpansions = searchOptions.fuzzyMaxExpansions;
            }
            if (searchOptions.fuzzyMinSymbols) {
                this.searchOptions.fuzzyMinSymbols = searchOptions.fuzzyMinSymbols;
            }
            if (searchOptions.doesPhraseSearchOnlyOnceWithBestAccuracy !== undefined) {
                this.searchOptions.doesPhraseSearchOnlyOnceWithBestAccuracy =
                    searchOptions.doesPhraseSearchOnlyOnceWithBestAccuracy;
            }
        }
    }
}
