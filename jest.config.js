const tsPreset = require('ts-jest/jest-preset');

module.exports = {
    ...tsPreset,
    testEnvironment: 'node',
    testPathIgnorePatterns: ['dist'],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                outputDirectory: 'junit',
                outputName: 'report.xml',
            },
        ],
    ],
    //setupFiles: [
    //    './env.jest.js'
    //],
    testTimeout: 100000
};
