import { FoundEntity, PopulateFuzzyTermsBucketResponse } from './types';

export const leaveOneFoundEntityWithBestAccuracyForEachRange = (
    foundEntities: FoundEntity[]
): FoundEntity[] => {
    let i = 0;
    while (i < foundEntities.length - 1) {
        const isRangeSame =
            foundEntities[i].startOffset === foundEntities[i + 1].startOffset ||
            foundEntities[i].endOffset === foundEntities[i + 1].endOffset;
        if (isRangeSame) {
            if (foundEntities[i].accuracy >= foundEntities[i + 1].accuracy) {
                foundEntities.splice(i + 1, 1);
            } else {
                foundEntities.splice(i, 1);
            }
        } else if (
            foundEntities[i].startOffset <= foundEntities[i + 1].startOffset &&
            foundEntities[i].endOffset >= foundEntities[i + 1].endOffset
        ) {
            foundEntities.splice(i + 1, 1);
        } else if (
            foundEntities[i + 1].startOffset <= foundEntities[i].startOffset &&
            foundEntities[i + 1].endOffset >= foundEntities[i].endOffset
        ) {
            foundEntities.splice(i, 1);
        } else {
            i++;
        }
    }
    return foundEntities;
};

export const convertRawTermsToStructural = (
    foundTermsResponse: string[],
    description: string,
    spanNearPrefix: string,
    searchFieldName: string
): string[][] => {
    const terms: string[][] = [];
    const termPrefix = ` ${searchFieldName}:`;
    const startFuzzyTermPrefix = ` spanOr([${searchFieldName}:`;
    const fuzzyTermSuffix = '])';
    const endTermsFuzzy = '])]';
    const endTermsSimple = ']';
    let isSimpleTerm = true;
    let fuzzyTermsBucket: string[] = [];

    foundTermsResponse[0] = foundTermsResponse[0].replace(spanNearPrefix, ' ');

    for (const termsString of foundTermsResponse) {
        if (termsString.startsWith(termPrefix)) {
            if (isSimpleTerm) {
                if (termsString.endsWith(endTermsSimple)) {
                    terms.push([termsString.replace(termPrefix, '').replace(endTermsSimple, '')]);
                    break;
                }
                terms.push([termsString.replace(termPrefix, '')]);
            } else {
                const populateFuzzyTermsBucketRes = populateFuzzyTermsBucketResponse(
                    termPrefix,
                    termsString,
                    endTermsFuzzy,
                    fuzzyTermsBucket,
                    terms,
                    fuzzyTermSuffix
                );

                fuzzyTermsBucket = populateFuzzyTermsBucketRes.fuzzyTermsBucket;
                if (populateFuzzyTermsBucketRes.isSimpleTerm) {
                    isSimpleTerm = populateFuzzyTermsBucketRes.isSimpleTerm;
                }
                if (!populateFuzzyTermsBucketRes.isContinued) {
                    break;
                }
            }
        } else if (termsString.startsWith(startFuzzyTermPrefix)) {
            isSimpleTerm = false;

            const populateFuzzyTermsBucketRes = populateFuzzyTermsBucketResponse(
                startFuzzyTermPrefix,
                termsString,
                endTermsFuzzy,
                fuzzyTermsBucket,
                terms,
                fuzzyTermSuffix
            );

            fuzzyTermsBucket = populateFuzzyTermsBucketRes.fuzzyTermsBucket;
            if (populateFuzzyTermsBucketRes.isSimpleTerm) {
                isSimpleTerm = populateFuzzyTermsBucketRes.isSimpleTerm;
            }
            if (!populateFuzzyTermsBucketRes.isContinued) {
                break;
            }
        } else {
            throw new Error(`Unknown term (${termsString}) type for description: ${description}`);
        }
    }

    return terms;
};

const populateFuzzyTermsBucketResponse = (
    termPrefix: string,
    termsString: string,
    endTermsFuzzy: string,
    fuzzyTermsBucketInput: string[],
    terms: string[][],
    fuzzyTermSuffix: string
): PopulateFuzzyTermsBucketResponse => {
    let isSimpleTerm: boolean | undefined;
    let isContinued = true;
    let fuzzyTermsBucketOutput = fuzzyTermsBucketInput;

    if (termsString.endsWith(endTermsFuzzy)) {
        fuzzyTermsBucketOutput.push(termsString.replace(termPrefix, '').replace(endTermsFuzzy, ''));
        terms.push(fuzzyTermsBucketOutput);
        isContinued = false;
    } else if (termsString.endsWith(fuzzyTermSuffix)) {
        fuzzyTermsBucketOutput.push(
            termsString.replace(termPrefix, '').replace(fuzzyTermSuffix, '')
        );
        terms.push(fuzzyTermsBucketOutput);
        fuzzyTermsBucketOutput = [];
        isSimpleTerm = true;
    } else {
        fuzzyTermsBucketOutput.push(termsString.replace(termPrefix, ''));
    }

    return {
        isContinued,
        isSimpleTerm,
        fuzzyTermsBucket: fuzzyTermsBucketOutput
    };
};

/**
 *
 * Return terms that were found in response to a search for individual words from a search phrase.
 *  Because for one word from a search phrase, several terms can be found, the result is a two-dimensional array.
 *  Example [0][] - is array of terms that were found for first (index is 0) individual word from a search phrase
 *
 */
export const getHighlightedTerms = (description: string, searchFieldName: string): string[][] => {
    const descForOneSearchWordWithOneResultPrefix = `weight(${searchFieldName}:`;
    const descForOneSearchWordWithFewResultPrefix = 'weight(spanOr([';
    const spanNearPrefix = 'weight(spanNear([';

    const foundTermsResponse: string[] = description.split(',');

    if (description.startsWith(descForOneSearchWordWithOneResultPrefix)) {
        const term = description.split(':')[1].split(' ')[0];
        return [[term]];
    }
    if (description.startsWith(descForOneSearchWordWithFewResultPrefix)) {
        const bucket: string[] = [];
        foundTermsResponse[0] = foundTermsResponse[0].replace(
            descForOneSearchWordWithFewResultPrefix,
            ' '
        );

        for (const termsString of foundTermsResponse) {
            if (termsString.endsWith('[PerFieldSimilarity]')) {
                bucket.push(termsString.split(':').pop()!.split('])')[0]);
                break;
            }
            if (termsString.startsWith(` ${searchFieldName}:`)) {
                bucket.push(termsString.split(':').pop()!);
            } else {
                throw new Error(
                    `The matched terms description (${description}) which started with: ${descForOneSearchWordWithFewResultPrefix} has unrecognized structure`
                );
            }
        }

        return [bucket];
    }
    if (description.startsWith(spanNearPrefix)) {
        return convertRawTermsToStructural(
            foundTermsResponse,
            description,
            spanNearPrefix,
            searchFieldName
        );
    }
    throw new Error(`The description has unrecognized head | ${description}`);
};
