#!/bin/bash

# Load authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get_token.sh"

API_URL="http://localhost:3004"

echo "Testing Get Transport Methods..."
echo "Endpoint: $API_URL/shipping/transport-methods"

curl -s -X GET "$API_URL/shipping/transport-methods" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | json_pp
