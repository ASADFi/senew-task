#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Flash Deal API - Setup & Seed        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}\n"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Starting MongoDB and Redis containers...${NC}"
docker-compose up -d mongodb redis

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start containers${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Containers started${NC}\n"

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check MongoDB health
echo -e "${BLUE}Checking MongoDB...${NC}"
for i in {1..30}; do
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ MongoDB is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ MongoDB failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Check Redis health
echo -e "${BLUE}Checking Redis...${NC}"
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Redis failed to start${NC}"
        exit 1
    fi
    sleep 1
done

echo ""

# Run seed script
echo -e "${BLUE}🌱 Seeding database...${NC}\n"
node scripts/seed-docker.js

if [ $? -ne 0 ]; then
    echo -e "\n${RED}✗ Seeding failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}${BOLD}✓ Setup complete!${NC}\n"
echo -e "${CYAN}You can now:${NC}"
echo -e "  1. Start the API: ${GREEN}docker-compose up api${NC} or ${GREEN}npm run dev${NC}"
echo -e "  2. View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "  3. Test the API using the Product IDs above\n"
