#!/bin/bash

# Load authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get_token.sh"

API_URL="http://localhost:3004"

if [ -z "$1" ]; then
    echo "Usage: ./test_get_shipment.sh <shipping_id>"
    exit 1
fi

SHIPPING_ID=$1

echo "Testing Get Shipment Details..."
echo "Endpoint: $API_URL/shipping/$SHIPPING_ID"

curl -s -X GET "$API_URL/shipping/$SHIPPING_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | json_pp
