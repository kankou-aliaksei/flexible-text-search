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
import * as fs from 'fs';

import { FlexibleTextSearch } from '../../src';

const fts = new FlexibleTextSearch({
    esSearchIndex: 'text-search',
    esClientOptions: {
        node: 'https://localhost:9200',
        auth: {
            username: 'elastic',
            password: '<password>'
        },
        tls: {
            ca: fs.readFileSync('./http_ca.crt')
        }
    }
});
```

### HTTP connection

```
import { FlexibleTextSearch } from '../../src';

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
