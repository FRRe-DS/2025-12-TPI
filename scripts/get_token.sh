#!/bin/bash

# Load common environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/load_env.sh"

# Configuration (defaults already loaded from load_env.sh)
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

# Build curl command with optional client_secret
CURL_DATA="client_id=$CLIENT_ID"
CURL_DATA="$CURL_DATA&username=$TEST_USER"
CURL_DATA="$CURL_DATA&password=$TEST_PASSWORD"
CURL_DATA="$CURL_DATA&grant_type=password"
CURL_DATA="$CURL_DATA&scope=openid"

# Add client_secret if provided
if [ -n "$CLIENT_SECRET" ]; then
    CURL_DATA="$CURL_DATA&client_secret=$CLIENT_SECRET"
fi

RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "$CURL_DATA")

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
