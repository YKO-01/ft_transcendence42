#!/bin/bash
# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Use colors in echo
echo -e "${GREEN}Starting...${NC}"
docker-compose down
docker-compose up --build