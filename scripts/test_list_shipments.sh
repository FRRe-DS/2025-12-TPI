#!/bin/bash

# Load common environment variables and authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/load_env.sh"
source "$SCRIPT_DIR/get_token.sh"

# API_URL is already loaded from load_env.sh (default: http://localhost:3004)

echo "Testing List Shipments..."
echo "Endpoint: $API_URL/shipping?page=1&limit=10"

curl -s -X GET "$API_URL/shipping?page=1&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | json_pp
