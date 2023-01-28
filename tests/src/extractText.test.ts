import { FlexibleTextSearch } from '../../src/flexible-text-search';

const fts = new FlexibleTextSearch();

describe('extractText', () => {
    /**
     * text 1 PRE_PHRASE text 2 POST_PHRASE text 3 => text 2
     */
    it('should extract expected text for ... PRE_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum I am now going to start the recording session vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero the our meeting is over nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);

        const expectedExtractedText =
            'vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 text 3 => empty
     */
    it('should extract expected text for ... PRE_PHRASE ...', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate I am now going to start the recording session malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText = 'Not found';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 text 2 POST_PHRASE text 3 => empty
     */
    it('should extract expected text for ... POST_PHRASE ...', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis the our meeting is now over felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText = 'Not found';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 => text 2 PRE_PHRASE text 3
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ...', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est I am now going to start the recording session sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at I am going to do a recording session luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus the our meeting is over pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            'sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at I am going to do a recording session luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 POST_PHRASE text 3 POST_PHRASE text 4 => text 2
     */
    it('should extract expected text for ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE ...', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum I am now going to start the recording session vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie okay ipsum. Nunc tellus tellus, dapibus quis the our meeting is over felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            'vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 POST_PHRASE text 5 => text 2 PRE_PHRASE text 3
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum I am now going to start the recording session vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis I am going to do a recording session enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis the our meeting is now over neque gravida velit pharetra, non efficitur the our meeting is over arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            'vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis I am going to do a recording session enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 POST_PHRASE text 3 PRE_PHRASE text 4 POST_PHRASE text 5 => text 2;text 4
     */
    it('should extract expected text for ... PRE_PHRASE ... POST_PHRASE ... PRE_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer I'm going to do a recording session est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus the our meeting is over placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac I am now going to start the recording session maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non Okay molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            'est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus;maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 PRE_PHRASE text 5 POST_PHRASE => text 2 PRE_PHRASE text 3;text 5
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... PRE_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                "Lorem ipsum dolor sit amet, consectetur I'm now going to start the recording session adipiscing elit. Nulla libero est, consectetur a fringilla I'm going to do a recording session ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat the our meeting is now over neque a ornare efficitur. Nunc libero nulla, mattis nec mauris I am going to do a recording session sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque the our meeting is over gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            "adipiscing elit. Nulla libero est, consectetur a fringilla I'm going to do a recording session ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat;sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque";

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 PRE_PHRASE text 5 PRE_PHRASE text 6 POST_PHRASE => text 2 PRE_PHRASE text 3;text 5 PRE_PHRASE text 6
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                "Lorem ipsum dolor sit amet, I'm now going to start the recording session consectetur adipiscing elit. Nulla libero est, consectetur a I'm going to do a recording session fringilla ac, ornare vitae nisl. Sed semper the our meeting is over faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. I am going to do a recording session Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, I am now going to start the recording session nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum the our meeting is over vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            "consectetur adipiscing elit. Nulla libero est, consectetur a I'm going to do a recording session fringilla ac, ornare vitae nisl. Sed semper;Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, I am now going to start the recording session nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum";

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 POST_PHRASE text 5 PRE_PHRASE text 6 PRE_PHRASE text 7 POST_PHRASE => text 2 PRE_PHRASE text 3;text 6 PRE_PHRASE text 7
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                "Lorem ipsum dolor sit amet, consectetur I'm going to do a recording session adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin I'm going to do a recording session eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a okay tincidunt sodales, nunc nulla vehicula nibh, at the our meeting is now over luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar sed. I'm going to do a recording session Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis I'm going to do a recording session vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie the our meeting is over leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            "adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin I'm going to do a recording session eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a;Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis I'm going to do a recording session vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie";

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 POST_PHRASE text 5 PRE_PHRASE text 6 PRE_PHRASE text 7 POST_PHRASE text 8 POST_PHRASE => text 2 PRE_PHRASE text 3;text 6 PRE_PHRASE text 7
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                "Lorem ipsum I'm now going to start the recording session dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a I am now going to start the recording session fringilla ac, ornare vitae the our meeting is now over nisl. Sed semper faucibus vestibulum. Mauris eu the our meeting is over scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget I'm going to do a recording session varius interdum, consequat auctor felis. Sed I am going to do a recording session sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla the our meeting is over vehicula nibh, at luctus dolor nisi sed neque. Vestibulum vulputate malesuada tellus, a dictum sapien pulvinar the our meeting is now over sed. Vivamus placerat neque a ornare efficitur. Nunc libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            'dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a I am now going to start the recording session fringilla ac, ornare vitae;varius interdum, consequat auctor felis. Sed I am going to do a recording session sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });

    /**
     * text 1 PRE_PHRASE text 2 PRE_PHRASE text 3 POST_PHRASE text 4 POST_PHRASE text 5 PRE_PHRASE text 6 POST_PHRASE text 7 PRE_PHRASE text 8 POST_PHRASE text 9 POST_PHRASE => text 2 PRE_PHRASE text 3;text 6;text 8
     */
    it('should extract expected text for ... PRE_PHRASE ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE ... PRE_PHRASE ... POST_PHRASE ... PRE_PHRASE ... POST_PHRASE ... POST_PHRASE', async () => {
        const request = {
            content:
                "Lorem ipsum dolor sit amet, I'm now going to start the recording session consectetur adipiscing elit. Nulla libero I am now going to start the recording session est, consectetur a fringilla ac, the our meeting is over ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin the our meeting is now over eu magna turpis. Integer est sapien, faucibus eget varius I'm going to do a recording session interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam the our meeting is over a tincidunt sodales, nunc nulla vehicula nibh, at I am going to do a recording session luctus dolor nisi sed neque. Vestibulum vulputate malesuada okay tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc the our meeting is over libero nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
            prePhrases: [
                "I'm now going to start the recording session",
                'I am now going to start the recording session',
                "I'm going to do a recording session",
                'I am going to do a recording session'
            ],
            postPhrases: ['the our meeting is now over', 'the our meeting is over', 'okay'],
            foundTemplate: '${}',
            notFoundTemplate: 'Not found'
        };

        const result = await fts.extractText(request);
        const expectedExtractedText =
            'consectetur adipiscing elit. Nulla libero I am now going to start the recording session est, consectetur a fringilla ac;interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam;luctus dolor nisi sed neque. Vestibulum vulputate malesuada';

        expect(result.extractedText).toEqual(expectedExtractedText);
    });
});
