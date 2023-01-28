import { Explanation } from 'elasticsearch';

export interface ExtractTextRequest {
    content: string;
    prePhrases: string[];
    postPhrases: string[];
    foundTemplate: string;
    notFoundTemplate: string;
}

export interface FoundEntity {
    searchText: string;
    searchWords: string[];
    foundText: string;
    startOffset: number;
    endOffset: number;
    accuracy: number;
    textType: TextType;
}

export interface PhraseEntity {
    value: string;
    type: TextType;
}

export interface PositionEntity {
    term: string;
    startPosition: number;
    endPosition: number;
}

export type TextType = 'PRE_PHRASE' | 'POST_PHRASE' | 'TEXT';

export interface ElasticSearchApiOptions {
    host: string | undefined;
    port: number | undefined;
    timeout: number | undefined;
}

export interface ExtractTextOptions {
    esHost: string | undefined;
    esPort: number | undefined;
    esSearchIndex: string | undefined;
    logLevel: LogLevel | undefined;
    esTimeout: number | undefined;
}

export interface ExtractedTextEntity {
    content: string;
    phrasesToSearch: PhraseEntity[];
    foundTemplate: string;
    notFoundTemplate: string;
    extractedText: string;
    foundPrePhrases: FoundEntity[];
    foundPostPhrases: FoundEntity[];
}

export interface NearestPositionsResponse {
    startPositions: PositionEntity[];
    previousPositions: PositionEntity[];
    nextPositions: PositionEntity[];
}

export interface Occurrence {
    positions: number[];
    count: number;
}

export interface Position {
    startPosition: number;
    endPosition: number;
    text: string;
}

export enum LogLevel {
    Silly = 0,
    Trace,
    Debug,
    Info,
    Warn,
    Error,
    Fatal
}

export interface FindTextRequest {
    content: string;
    phrases: string[];
}

export interface PopulateFuzzyTermsBucketResponse {
    isContinued: boolean;
    isSimpleTerm: boolean | undefined;
    fuzzyTermsBucket: string[];
}

export interface IndexDocument {
    content: string;
}