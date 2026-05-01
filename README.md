# Collaborative Team Hub

Monorepo for the Collaborative Team Hub assignment. See `SPEC.md` for the full technical specification.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Web:** Next.js 16 (App Router, JS) + Tailwind 4 + Zustand + react-hook-form
- **API:** Node 20 + Express 4 + Prisma 5 + PostgreSQL 16
- **Realtime:** Socket.io (workspace + user rooms)
- **Auth:** JWT dual-token in httpOnly cookies (15m access / 7d refresh, with rotation)

## Quick start

```bash
# 1. Install dependencies (one time)
pnpm install

# 2. Start local Postgres in Docker
docker compose up -d postgres

# 3. Apply migrations + seed demo data (one time)
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma db seed

# 4. Run both apps in parallel
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000
- API health: http://localhost:4000/api/health

### Seeded demo account

```
email:    demo@team-hub.dev
password: demopassword
```

## Project layout

```
.
├── apps/
│   ├── api/                  Express + Prisma backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   └── src/
│   │       ├── controllers/  Route handlers (auth.controller.js, …)
│   │       ├── middleware/   authenticate, errorHandler, validate
│   │       ├── routes/       Express routers
│   │       ├── lib/          prisma, env, tokens, cookies, upload, errors
│   │       ├── app.js        Express app factory
│   │       └── server.js     HTTP + Socket.io entry point
│   └── web/                  Next.js 16 App Router frontend
│       ├── app/
│       │   ├── (auth)/       login, register
│       │   ├── (app)/        authenticated routes (workspaces, profile)
│       │   └── layout.js
│       ├── components/       UI primitives + AuthGate
│       ├── lib/
│       │   ├── apiClient.js  Axios + 401 auto-refresh interceptor
│       │   └── stores/       Zustand stores (authStore)
│       └── middleware.js     Route protection (cookie presence check)
├── packages/config/          Shared ESLint + Prettier presets
├── docker-compose.yml        Local Postgres
├── turbo.json
├── pnpm-workspace.yaml
├── SPEC.md                   Full technical specification
└── .env.example              Copy to .env (already populated for local dev)
```

## Useful commands

```bash
# DB
pnpm db:migrate           # Create + apply a new migration
pnpm db:generate          # Regenerate Prisma client
pnpm db:seed              # Re-seed
pnpm db:studio            # Open Prisma Studio

# Per-app
pnpm --filter api dev     # API only (http://localhost:4000)
pnpm --filter web dev     # Web only (http://localhost:3000)

# Build
pnpm build
```

## Phase 1 implementation status

All Phase 1 setup steps from `SPEC.md` §9 are complete:

- [x] Monorepo scaffold (Turborepo + pnpm workspaces)
- [x] Next.js web app
- [x] Express API + all backend deps
- [x] Local Postgres via Docker Compose (port 5433 to avoid native Postgres collision)
- [x] Full Prisma schema (13 models, all indexes from SPEC §3.2 / §3.3)
- [x] Auth controllers: register, login, refresh, logout, me, profile, avatar
- [x] `authenticate` middleware + `validate` middleware + global error handler
- [x] `/login`, `/register`, `/profile`, `/workspaces` (placeholder) pages
- [x] Zustand `authStore` + Axios `apiClient` with 401 auto-refresh
- [x] Next.js `middleware.js` for route protection
- [x] Profile page with avatar upload (Cloudinary if configured, else local disk fallback served from `/uploads`)
- [x] Seed script (1 demo user + 1 workspace, idempotent)

Next up: Phase 2 (workspaces CRUD + Socket.io presence). See `SPEC.md` §9.
