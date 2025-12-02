#!/bin/bash

# Load authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get_token.sh"

API_URL="http://localhost:3004"

if [ -z "$1" ]; then
    echo "Usage: ./test_cancel_shipment.sh <shipping_id>"
    exit 1
fi

SHIPPING_ID=$1

echo "Testing Cancel Shipment..."
echo "Endpoint: $API_URL/shipping/$SHIPPING_ID/cancel"

curl -s -X POST "$API_URL/shipping/$SHIPPING_ID/cancel" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | json_pp
