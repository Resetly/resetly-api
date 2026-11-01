# Resetly API

Backend REST API for **Resetly**, a habit-transformation mobile app designed to help users break unwanted habits, track daily check-ins, and record setbacks without losing historical progress.

> **Note**: This repository contains backend services only. The mobile application (React Native + Expo) lives in a separate repository.

---

## Non-Negotiable Product & Architectural Principles

1. **Derived Streaks**: A setback must never erase historical progress. A "current streak" counter is **NEVER** stored in the database. Streaks, milestones, and success rates are computed dynamically from immutable check-in records (`modules/progress/streak.util.ts`).
2. **Authenticity**: Never fabricate statistics or user progress.
3. **Privacy First**: Collect only necessary data. Habit names are never leaked in push notifications or logs. All foreign keys cascade down from the `users` table so account deletion is an atomic, complete wipe.
4. **Empowering, Non-Judgmental Language**: No shame-based language in any API message, validation feedback, or error response.
5. **Strict User Scoping**: Every business logic service method takes `userId` as its first parameter and scopes all queries by it. Accessing another user's resource always returns `404 Not Found` (never `403`).

---

## Tech Stack

- **Runtime & Language**: Node.js 22 LTS, TypeScript with `strict: true`, pnpm
- **Framework**: NestJS (v11) with the **Fastify adapter** (`@nestjs/platform-fastify`)
- **Database & ORM**: PostgreSQL (plain Postgres; Neon in cloud dev) with **Drizzle ORM** + `drizzle-kit` (`postgres` driver)
- **Validation & OpenAPI**: Zod for all request/response validation via `nestjs-zod`, integrated with `@nestjs/swagger`
- **Security & Reliability**: `@fastify/helmet`, `@fastify/cors` with origin allowlist, `@nestjs/throttler` (default and strict rate limits), global `AuthGuard`
- **Background Tasks**: `@nestjs/schedule` registered for future reminder and cleanup jobs
- **Testing**: Jest unit tests and Supertest e2e tests
- **Tooling**: ESLint, Prettier, Husky, lint-staged, multi-stage Dockerfile, Docker Compose

---

## Project Structure

```
resetly-api/
├── src/
│   ├── main.ts                  # Fastify bootstrap, helmet, cors, pipes, swagger
│   ├── app.module.ts            # Root module wiring config, db, throttler, guards
│   ├── swagger.ts               # Shared OpenAPI document configuration
│   ├── config/                  # Zod-validated environment schema & typed service
│   ├── common/
│   │   ├── decorators/          # @Public(), @CurrentUser()
│   │   ├── guards/              # Global AuthGuard (JWT Bearer verification)
│   │   ├── filters/             # GlobalExceptionFilter (clean error response shape)
│   │   ├── interceptors/        # LoggingInterceptor (zero PII in logs)
│   │   └── types/
│   ├── database/
│   │   ├── database.module.ts   # Provides Drizzle client via DRIZZLE_CLIENT token
│   │   ├── migrate.ts           # Migration runner script
│   │   ├── schema/              # Drizzle table schemas (users, habits, journeys, check_ins, etc.)
│   │   └── migrations/          # Generated SQL migrations
│   ├── modules/
│   │   ├── health/              # GET /v1/health (public DB connectivity check)
│   │   ├── auth/                # Auth scaffold with session check and strict rate limiting
│   │   ├── users/               # User profile module shell
│   │   ├── habits/              # Reference vertical slice (full CRUD, user-scoped)
│   │   ├── journeys/            # Habit journeys module shell
│   │   ├── check-ins/           # Check-in logging module shell
│   │   ├── progress/            # Pure streak calculation utilities & progress API
│   │   ├── notifications/       # Device push token registration
│   │   └── account/             # Privacy data wipe & account deletion
│   └── scripts/
│       └── export-openapi.ts    # Headless OpenAPI export script
├── test/                        # Supertest end-to-end test suite
├── drizzle.config.ts            # Drizzle Kit configuration
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Local PostgreSQL service
├── .env.example                 # Environment variable templates
└── openapi.json                 # Exported OpenAPI 3.0 specification
```

---

## Environment Variables

| Variable            | Type     | Default                                       | Description                                                       |
| :------------------ | :------- | :-------------------------------------------- | :---------------------------------------------------------------- |
| `NODE_ENV`          | `enum`   | `development`                                 | Environment (`development`, `production`, `test`)                 |
| `PORT`              | `number` | `3000`                                        | HTTP port for Fastify server                                      |
| `DATABASE_URL`      | `string` | _(Required)_                                  | PostgreSQL connection URL                                         |
| `CORS_ORIGINS`      | `string` | `http://localhost:3000,http://localhost:8081` | Comma-separated allowlist of origins                              |
| `JWT_ACCESS_SECRET` | `string` | _(Required, >=16 chars)_                      | Secret key for verifying JWT access tokens                        |
| `JWT_ACCESS_TTL`    | `string` | `15m`                                         | Lifetime of access tokens                                         |
| `LOG_LEVEL`         | `enum`   | `info`                                        | Log severity (`fatal`, `error`, `warn`, `info`, `debug`, `trace`) |
| `EXPO_ACCESS_TOKEN` | `string` | _(Optional)_                                  | Access token for Expo Push Notification API                       |

---

## Getting Started

### 1. Prerequisites

- **Node.js**: v22 LTS (e.g. `v22.22.x`)
- **pnpm**: v12.x or v10.x (`npm install -g pnpm`)
- **Docker**: Docker Desktop or Docker Engine (for local PostgreSQL)

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/Resetly/resetly-api.git
cd resetly-api

# Install dependencies and initialize git hooks
pnpm install

# Copy environment variables
cp .env.example .env

# Start local PostgreSQL container
docker compose up -d

# Run database migrations
pnpm db:migrate

# Start the development server
pnpm start:dev
```

The API will be available at: `http://localhost:3000/v1`

---

## Available Scripts

| Script                | Command                                 | Description                                  |
| :-------------------- | :-------------------------------------- | :------------------------------------------- |
| `pnpm start:dev`      | `nest start --watch`                    | Start development server with file watching  |
| `pnpm build`          | `nest build`                            | Compile TypeScript to `dist/`                |
| `pnpm start:prod`     | `node dist/src/main`                    | Run production build                         |
| `pnpm typecheck`      | `tsc --noEmit`                          | Check TypeScript types without emitting code |
| `pnpm lint`           | `eslint "{src,test}/**/*.ts"`           | Lint TypeScript codebase                     |
| `pnpm lint:fix`       | `eslint "{src,test}/**/*.ts" --fix`     | Automatically fix linting issues             |
| `pnpm test`           | `jest`                                  | Run all Jest unit tests                      |
| `pnpm test:e2e`       | `jest --config ./test/jest-e2e.json`    | Run Supertest end-to-end tests               |
| `pnpm db:generate`    | `drizzle-kit generate`                  | Generate SQL migration from Drizzle schema   |
| `pnpm db:migrate`     | `ts-node src/database/migrate.ts`       | Apply pending migrations to PostgreSQL       |
| `pnpm db:studio`      | `drizzle-kit studio`                    | Launch Drizzle Studio web GUI                |
| `pnpm openapi:export` | `ts-node src/scripts/export-openapi.ts` | Export OpenAPI JSON to `openapi.json`        |

---

## OpenAPI Documentation

- **Swagger UI**: Accessible in non-production environments at [`http://localhost:3000/docs`](http://localhost:3000/docs).
- **Exporting OpenAPI Specification**:
  ```bash
  pnpm openapi:export
  ```
  This command headlessly generates `openapi.json` at the root of the project, which is used by the mobile repository to generate type-safe API clients.

---

## Reference Vertical Slice: Habits Module

The `habits` module illustrates the architectural patterns applied across all Resetly services:

- **Thin Controllers**: Handle HTTP semantics, route parameters, and Swagger annotations only.
- **Service Scoping**: Every service method takes `userId` as the first argument:
  ```ts
  async findById(userId: string, id: string): Promise<HabitResponseDto>
  ```
- **Consistent Privacy**: Attempting to access an ID that either does not exist or belongs to a different user returns `404 Not Found` to prevent account enumeration.
- **Strict Validation**: All input bodies and query params are strictly parsed through Zod DTOs via the global `ZodValidationPipe`.
