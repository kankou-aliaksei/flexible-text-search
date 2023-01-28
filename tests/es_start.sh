#!/bin/bash

DOCKER_SCAN_SUGGEST=false && docker build -t es_test elasticsearch || exit 1
export container_id=$(docker run --rm -d -p 9200:9200 -e "discovery.type=single-node" es_test) || exit 1
echo container_id: $container_id
docker exec -it $container_id sh -c "cd / && ./create_indexes_after_starting_elasticsearch.sh" || exit 1
