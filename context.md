# Project Context

## Overview
This project is a logistics and tracking system designed with a microservices architecture. It manages shipping, stock integration, operator interfaces, and provides a tracking portal for customers.

## Architecture
The project follows a microservices architecture within a monorepo structure managed by pnpm workspaces.

### Backend Services
The backend is built with **NestJS** and consists of the following microservices:

1.  **Config Service** (`backend/services/config-service`)
    *   **Port:** 3003
    *   **Responsibility:** Manages configuration and fleet/vehicle data.
    *   **Database:** Uses the shared Prisma module.

2.  **Shipping Service** (`backend/services/shipping-service`)
    *   **Port:** 3001
    *   **Responsibility:** Handles shipping logic, cost calculation, and tracking.
    *   **Dependencies:** Redis, Config Service, Stock Integration Service.

3.  **Stock Integration Service** (`backend/services/stock-integration-service`)
    *   **Port:** 3002
    *   **Responsibility:** Integrates with external stock systems.
    *   **Dependencies:** Redis.

4.  **Operator Interface Service** (`backend/services/operator-interface-service`)
    *   **Port:** 3004
    *   **Responsibility:** Acts as an API Gateway/BFF (Backend for Frontend) for the operator frontend. Handles authentication with Keycloak.
    *   **Dependencies:** Config Service, Shipping Service, Stock Service.

### Shared Modules
*   **Database:** `backend/shared/database` - Contains the Prisma schema and client, shared across services.

### Frontend Applications
1.  **Frontend** (`frontend`)
    *   **Framework:** Next.js 16 + React 19
    *   **Port:** 3000
    *   **Responsibility:** Main operator interface.
    *   **Auth:** Keycloak integration.

2.  **Tracking Portal Next** (`tracking-portal-next`)
    *   **Framework:** Next.js
    *   **Port:** 3006
    *   **Responsibility:** Alternative/New version of the tracking portal.

## Infrastructure
*   **Docker & Docker Compose:** Used for containerization and orchestration.
*   **Database:** PostgreSQL (via Supabase in production/dev).
*   **Cache:** Redis.
*   **Authentication:** Keycloak.

## Key Observations & Potential Issues
1.  **Shared Database Library:** The services share a direct dependency on `@logistics/database`. While convenient in a monorepo, ensure that database migrations are managed carefully to avoid breaking changes across services.
2.  **Duplicate Tracking Portals:** The existence of both `tracking-portal` and `tracking-portal-next` suggests a migration or duplicate effort. Clarify which one is the source of truth.
3.  **Environment Variables:** `docker-compose.yml` contains hardcoded values for some environment variables (e.g., `NODE_ENV=production`). Ensure sensitive data is managed via `.env` files or secrets in a real production environment.
4.  **Service Communication:** Services communicate via HTTP (REST). Consider using a message broker (like RabbitMQ or Kafka) for asynchronous communication if the system scales or requires higher resilience.

## Commands
*   **Start all services:** `docker-compose up -d --build`
*   **Backend Dev:** `pnpm dev` (in `backend` directory)
*   **Frontend Dev:** `pnpm dev` (in `frontend` directory)
