#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
NC='\033[0m'

echo -e "${ORANGE}Cleaning all containers and volumes${NC}" && \
docker-compose down && \
docker volume prune -f
