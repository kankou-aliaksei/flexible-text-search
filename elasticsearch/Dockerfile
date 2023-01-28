FROM elasticsearch:7.17.8

COPY synonyms.txt /usr/share/elasticsearch/config/synonyms/
COPY text_search_index.json /
COPY create_indexes_after_starting_elasticsearch.sh /

USER 0
RUN chmod +x /create_indexes_after_starting_elasticsearch.sh
RUN apt-get update -y
RUN apt-get install net-tools -y

EXPOSE 9200