#!/bin/bash

# Load common environment variables and authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/load_env.sh"
source "$SCRIPT_DIR/get_token.sh"

# API_URL is already loaded from load_env.sh (default: http://localhost:3004)

# if [ -z "$1" ]; then
#     echo "Usage: ./test_get_shipment.sh <shipping_id>"
#     exit 1
# fi

SHIPPING_ID=78db72d2-a0c2-4bb3-b76a-14f4952b1399

echo "Testing Get Shipment Details..."
echo "Endpoint: $API_URL/shipping/$SHIPPING_ID"

curl -s -X GET "$API_URL/shipping/$SHIPPING_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | json_pp
