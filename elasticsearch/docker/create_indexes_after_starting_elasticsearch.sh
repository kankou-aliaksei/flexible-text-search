#!/bin/sh

protocol=$1
password=$2
index_name="text-search"
username="elastic"

timeout_in_secs=60
sleep_in_secs=5
start_timestamp=$(date +%s)
url="$protocol://127.0.0.1:9200/$index_name"
certificate_path="/usr/share/elasticsearch/config/certs/http_ca.crt"

https_opts_optional=""
if [ "$protocol" == "https" ]; then
    https_opts_optional="--cacert $certificate_path -u '$username:$password'"
fi

echo protocol: $protocol

curl_params="$https_opts_optional -d @text_search_index.json -H 'Content-Type: application/json' -X PUT $url"

while true
do
    netstat -uplnt | grep :9200 | grep LISTEN > /dev/null
    verifier=$?
    if [ 0 = $verifier ]
        then
            echo "Indexes creation started"
            sh -c "curl $curl_params"
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