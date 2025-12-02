#!/bin/bash

# Load authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get_token.sh"

# Check if STOCK_API_URL is set
if [ -z "$STOCK_API_URL" ]; then
    echo "Error: STOCK_API_URL is not set in .env"
    exit 1
fi

echo "Testing List Products from Stock API..."
echo "Endpoint: $STOCK_API_URL/productos"

curl -s -L -X GET "$STOCK_API_URL/productos" \
  -H "Content-Type: application/json" | json_pp
