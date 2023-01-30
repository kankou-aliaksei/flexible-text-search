#!/bin/sh

while [ $# -gt 0 ]; do
  case "$1" in
    -protocol|--protocol)
      protocol="$2"
      ;;
    -port|--port)
      port="$2"
      ;;
    -password|--password)
      password="$2"
      ;;
    *)
      printf "***************************\n"
      printf "* Error: Invalid argument.*\n"
      printf "***************************\n"
      exit 1
  esac
  shift
  shift
done

docker_memory="500m"
es_name="es_${protocol}_test"

docker build --build-arg ELASTIC_PASSWORD=$password -t $es_name -f elasticsearch/docker/$protocol/Dockerfile elasticsearch/docker
container_id=$(docker run --name $es_name -m $docker_memory -d -p $port:9200 -e "discovery.type=single-node" -it $es_name)
declare -x container_id_$protocol=$container_id
docker exec -it $container_id sh -c "cd / && ./create_indexes_after_starting_elasticsearch.sh ${protocol} ${password}" || exit 1
if [[ "$protocol" == "https" ]]
then
    echo Copying a cert
    docker cp $es_name:/usr/share/elasticsearch/config/certs/http_ca.crt tests
fi
