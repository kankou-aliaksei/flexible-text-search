#!/bin/bash

# use while loop to check if elasticsearch is running
timeout_in_secs=60
sleep_in_secs=5
start_timestamp=$(date +%s)
index_name="text-search"
while true
do
    netstat -uplnt | grep :9200 | grep LISTEN > /dev/null
    verifier=$?
    if [ 0 = $verifier ]
        then
            echo "Indexes creation started"
            curl -d @text_search_index.json -H 'Content-Type: application/json' -X PUT http://127.0.0.1:9200/$index_name
            break
        else
            current_timestamp=$(date +%s)
            diff_in_secs=`expr $current_timestamp - $start_timestamp`
            echo diff_in_secs: $diff_in_secs

            if [ $diff_in_secs \> $timeout_in_secs ];
            then
                echo "Creating index timeout"
                exit 1
            fi;

            echo "Creating index is waiting for starting the Elasticsearch"
            sleep $sleep_in_secs
    fi
done