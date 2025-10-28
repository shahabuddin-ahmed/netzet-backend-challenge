# Netzēt Backend Challenge

## Overview
Book Management REST API built with NestJS 11, TypeScript, and TypeORM.  
Core modules:

- **Authors** – CRUD endpoints, optional pagination/search, book association safeguards.
- **Books** – CRUD endpoints with ISBN uniqueness and author linkage.

The project targets MySQL in production, while automated tests use Jest with in-memory doubles for fast feedback.

---

## Requirements
- Docker & Docker Compose
- Node.js 22+ and Yarn (only needed if you intend to run lint/tests outside containers)

---

## Running the API

### Docker Compose (recommended)
```bash
docker compose up --build
```
- Spins up the API, MySQL 8, and phpMyAdmin (`http://localhost:8080`).
- Credentials default to the values in `docker-compose.yml`.
- Development image uses `Dockerfile.dev` with live reload and `synchronize=true` against the container MySQL instance.

Once the stack is healthy, the API is reachable at `http://localhost:3000/api/v1`.  
At that point you can import the Postman collection described below and start exercising the endpoints immediately.

---

## Testing

> Optional: requires `yarn install` on the host. Run outside Docker for faster feedback.

### Unit tests
```bash
yarn test --runInBand
```
Focuses on service-level logic with mocked persistence.

### End-to-end tests
```bash
yarn test:e2e --runInBand
```
Boots Nest with an in-memory implementation of `IDbEntityService` to exercise controllers, pipes, filters, and interceptors through HTTP.

Coverage artifacts are emitted under `coverage/`.

---

## Postman Collection
Import `postman/book-management.postman_collection.json` into Postman (or the Thunder Client importer).

---

## Useful Scripts
Available when running the project directly on the host (after `yarn install`):

| Command | Description |
| --- | --- |
| `yarn start:dev` | Run API in watch mode |
| `yarn start` | Run API without watch |
| `yarn build` | Compile to `dist/` |
| `yarn test` | Jest unit tests |
| `yarn test:e2e` | E2E tests |
| `yarn lint` | Lint & auto-fix |
| `docker compose up --build` | Full stack (API + MySQL + phpMyAdmin) |

---

## Preferred Production Stack
MySQL 8 + TypeORM (current configuration) is the target database setup.  
For managed cloud environments, Amazon RDS or Azure MySQL Flexible Server pairs well with this codebase. For lighter, file-based persistence during PoCs, SQLite could be swapped in via TypeORM with minimal configuration changes.

---
