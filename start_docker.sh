#!/bin/bash
# Script to start the SpiralogicOracleSystem Docker stack

set -e

echo "=== Starting SpiralogicOracleSystem Docker Stack ==="

# Change to project directory
cd "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"
echo "Working directory: $(pwd)"

# Stop anything stale
echo "1. Stopping and removing any existing containers..."
docker compose -f docker-compose.yml down -v

# Build & start
echo "2. Building and starting containers..."
docker compose -f docker-compose.yml up -d --build

# See what started
echo "3. Container status:"
docker compose -f docker-compose.yml ps

echo "=== Stack startup complete! ==="
echo ""
echo "To follow logs, run:"
echo "  docker compose -f docker-compose.yml logs -f oracle-system"
echo ""
echo "To check health:"
echo "  curl -i http://localhost:3000/api/health"