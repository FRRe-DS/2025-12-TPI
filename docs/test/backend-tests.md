# Backend E2E Tests Documentation

This directory contains documentation for the backend End-to-End (E2E) tests located in `backend/test-e2e`. These tests verify the integration between microservices, the API Gateway, and external services like Keycloak.

## Test Files

### `gateway.spec.ts`
**Purpose:** Verifies the API Gateway's security and routing functionality.

**Key Scenarios:**
*   **Authentication:** Authenticates with Keycloak to obtain a valid access token.
*   **Protected Routes:** Verifies that protected endpoints (e.g., `/config/transport-methods`) are accessible with a valid token.
*   **Security:** Confirms that access is denied (401 Unauthorized) when no token is provided.
*   **Tracking Creation:** Tests the integration endpoint for creating tracking information (`/api/logistics/tracking`), ensuring the gateway correctly forwards requests to the underlying services.

### `shipping-flow.spec.ts`
**Purpose:** Tests the complete internal shipping business flow.

**Key Scenarios:**
*   **Authentication:** Authenticates with Keycloak.
*   **Transport Methods:** Retrieves available transport methods from the system.
*   **Cost Calculation:** Calculates shipping costs based on origin, destination, and package details.
*   **Shipment Creation:** Attempts to create a new shipment and validates the response (accepting both 200 OK and 201 Created statuses).

## Running Tests

To run the backend E2E tests:

```bash
cd backend
pnpm test:e2e
```

Ensure you have the correct environment variables set in `backend/test-e2e/.env`.
