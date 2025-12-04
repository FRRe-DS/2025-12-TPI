# Frontend E2E Tests Documentation

This directory contains documentation for the frontend End-to-End (E2E) tests located in `frontend/tests/e2e`. These tests use Playwright to verify the user interface and user flows.

## Test Files

### `auth.spec.ts`
**Purpose:** Verifies Keycloak authentication integration.
*   Checks the initial login page elements.
*   Tests the login flow (mocked or real depending on `USE_REAL_AUTH`).
*   Verifies session expiration handling.
*   Ensures the dashboard is accessible after authentication.

### `configuration.spec.ts`
**Purpose:** Tests the System Configuration page.
*   Verifies page load and title.
*   Checks for the presence and navigation of configuration tabs (Transport Methods, Coverage Zones, etc.).
*   Validates the presence of data tables and search functionality.

### `dashboard.spec.ts`
**Purpose:** Tests the main Dashboard functionality.
*   Verifies the dashboard loads with the correct title.
*   Checks for the presence of key metrics cards (Total Orders, Completed Orders, etc.).
*   Validates the visibility of charts (Monthly Deliveries, Zone Distribution).
*   Ensures the "Recent Orders" section is populated.
*   Tests the data refresh functionality.

### `homepage.spec.ts`
**Purpose:** Tests the Landing Page (Home).
*   Verifies the page loads correctly.
*   Checks for key elements like the "PEPACK" title and login button.
*   Validates responsive design elements (desktop vs. mobile layout).

### `pepack-real-tests.spec.ts`
**Purpose:** A comprehensive suite covering the "Real" system functionality.
*   **Navigation:** Verifies navigation between all major sections (Dashboard, Config, Operations, Reports).
*   **Responsive Design:** Tests layouts on Mobile (iPhone), Tablet, and Desktop viewports.
*   **Performance:** Checks page load times.
*   **Error Handling:** Ensures no critical JavaScript errors occur during navigation.
*   **Integration:** Validates interactive elements and content consistency.

### `pepack-working-tests.spec.ts`
**Purpose:** A baseline suite of tests known to be stable.
*   Verifies basic page loading and content presence.
*   Checks responsive design adaptation.
*   Validates basic navigation responsiveness.
*   Confirm "Demo Mode" functionality if applicable.

### `example.spec.ts`
**Purpose:** A practical example suite demonstrating Playwright capabilities within the PEPACK context.
*   Contains readable examples of how to test the Dashboard, Configuration, and Responsive design.

### `debug-page.spec.ts`
**Purpose:** Utilities for debugging.
*   Captures screenshots of the Homepage and Dashboard.
*   Logs page content to the console for inspection.
*   Useful for diagnosing rendering issues in CI/CD or headless modes.

### `playwright-demo.spec.ts`
**Purpose:** General Playwright demonstration.
*   Runs tests against `example.com` to verify Playwright itself is working correctly, independent of the PEPACK application.
*   Demonstrates basic assertions, interactions, and screenshots.

## Running Tests

To run the frontend tests:

```bash
cd frontend
# Run all tests
pnpm exec playwright test

# Run a specific test file
pnpm exec playwright test tests/e2e/homepage.spec.ts

# Run in a specific browser
pnpm exec playwright test --project=chromium
```

Configuration is handled via `playwright.config.ts` and `frontend/tests/.env`.
