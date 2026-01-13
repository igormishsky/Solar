#!/bin/bash
# Post-hook script: Build, run docker compose, and test the app

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "=== Solar Post-Hook Test ==="
echo "Building and testing docker compose setup..."

# Build and start the production container
echo "[1/4] Building docker image..."
docker compose build solar --quiet

echo "[2/4] Starting container..."
docker compose up -d solar

# Wait for the container to be healthy
echo "[3/4] Waiting for app to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|304"; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
        echo "ERROR: App failed to start within ${MAX_ATTEMPTS} seconds"
        docker compose logs solar
        docker compose down
        exit 1
    fi
    echo "  Waiting... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 1
done
echo "  App is ready!"

# Run quick smoke tests
echo "[4/4] Running smoke tests..."

# Test 1: Check if login page renders
LOGIN_RESPONSE=$(curl -s http://localhost:3001)
if echo "$LOGIN_RESPONSE" | grep -q "O.R.I SOLAR\|login\|Sign"; then
    echo "  [PASS] Login page renders correctly"
else
    echo "  [FAIL] Login page not rendering expected content"
    docker compose down
    exit 1
fi

# Test 2: Check for critical JS/CSS assets
if echo "$LOGIN_RESPONSE" | grep -q "script\|stylesheet"; then
    echo "  [PASS] Assets are loading"
else
    echo "  [WARN] Assets may not be loading correctly"
fi

# Test 3: Check container health
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' solar-app 2>/dev/null || echo "not found")
if [ "$CONTAINER_STATUS" = "running" ]; then
    echo "  [PASS] Container is running"
else
    echo "  [FAIL] Container status: $CONTAINER_STATUS"
    docker compose down
    exit 1
fi

echo ""
echo "=== All tests passed! ==="
echo "App is running at http://localhost:3001"

# Optionally stop containers (comment out to keep running)
# docker compose down
