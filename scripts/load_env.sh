#!/bin/bash

# Common script to load environment variables
# This file provides a centralized way to load environment variables for all test scripts

# Prevent multiple loads of this script
if [ -n "${_ENV_LOADED:-}" ]; then
    return 0 2>/dev/null || true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env if it exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    # Export variables, ignoring comments and empty lines
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | grep -v '^$' | xargs)
fi

# Mark as loaded
export _ENV_LOADED=1

# Default values for common variables (only if not already set)
export API_URL="${API_URL:-http://localhost:3004}"
export STOCK_API_URL="${STOCK_API_URL:-https://comprasg5.mmalgor.com.ar}"
export KEYCLOAK_URL="${KEYCLOAK_URL:-https://keycloak.mmalgor.com.ar}"
export REALM="${REALM:-ds-2025-realm}"
export CLIENT_ID="${CLIENT_ID:-grupo-12}"

# CLIENT_SECRET is optional - only set default if not provided
# No default value for security reasons

# Optional: Print loaded configuration (disabled by default, enable with VERBOSE=1)
if [ "$VERBOSE" = "1" ]; then
    echo "🔧 Configuration loaded:" >&2
    echo "   API_URL: $API_URL" >&2
    echo "   STOCK_API_URL: $STOCK_API_URL" >&2
    echo "   KEYCLOAK_URL: $KEYCLOAK_URL" >&2
    echo "   REALM: $REALM" >&2
    echo "   CLIENT_ID: $CLIENT_ID" >&2
    if [ -n "$CLIENT_SECRET" ]; then
        echo "   CLIENT_SECRET: [set]" >&2
    fi
fi
