# Collaborative Team Hub

A full-stack monorepo app for team collaboration — workspaces, goals, kanban boards, announcements, analytics, and real-time updates.

**Live demo:** https://determined-hope-production-9d55.up.railway.app

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Advanced Features](#advanced-features)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment (Railway)](#deployment-railway)
- [Demo Credentials](#demo-credentials)
- [Architecture Notes](#architecture-notes)
- [Known Limitations](#known-limitations)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), Zustand, Tailwind CSS, react-hook-form, axios, socket.io-client, @hello-pangea/dnd |
| **Backend** | Node.js, Express, Prisma, PostgreSQL, Socket.io, JWT (httpOnly cookies), bcryptjs, Cloudinary, multer |
| **Package Manager** | pnpm workspaces |

---

## Project Structure

```
Collaborative-Team-Hub/
├── apps/
│   ├── api/                  # Express + Prisma backend (port 4000)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   └── src/
│   │       ├── controllers/  # Route handlers
│   │       ├── middleware/   # authenticate, errorHandler, validate
│   │       ├── routes/       # Express routers
│   │       ├── lib/          # prisma, tokens, cookies, upload, errors
│   │       ├── app.js
│   │       └── index.js      # HTTP + Socket.io entry point
│   └── web/                  # Next.js 14 App Router frontend (port 3000)
│       ├── app/
│       │   ├── (auth)/       # login, register
│       │   └── (app)/        # authenticated routes
│       ├── components/
│       └── lib/
│           ├── apiClient.js  # Axios + 401 auto-refresh interceptor
│           └── stores/       # Zustand stores
├── packages/                 # Shared configs (ESLint, Prettier)
├── docker-compose.yml        # Local Postgres
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## Features

- **Auth** — Register, login, logout, silent token refresh. JWT access + refresh tokens in httpOnly cookies.
- **Workspaces** — Create workspaces, invite members, manage roles (ADMIN / MEMBER).
- **Goals** — Goals with milestones and a per-goal activity feed.
- **Action Items** — Kanban board (drag-and-drop) and list view. File attachments via Cloudinary.
- **Announcements** — Rich text posts with emoji reactions, comments, and @mentions.
- **Analytics Dashboard** — Workspace-level metrics and charts.
- **Audit Log** — Chronological record of all workspace mutations.
- **Offline Mode** — Queued operations sync automatically on reconnect.
- **Real-time** — All mutations broadcast to workspace members via Socket.io.
- **File Uploads** — Profile avatars and action item attachments stored in Cloudinary.

---

## Advanced Features

Two advanced features were chosen from the optional list:

### 5. Audit Log
Every workspace mutation (goal created/updated, member invited, announcement posted, action item moved, etc.) is recorded as an immutable `AuditLog` entry in the database. The timeline UI (`/workspaces/:id/audit-log`) displays entries in reverse-chronological order with actor name, action type, and affected resource. The list is filterable by action type and supports **CSV export** of the full log.

### 2. Optimistic UI
All user-initiated mutations reflect instantly in the UI before the server responds. Each Zustand store applies the change locally first, captures a rollback snapshot, and reverts to the snapshot if the API call fails. Covered operations include:
- Kanban card drag-and-drop (status / position reorder)
- Goal status and priority toggles
- Announcement emoji reactions (add / remove)
- Action item field edits (title, assignee, due date)

---

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (local instance, Docker, or Railway)
- Cloudinary account (optional — falls back to local disk if not configured)

---

## Local Setup

**1. Clone and install**

```bash
git clone <repo-url>
cd Collaborative-Team-Hub
pnpm install
```

**2. Start local Postgres via Docker**

```bash
docker compose up -d postgres
```

**3. Configure the API**

```bash
cd apps/api
cp ../../.env.example .env
# Edit .env and fill in all required variables (see below)
```

**4. Run database migrations and seed**

```bash
npx prisma migrate dev
npx prisma db seed
```

**5. Configure the web app**

Create `apps/web/.env.local` and add the variables listed in [Environment Variables](#environment-variables).

**6. Start the dev servers (from repo root)**

```bash
cd ../..
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API health: http://localhost:4000/api/health

---

## Environment Variables

### `apps/api/.env`

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<random 64-char hex>
JWT_REFRESH_SECRET=<random 64-char hex>
WEB_ORIGIN=http://localhost:3000
PORT=4000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

---

## Development

```bash
# All apps in parallel (from root)
pnpm dev

# Individual apps
pnpm --filter api dev
pnpm --filter web dev

# Database helpers
pnpm db:migrate      # Create + apply a new migration
pnpm db:generate     # Regenerate Prisma client
pnpm db:seed         # Re-seed demo data
pnpm db:studio       # Open Prisma Studio

# Build all
pnpm build
```

---

## Deployment (Railway)

1. Create a new Railway project.
2. Add a **PostgreSQL** plugin — copy the generated `DATABASE_URL`.
3. Add the **api** service:
   - Root directory: `apps/api`
   - Build command: `npx prisma generate`
   - Start command: `node src/index.js`
4. Add the **web** service:
   - Root directory: `apps/web`
   - Build command: `pnpm build`
   - Start command: `pnpm start`
5. Set all environment variables from the [Environment Variables](#environment-variables) section in the Railway dashboard. Point `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL`, and `NEXT_PUBLIC_WS_URL` to the Railway-assigned public URLs.
6. Open a shell on the **api** service and run:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```

---

## Demo Credentials

All demo accounts use the password `demopassword`.

| Email | Role |
|---|---|
| demo@team-hub.dev | Workspace Admin |
| alice@team-hub.dev | Member |
| bob@team-hub.dev | Member |
| carol@team-hub.dev | Member |

---

## Architecture Notes

**Auth**
Dual-token strategy: 15-minute access token + 7-day refresh token, both stored in httpOnly cookies. An Axios interceptor catches 401 responses, silently calls `/auth/refresh`, and retries the original request.

**Real-time**
Single Socket.io namespace with workspace-scoped rooms (`workspace:{id}`). Every API mutation emits a corresponding event; connected clients update their Zustand stores via event handlers.

**Drag-and-drop**
`@hello-pangea/dnd` with optimistic reordering on the Kanban board. A snapshot of the previous order is captured before the API call and restored on failure.

**Offline mode**
Zustand `persist` middleware maintains an offline queue store. While offline, mutations are enqueued. On reconnect, queued operations replay in order against the live API.

**File uploads**
Cloudinary handles profile avatars (image only, 4 MB limit) and action item attachments (any file type, 10 MB limit). If Cloudinary credentials are absent, uploads fall back to local disk storage served from `/uploads`.

---

## Known Limitations

- File uploads larger than 8 MB may time out on slow connections.
- On Windows, Prisma client regeneration after a migration may fail with `EPERM` while the dev server is running. Stop the server, run `npx prisma generate`, then restart.
- The offline queue replays queued operations once on reconnect but does not retry them indefinitely if they fail again.
- There is no email delivery. The invite flow requires manually sharing login credentials with new members.
