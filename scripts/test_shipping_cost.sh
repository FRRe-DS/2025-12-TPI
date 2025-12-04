#!/bin/bash

# Load common environment variables and authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/load_env.sh"
source "$SCRIPT_DIR/get_token.sh"

# API_URL is already loaded from load_env.sh (default: http://localhost:3004)

echo "Testing Shipping Cost Calculation..."
echo "Endpoint: $API_URL/shipping/cost"

# Sample Payload
PAYLOAD='{
  "delivery_address": {
    "street": "Av. Siempre Viva 123",
    "city": "Resistencia",
    "state": "Chaco",
    "postal_code": "H3500ABC",
    "country": "AR"
  },
  "products": [
    {
      "id": 38,
      "quantity": 2
    },
    {
      "id": 39,
      "quantity": 1
    }
  ]
}'

echo "Payload: $PAYLOAD"

curl -s -X POST "$API_URL/shipping/cost" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | json_pp
