import { ClientOptions } from '@elastic/elasticsearch/lib/client';

export interface ExtractTextRequest {
    content: string;
    prePhrases: string[];
    postPhrases: string[];
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

export interface FlexibleTextOptions {
    esSearchIndex?: string | undefined;
    logLevel?: LogLevel | undefined;
    esClientOptions?: ClientOptions | undefined;
}

export interface ExtractedTextEntity {
    content: string;
    phrasesToSearch: PhraseEntity[];
    extractedText: string | undefined;
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
