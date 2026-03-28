---
description: Create the actual project directory structure with real starter files based on your tech stack. Run this once after setup-project — it creates src/, tests/, and all the folders and boilerplate files your project needs to start coding immediately.
allowed-tools: Read, Write, Bash(mkdir:*), Bash(ls:*), Bash(cat:*), Bash(find:*), Bash(npm install:*), Bash(pip install:*), Bash(go mod tidy:*), Bash(git status:*)
---

## Step 1 — Understand the Project

Read the project context:

- CLAUDE.md: !`cat CLAUDE.md 2>/dev/null || echo "(no CLAUDE.md — run /setup-project first)"`
- Current structure: !`find . -not -path "*/.git/*" -not -path "*/node_modules/*" -not -path "*/__pycache__/*" -not -path "*/.claude/*" -not -path "*/memory/*" -type f | sort | head -40`
- Tech stack: !`ls package.json requirements.txt pyproject.toml go.mod Cargo.toml pom.xml 2>/dev/null || echo "(none)"`
- package.json: !`test -f package.json && cat package.json || echo "(none)"`

**Focus area** (optional): $ARGUMENTS

---

## Step 2 — Create the Directory Structure

Based on the tech stack detected above, create the appropriate project structure. Use the rules below.

---

### If Node.js / TypeScript (Next.js)

```
src/
  app/                    # Next.js App Router
    layout.tsx            # Root layout with metadata
    page.tsx              # Home page
    globals.css
    (auth)/               # Auth route group
      login/page.tsx
      register/page.tsx
  components/
    ui/                   # Shadcn/Radix primitives
    layout/               # Header, Footer, Sidebar
    [feature]/            # Feature-specific components
  hooks/                  # Custom React hooks (use*.ts)
  lib/
    utils.ts              # cn(), formatters, helpers
    constants.ts          # App-wide constants
    types.ts              # Shared TypeScript types
  services/               # External API calls, SDKs
  store/                  # State management (Zustand/Redux)
tests/
  unit/
  integration/
  e2e/
public/
```

Starter files to create:
- `src/lib/utils.ts` — cn() helper, common formatters
- `src/lib/types.ts` — base types (ApiResponse<T>, PaginatedResponse<T>)
- `src/lib/constants.ts` — APP_NAME, API_BASE_URL from env
- `src/hooks/useAsync.ts` — generic async hook with loading/error state
- `tests/unit/example.test.ts` — example test with vitest/jest setup

---

### If Node.js / Express or Fastify (API)

```
src/
  index.ts                # Entry point — creates app, starts server
  app.ts                  # App factory — registers routes, middleware
  config/
    index.ts              # Typed config from process.env
    database.ts           # DB connection setup
  routes/
    index.ts              # Route registry
    health.ts             # GET /health
    [resource]/
      index.ts            # Route definitions
      controller.ts       # Request handlers
      service.ts          # Business logic
      schema.ts           # Zod/Joi validation schemas
  middleware/
    auth.ts               # JWT/session auth middleware
    error.ts              # Global error handler
    logger.ts             # Request logging
  models/                 # DB models (Prisma/Mongoose/etc.)
  types/
    express.d.ts          # Augment Express Request type
    index.ts              # Shared types
tests/
  unit/
  integration/
  fixtures/               # Test data factories
```

Starter files:
- `src/config/index.ts` — typed config with validation
- `src/middleware/error.ts` — global error handler
- `src/routes/health.ts` — GET /health → { status: "ok", timestamp }
- `src/types/index.ts` — ApiError, PaginationParams, ApiResponse<T>
- `tests/fixtures/index.ts` — factory functions for test data

---

### If Python / FastAPI

```
src/
  main.py                 # FastAPI app factory, lifespan handler
  config.py               # Settings via pydantic-settings
  database.py             # SQLAlchemy async engine + session
  api/
    __init__.py
    router.py             # Aggregates all routers
    deps.py               # Shared FastAPI dependencies (get_db, get_current_user)
    v1/
      __init__.py
      health.py           # GET /health
      [resource]/
        __init__.py
        router.py
        schemas.py        # Pydantic request/response models
        service.py        # Business logic
  models/
    __init__.py
    base.py               # SQLAlchemy Base, TimestampMixin
    [resource].py         # ORM models
  core/
    security.py           # Password hashing, JWT
    exceptions.py         # Custom HTTP exceptions
tests/
  conftest.py             # pytest fixtures: test client, test db
  unit/
  integration/
  factories/              # Test data factories (factory_boy)
alembic/
  versions/
  env.py
  alembic.ini
```

Starter files with real content:
- `src/main.py` — FastAPI app with lifespan, CORS, exception handlers, router include
- `src/config.py` — Pydantic Settings class with all env vars from .env.example
- `src/database.py` — Async SQLAlchemy engine, AsyncSession, get_db dependency
- `src/api/deps.py` — get_db, get_current_user dependencies
- `src/api/v1/health.py` — GET /health endpoint
- `src/models/base.py` — Base, TimestampMixin with created_at/updated_at
- `src/core/exceptions.py` — AppError, NotFoundError, UnauthorizedError
- `tests/conftest.py` — async test client, test database setup/teardown

---

### If Python / Django

```
[project_name]/
  settings/
    base.py               # Shared settings
    development.py        # Dev overrides
    production.py         # Prod overrides
  urls.py
  wsgi.py
  asgi.py
apps/
  core/                   # Shared models, mixins, utilities
    models.py             # TimestampModel abstract base
    views.py
    serializers.py
  [app_name]/
    models.py
    views.py
    serializers.py
    urls.py
    admin.py
    tests/
      test_models.py
      test_views.py
      test_serializers.py
templates/
static/
tests/
  conftest.py
  factories/
```

---

### If Go

```
cmd/
  [appname]/
    main.go               # Entry point — wires everything, starts server
internal/
  config/
    config.go             # Viper/env config struct
  server/
    server.go             # HTTP server setup, middleware, route registration
    routes.go             # All route definitions
  handlers/
    health.go             # GET /health handler
    [resource].go
  services/
    [resource].go         # Business logic interfaces + implementations
  repository/
    [resource].go         # Database queries
  models/
    [resource].go         # Domain models
  middleware/
    auth.go
    logger.go
    recovery.go
pkg/
  errors/
    errors.go             # Custom error types
  logger/
    logger.go             # Structured logger setup
  database/
    database.go           # DB connection, migration runner
migrations/
  000001_init.sql
tests/
  integration/
  testutil/
    testutil.go           # Test helpers, in-memory DB setup
```

Starter files:
- `cmd/[appname]/main.go` — wires config → db → server → ListenAndServe
- `internal/config/config.go` — typed config struct with env tags
- `internal/server/server.go` — chi/gin/echo router setup
- `internal/handlers/health.go` — GET /health → JSON response
- `pkg/errors/errors.go` — AppError type with code + message
- `tests/testutil/testutil.go` — SetupTestDB, LoadFixtures helpers

---

### If Rust

```
src/
  main.rs                 # Entry point
  lib.rs                  # Library root (re-exports)
  config.rs               # Config from env vars
  error.rs                # Error enum with thiserror
  routes/
    mod.rs
    health.rs
    [resource].rs
  handlers/
    mod.rs
    [resource].rs
  models/
    mod.rs
    [resource].rs
  db/
    mod.rs
    connection.rs
tests/
  integration_test.rs
  common/
    mod.rs                # Test helpers
```

---

## Step 3 — Write Starter Files with Real Content

For whichever structure applies, create every file listed above with **meaningful starter code**:

- Imports that will actually be used
- Types/structs that match the project's domain
- At least one working function (even if it's just a health check)
- TODO comments where user-specific logic goes (not just empty files)
- `pass` / empty bodies only when the pattern is clear from context

**Critical**: Read `CLAUDE.md` before writing — use the exact naming conventions, import styles, and patterns described there.

---

## Step 4 — Install Dependencies

After creating files, run the install command for the stack:

- Node.js: `npm install` (if package.json was updated)
- Python: `pip install -r requirements.txt` or `pip install -e ".[dev]"`
- Go: `go mod tidy`
- Rust: `cargo build` (just to validate, don't run full compile)

---

## Step 5 — Summary

List every file and directory created. Group by layer:

```
Created:
  Config & Entry Points    src/main.py, src/config.py, ...
  API Layer                src/api/v1/health.py, ...
  Data Layer               src/models/base.py, ...
  Tests                    tests/conftest.py, ...
  Infrastructure           alembic/, .env (from .env.example), ...

Next steps:
  1. Fill in the domain model in src/models/[resource].py
  2. Create your first real endpoint in src/api/v1/[resource]/
  3. Run the project: [command from CLAUDE.md]
  4. Run the tests: [test command from CLAUDE.md]
```
