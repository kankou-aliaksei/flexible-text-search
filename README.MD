# Flexible text search (flexible-text-search)

Flexible text search with search by part of a phrase, fuzzy for each word, and use of synonyms. Extract text between phrases.

## Prerequisites

* Node.js
* npm
* Elasticsearch

    The solution uses Elasticsearch. Therefore, you need to have an ElasticSearch instance running with a preset [index](elasticsearch/docker/text_search_index.json).

| WARNING: Elasticsearch is required. |
|-------------------------------------|

## Elasticsearch support

Elasticsearch versions 7 and 8 are supported.

## Features

* Extracting text between phases
* Search by part of a phrase
* Fuzzy search (finding approximate matches) for each word
* Search by synonyms

## Search accuracy configuration (FlexibleTextOptions)

* **searchOptions** (Optional, SearchOptions)
  <br> Parameters affecting search accuracy.
  * **minScore** (Optional, integer, default: 60)
    <br> Min search accuracy in percentage.
    <br> We can specify search accuracy as a percentage. This means that a sufficient condition for finding a phrase
     will be finding a sufficient number of words from the phrase (for example, if the accuracy is 50%, and the
     phrase consists of 10 words, then it is enough to find any 5 words from the phrase in the order corresponding
     to the original phrase).
    <br> Valid values: 1-100
  * **maxDistanceBetweenWords** (Optional, float, default: 1.2)
    <br> Since the number of additional words is distributed throughout
    the phrase. For example, if we want a maximum of 1 additional word between two consecutive words in a phrase
    (maxDistanceBetweenWords is 1), then we mean that for a phrase 'one two three four', the worst case is
    'one additional_word_1 two additional_word_2 three additional_word_3 four', but in fact we have a credit of 3
    additional words per phrase (i.e. the 'one additional_word_1 additional_word_2 two three additional_word_3 four'
    option will also be acceptable). Therefore, keep this in mind and set the option that suits you.
  * **fuzziness** (Optional, string, default: 'AUTO')
    <br> The number of one character changes that need to be made to one string to make it the same as another string.
    <br> See [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#fuzziness)
    <br> Valid values: '0-2', 'AUTO', 'AUTO:[low],[high]'
  * **fuzzyPrefixLength** (Optional, integer, default: 0)
    <br> Number of beginning characters left unchanged when creating expansions.
    <br> See [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html)
  * **fuzzyMaxExpansions** (Optional, integer, default: 100)
    <br> Maximum number of variations created.
    <br> See [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-fuzzy-query.html)
  * **fuzzyMinSymbols** (Optional, integer, default: 3)
    <br> The minimum number of characters in a word for which fuzzy search will be applied.
  * **doesPhraseSearchOnlyOnceWithBestAccuracy** (Optional, boolean, default: false)
    <br> If the doesPhraseSearchOnlyOnceWithBestAccuracy is true, then the search for the phrase
     will be terminated immediately after finding the most relevant phrase. For example, a phrase
     consists of 10 words, the minScore is 50%, which means that it is enough to find at least 5 words.
     If a 9-word phrase is found and the doesPhraseSearchOnlyOnceWithBestAccuracy is true, the search
     will be completed. This is the fastest search, but it can lead to the fact that the phrase will not be found
     in other ranges (for example, if the phrase occurs again and consists of only 8 out of 10 search words).
     Use the doesPhraseSearchOnlyOnceWithBestAccuracy is true only if you are sure that the desired phrase
     occurs only once in the text.
* **esSearchIndex** (Optional, string, default: 'text-search')
  <br> A pre-configured elastic search index that is used for searching. See [index config](elasticsearch/docker/text_search_index.json)
* **logLevel** (Optional, integer, default: 3)
  <br> Log level.
  <br> Valid values: 0-6. 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
* **esClientOptions** (Optional, ClientOptions)
  <br> See [type definition](https://github.com/elastic/elasticsearch-js/blob/f90f4306c291865dcc470064b699fdc46a0ce7d6/src/client.ts#L80).
  <br> Default: { node: 'http://localhost:9200' }

## Methods

### extractText

It will be extracted if the text is between the pre-search phrase and the post-search phrase.

We can specify search accuracy as a percentage. See MIN_SCORE parameter.
As a result, the most relevant phrase for the given range will be returned (it is evident that the outcome of finding an expression by 9 words out of 10 is more relevant than 8 out of 10 for this range of search).

The search phrase can be found even if there are words not from the search phrase between the words in the found phrase (for example, the search phrase - 'hello world', the phrase - 'hello wonderful world' will be considered found).

Note - the number of additional words between words in the search phrase is set by the MAX_DISTANCE_BETWEEN_WORDS parameter (if the parameter is equal to 0, then the presence of additional words is excluded).

### findText

It finds phrases in text

### doesTextExist

It checks if phrases exist in the text

# Test

## Prerequisites

* Docker

## Usage

* npm i
* npm run test

## Example

See more examples in the [/tests](./tests/src).

### TLS connection

```
import { readFileSync } from 'fs';

import { FlexibleTextSearch } from 'flexible-text-search';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: 'https://localhost:9200',
        auth: {
            username: 'elastic',
            password: '<password>'
        },
        tls: {
            ca: readFileSync('./http_ca.crt')
        }
    }
});
```

### HTTP connection

```
import { FlexibleTextSearch } from 'flexible-text-search';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: 'http://localhost:9200'
    }
});
```

### extractText

```
import { FlexibleTextSearch } from 'flexible-text-search';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: 'http://localhost:9200'
    },
    searchOptions: {
        // 1-100
        minScore: 61,
        maxDistanceBetweenWords: 1.2
    }
});

const request = {
    content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum I am now going to start the recording session vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero the our meeting is over nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
    prePhrases: [
        "I'm now going to start the recording session",
        'I am now going to start the recording session',
        "I'm going to do a recording session",
        'I am going to do a recording session'
    ],
    postPhrases: ['the our meeting is now over', 'the our meeting is over']
};

const result = await fts.extractText(request);

console.log(JSON.stringify(result))
```

#### Result

```
{
   "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum I am now going to start the recording session vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero the our meeting is over nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.",
   "phrasesToSearch":[
      {
         "value":"I'm now going to start the recording session",
         "type":"PRE_PHRASE"
      },
      {
         "value":"I am now going to start the recording session",
         "type":"PRE_PHRASE"
      },
      {
         "value":"I'm going to do a recording session",
         "type":"PRE_PHRASE"
      },
      {
         "value":"I am going to do a recording session",
         "type":"PRE_PHRASE"
      },
      {
         "value":"the our meeting is now over",
         "type":"POST_PHRASE"
      },
      {
         "value":"the our meeting is over",
         "type":"POST_PHRASE"
      }
   ],
   "extractedText":"vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero",
   "foundPrePhrases":[
      {
         "searchText":"i am now going to start the recording session",
         "searchWords":[
            "i",
            "am",
            "now",
            "going",
            "to",
            "start",
            "the",
            "recording",
            "session"
         ],
         "foundText":"I am now going to start the recording session",
         "startOffset":423,
         "endOffset":468,
         "accuracy":1,
         "textType":"PRE_PHRASE"
      }
   ],
   "foundPostPhrases":[
      {
         "searchText":"the our meeting is over",
         "searchWords":[
            "the",
            "our",
            "meeting",
            "is",
            "over"
         ],
         "foundText":"the our meeting is over",
         "startOffset":582,
         "endOffset":605,
         "accuracy":1,
         "textType":"POST_PHRASE"
      }
   ]
}
```

### JavaScript

```
const { FlexibleTextSearch } = require('flexible-text-search');

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: 'http://localhost:9200'
    }
});

const request = {
    content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla libero est, consectetur a fringilla ac, ornare vitae nisl. Sed semper faucibus vestibulum. Mauris eu scelerisque nunc. Proin eu magna turpis. Integer est sapien, faucibus eget varius interdum, consequat auctor felis. Sed sit amet placerat tellus. Mauris fringilla, diam a tincidunt sodales, nunc nulla vehicula nibh, at luctus dolor nisi sed neque. Vestibulum I am now going to start the recording session vulputate malesuada tellus, a dictum sapien pulvinar sed. Vivamus placerat neque a ornare efficitur. Nunc libero the our meeting is over nulla, mattis nec mauris sed, porttitor molestie ipsum. Nunc tellus tellus, dapibus quis felis vel, blandit venenatis enim. Aenean ac cursus est. Curabitur rutrum ante ac maximus pharetra. Sed et iaculis felis, eget imperdiet ex. Fusce sit amet diam sed felis semper laoreet. Nulla facilisi. Quisque in molestie lectus, in finibus purus. Curabitur sagittis neque gravida velit pharetra, non efficitur arcu sodales. Integer non molestie leo. Ut eget ex sed tortor efficitur volutpat vitae sit amet neque.',
    prePhrases: [
        "I'm now going to start the recording session",
        'I am now going to start the recording session',
        "I'm going to do a recording session",
        'I am going to do a recording session'
    ],
    postPhrases: ['the our meeting is now over', 'the our meeting is over']
};

fts.extractText(request).then(result => console.log(JSON.stringify(result)));
```