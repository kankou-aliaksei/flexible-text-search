#!/bin/bash

declare -a container_ids=($container_id_http $container_id_https)

for container_id in "${container_ids[@]}"
do
  docker stop $container_id
  docker rm $container_id
done
