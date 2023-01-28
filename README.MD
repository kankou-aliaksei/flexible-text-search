# Flexible text search (flexible-text-search)

Flexible text search with search by part of a phrase, fuzzy for each word, and use of synonyms. Extract text between phrases.

## Prerequisites

* Node.js
* npm
* Elasticsearch

    The solution uses Elasticsearch. Therefore, you need to have an ElasticSearch instance running with a preset [index](elasticsearch/text_search_index.json).

| WARNING: Elasticseacrh is required |
|------------------------------------|

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

See examples in the [/tests](./tests) for all details.

### findText

It finds phrases in text

### doesTextExist

It checks if phrases exist in the text

# Test

## Prerequisites

* Docker

* npm i
* npm run test
