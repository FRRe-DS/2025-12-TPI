#!/bin/bash

# Load common environment variables and authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/load_env.sh"
source "$SCRIPT_DIR/get_token.sh"

# API_URL is already loaded from load_env.sh (default: http://localhost:3004)

echo "Testing Create Shipment..."
echo "Endpoint: $API_URL/shipping"

# Sample Payload
PAYLOAD='{
  "order_id": 123,
  "user_id": 456,
  "delivery_address": {
    "street": "Av. Siempre Viva 123",
    "city": "Resistencia",
    "state": "Chaco",
    "postal_code": "H3500ABC",
    "country": "AR"
  },
  "transport_type": "road",
  "products": [
    {
      "id": 3,
      "quantity": 1
    },
    {
      "id": 9,
      "quantity": 2
    }
  ]
}'

echo "Payload: $PAYLOAD"

curl -s -X POST "$API_URL/shipping" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | json_pp
