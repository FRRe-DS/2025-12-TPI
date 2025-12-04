#!/bin/bash

# Load common environment variables and authentication
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/load_env.sh"
source "$SCRIPT_DIR/get_token.sh"

# STOCK_API_URL is already loaded from load_env.sh (default: https://comprasg5.mmalgor.com.ar)

echo "Testing List Products from Stock API..."
echo "Endpoint: $STOCK_API_URL/productos"

# ACCESS_TOKEN is already loaded from get_token.sh
curl -s -L -X GET "$STOCK_API_URL/productos" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | json_pp
