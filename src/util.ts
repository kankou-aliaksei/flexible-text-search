import occurrences from 'occurrences';
import { Occurrence, Position } from './types';
import replaceAll from 'replaceall';

/**
 *
 * Generate all combinations of an array elements with minimum elements number in a combination
 *
 */
export const generateCombinations = (sourceArray: string[], comboLength: number): string[][] => {
    const sourceLength = sourceArray.length;
    if (comboLength > sourceLength) {
        return [];
    }

    const combos: string[][] = []; // Stores valid combinations as they are generated.

    /* Accepts a partial combination, an index into sourceArray,
    and the number of elements required to be added to create a full-length combination.
    Called recursively to build combinations, adding subsequent elements at each call depth. */
    const makeNextCombos = (
        workingCombo: string[],
        currentIndex: number,
        remainingCount: number
    ): void => {
        const oneAwayFromComboLength: boolean = remainingCount === 1;

        // For each element that remains to be added to the working combination.
        for (let sourceIndex: number = currentIndex; sourceIndex < sourceLength; sourceIndex++) {
            // Get next (possibly partial) combination.
            const next: string[] = [...workingCombo, sourceArray[sourceIndex]];

            if (oneAwayFromComboLength) {
                // Combo of right length found, save it.
                combos.push(next);
            } else {
                // Otherwise go deeper to add more elements to the current partial combination.
                makeNextCombos(next, sourceIndex + 1, remainingCount - 1);
            }
        }
    };

    makeNextCombos([], 0, comboLength);
    return combos;
};

export const removeStartEndPunctuationCharacters = (text: string, regExp: RegExp): string => {
    let resultText: string = text;
    const regex: RegExp = RegExp(regExp);
    while (regex.test(resultText)) {
        resultText = resultText.replace(regex, '');
    }
    return resultText.trim();
};

export const getOccurrences = (content: string, searchText: string): Occurrence => {
    // tslint:disable-next-line
    return occurrences(content, searchText, result => result);
};

export const getPositionTextBetweenPhrases = (
    text: string,
    beforeText: string,
    afterText: string
): Position[] => {
    // tslint:disable-next-line
    const textWithoutAfterText: string = replaceAll(afterText, '', text);
    const startPositions: number[] = getOccurrences(textWithoutAfterText, beforeText).positions.map(
        (value, index) => value - index * beforeText.length
    );
    // tslint:disable-next-line
    const textWithoutBeforeText: string = replaceAll(beforeText, '', text);
    const endPositions: number[] = getOccurrences(textWithoutBeforeText, afterText).positions.map(
        (value, index) => value - index * afterText.length
    );
    return startPositions.map((startPosition, index) => ({
        startPosition,
        endPosition: endPositions[index],
        // tslint:disable-next-line
        text: replaceAll(beforeText, '', textWithoutAfterText).substring(
            startPosition,
            endPositions[index]
        )
    }));
};

export const getPositions = (
    content: string,
    pattern: string,
    isSymbolsAfter: boolean,
    isSymbolsBefore: boolean
): number[] => {
    if (isSymbolsAfter && isSymbolsBefore) {
        const regPattern = `\[.,\\/#!$%\\\\^&*;:{}=\\-_\`~()\\s\]${pattern}\[.,\\/#!$%\\\\^&*;:{}=\\-_\`~()\\s\]`;
        return [...content.matchAll(new RegExp(regPattern, 'gi'))].map(e => e.index! + 1);
    }
    if (isSymbolsAfter) {
        const regPattern = `${pattern}\[.,\\/#!$%\\\\^&*;:{}=\\-_\`~()\\s\]`;
        return [...content.matchAll(new RegExp(regPattern, 'gi'))].map(e => e.index!);
    }
    if (isSymbolsBefore) {
        const regPattern = `\[.,\\/#!$%\\\\^&*;:{}=\\-_\`~()\\s\]${pattern}`;
        return [...content.matchAll(new RegExp(regPattern, 'gi'))].map(e => e.index! + 1);
    }

    return [...content.matchAll(new RegExp(pattern, 'gi'))].map(e => e.index!);
};
