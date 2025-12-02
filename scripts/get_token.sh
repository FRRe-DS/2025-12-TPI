#!/bin/bash

# Load environment variables from .env if it exists
if [ -f "$(dirname "$0")/.env" ]; then
    export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

# Configuration (defaults if not in .env)
KEYCLOAK_URL="${KEYCLOAK_URL:-https://keycloak.mmalgor.com.ar}"
REALM="${REALM:-ds-2025-realm}"
CLIENT_ID="${CLIENT_ID:-grupo-12}"

# Check for environment variables
if [ -z "$TEST_USER" ] || [ -z "$TEST_PASSWORD" ]; then
    echo "Error: TEST_USER and TEST_PASSWORD environment variables must be set."
    echo "Please fill in the scripts/.env file or export them."
    exit 1
fi

echo "Authenticating with Keycloak..."
echo "User: $TEST_USER"
echo "URL: $KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token"

RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$CLIENT_ID" \
  -d "username=$TEST_USER" \
  -d "password=$TEST_PASSWORD" \
  -d "grant_type=password" \
  -d "scope=openid")

# Check if curl failed
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to Keycloak."
    exit 1
fi

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Error: Failed to obtain access token."
    echo "Response: $RESPONSE"
    exit 1
fi

echo "Successfully obtained access token."
echo "$ACCESS_TOKEN" > "$(dirname "$0")/.token"
export ACCESS_TOKEN
