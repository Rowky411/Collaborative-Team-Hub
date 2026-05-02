# Collaborative Team Hub — Technical Specification

**Prepared for:** FredoCloud Intern Technical Assessment  
**Date:** 2026-05-01  
**Stack:** Fully prescribed by assignment (see Section 2)  
**Advanced features selected:** Optimistic UI (Option 2) + Audit Log (Option 5)

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [API Contracts](#4-api-contracts)
5. [Feature Specifications](#5-feature-specifications)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Real-time & Collaboration](#7-real-time--collaboration)
8. [Non-functional Requirements](#8-non-functional-requirements)
9. [Development Roadmap](#9-development-roadmap)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment & DevOps](#11-deployment--devops)
12. [Open Questions & Assumptions](#12-open-questions--assumptions)

---

## 1. Overview

### 1.1 Project Purpose

Collaborative Team Hub is a real-time, multi-workspace web application that lets teams manage shared goals, post announcements, and track action items. It is a 12–16 hour intern assessment deliverable for FredoCloud.

### 1.2 Scope

| In Scope | Out of Scope |
|---|---|
| Auth (register, login, refresh, logout) | OAuth / SSO |
| Workspaces with roles | Billing / subscription tiers |
| Goals, milestones, progress updates | Gantt chart view |
| Announcements with rich text, reactions, comments, pinning | Video conferencing |
| Action items (Kanban + list) linked to goals | Native mobile apps |
| Real-time push via Socket.io | ML-based suggestions |
| Analytics dashboard + CSV export | Multi-region deployment |
| Optimistic UI (Advanced Feature 2) | |
| Audit log (Advanced Feature 5) | |
| Avatar & file uploads via Cloudinary | |

### 1.3 Target Users

- **Workspace Admin** — creates and configures the workspace, manages members, publishes announcements, full CRUD on all entities.
- **Workspace Member** — collaborates on goals, creates and manages action items (owns their own), reacts and comments on announcements.

### 1.4 Success Criteria

- All core features functional in production on Railway with a seeded demo account.
- Conventional commit history on a public GitHub repository.
- Real-time updates visible across two browser tabs without manual refresh.
- Analytics dashboard renders without errors; CSV export produces a valid file.
- Optimistic UI updates roll back correctly on server error.
- Audit log records all workspace mutations and is filterable by type/date.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│  Next.js 14 App Router  │  Zustand store  │  Socket.io-client  │
└───────────────┬─────────────────────────────────┬───────────────┘
                │ HTTPS REST (fetch)               │ WSS
                ▼                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   RAILWAY — backend service                      │
│                                                                  │
│  Express.js REST API  ──►  Prisma ORM  ──►  PostgreSQL (plugin) │
│         │                                                        │
│  Socket.io server (attached to same HTTP server)                 │
│         │                                                        │
│  Cloudinary SDK  (avatar & attachment uploads)                   │
└──────────────────────────────────────────────────────────────────┘
                │ DATABASE_URL (injected by Railway)
                ▼
┌──────────────────────────────────┐
│  PostgreSQL  (Railway plugin)    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Cloudinary  (external SaaS)     │
│  avatars/ + attachments/         │
└──────────────────────────────────┘
```

### 2.2 Monorepo Structure (Turborepo)

```
collaborative-team-hub/           ← git root
├── turbo.json
├── package.json                  ← root workspace (pnpm)
├── apps/
│   ├── web/                      ← Next.js 14 frontend
│   │   ├── app/                  ← App Router pages & layouts
│   │   ├── components/
│   │   ├── store/                ← Zustand slices
│   │   ├── lib/                  ← api client, socket client, utils
│   │   └── public/
│   └── api/                      ← Express.js backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── socket/
│       └── prisma/
│           └── schema.prisma
└── packages/
    └── config/                   ← shared ESLint, Tailwind preset
```

### 2.3 Tech Stack

| Area | Technology | Rationale |
|---|---|---|
| Monorepo | Turborepo | Mandatory; caches builds per package, parallel task execution |
| Frontend | Next.js 14 App Router, JS | Mandatory; file-system routing, React Server Components for dashboard |
| Styling | Tailwind CSS | Mandatory; utility-first, pairs with shadcn/ui for rapid polished UI |
| State | Zustand | Mandatory; minimal boilerplate, slice-based, easy to integrate optimistic updates |
| Backend | Node.js + Express.js | Mandatory; familiar REST pattern, lightweight, excellent Socket.io integration |
| Database | PostgreSQL + Prisma | Mandatory; Prisma migrations = safe schema evolution, typed query builder |
| Auth | JWT httpOnly cookies | Mandatory; XSS-safe token storage, dual-token (access 15m / refresh 7d) |
| Real-time | Socket.io | Mandatory; handles WS + long-poll fallback, room-based workspace isolation |
| File storage | Cloudinary | Mandatory; handles transformation, CDN delivery, free tier sufficient |
| Charts | Recharts | Specified in PDF; React-native, composable |
| Rich text | Tiptap (ProseMirror) | Not specified but required for announcements; lightweight, headless, extensible |
| Deployment | Railway | Mandatory |
| Package manager | pnpm | Best Turborepo compatibility, fast installs |

### 2.4 Deployment Topology

```
Railway Project: collaborative-team-hub
├── Service: web         (Next.js, Node 20, npm start = next start)
│   ENV: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL
├── Service: api         (Express, Node 20, npm start = node src/index.js)
│   ENV: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
│        CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
│        CLIENT_URL, NODE_ENV=production
└── Plugin: PostgreSQL   (DATABASE_URL auto-injected into api service)
```

---

## 3. Data Model

### 3.1 Entity Relationship Diagram

```
User ──< WorkspaceMember >── Workspace
User ──< Goal (owner)
Workspace ──< Goal
Goal ──< Milestone
Goal ──< GoalUpdate (activity feed)
Goal ──< ActionItem
Workspace ──< ActionItem
Workspace ──< Announcement
Announcement ──< Reaction
Announcement ──< Comment
Comment ──< Reaction
Comment ──< Mention
User ──< Notification
Workspace ──< AuditLog
```

### 3.2 Prisma Schema

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String
  avatarUrl    String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  workspaces    WorkspaceMember[]
  ownedGoals    Goal[]            @relation("GoalOwner")
  assignedItems ActionItem[]      @relation("ActionItemAssignee")
  goalUpdates   GoalUpdate[]
  comments      Comment[]
  reactions     Reaction[]
  mentions      Mention[]
  notifications Notification[]
  refreshTokens RefreshToken[]

  @@index([email])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  accentColor String   @default("#6366f1")  // hex colour
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members       WorkspaceMember[]
  goals         Goal[]
  actionItems   ActionItem[]
  announcements Announcement[]
  auditLogs     AuditLog[]

  @@index([name])
}

model WorkspaceMember {
  id          String          @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole   @default(MEMBER)
  joinedAt    DateTime        @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
  @@index([workspaceId])
  @@index([userId])
}

enum WorkspaceRole {
  ADMIN
  MEMBER
}

model Goal {
  id          String     @id @default(cuid())
  workspaceId String
  ownerId     String
  title       String
  description String?
  status      GoalStatus @default(NOT_STARTED)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  workspace   Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  owner       User         @relation("GoalOwner", fields: [ownerId], references: [id])
  milestones  Milestone[]
  updates     GoalUpdate[]
  actionItems ActionItem[]

  @@index([workspaceId])
  @@index([ownerId])
  @@index([status])
  @@index([dueDate])
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

model Milestone {
  id         String   @id @default(cuid())
  goalId     String
  title      String
  progress   Int      @default(0)  // 0–100
  dueDate    DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)

  @@index([goalId])
}

model GoalUpdate {
  id        String   @id @default(cuid())
  goalId    String
  authorId  String
  body      String
  createdAt DateTime @default(now())

  goal   Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id])

  @@index([goalId])
}

model ActionItem {
  id          String           @id @default(cuid())
  workspaceId String
  goalId      String?
  assigneeId  String?
  title       String
  description String?
  priority    ActionPriority   @default(MEDIUM)
  status      ActionItemStatus @default(TODO)
  dueDate     DateTime?
  position    Int              @default(0)  // kanban sort order within status column
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  goal      Goal?     @relation(fields: [goalId], references: [id], onDelete: SetNull)
  assignee  User?     @relation("ActionItemAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)

  @@index([workspaceId])
  @@index([goalId])
  @@index([assigneeId])
  @@index([status])
}

enum ActionPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ActionItemStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

model Announcement {
  id          String   @id @default(cuid())
  workspaceId String
  authorId    String
  title       String
  body        String   // Tiptap JSON stringified
  isPinned    Boolean  @default(false)
  // CONFIRMED DECISION: isPinned is a workspace-wide singleton. At most one
  // Announcement per workspace may have isPinned = true at any time.
  // Enforced at the application layer via a Prisma transaction in the pin
  // endpoint (see §4.7). For an additional DB-level safety net, consider a
  // partial unique index: CREATE UNIQUE INDEX ON "Announcement"
  // ("workspaceId") WHERE "isPinned" = true; — add this in a raw migration.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  reactions Reaction[]
  comments  Comment[]

  @@index([workspaceId])
  @@index([isPinned])
}

model Comment {
  id             String   @id @default(cuid())
  announcementId String
  authorId       String
  body           String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  announcement Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  author       User         @relation(fields: [authorId], references: [id])
  reactions    Reaction[]
  mentions     Mention[]

  @@index([announcementId])
}

model Reaction {
  id             String  @id @default(cuid())
  emoji          String  // e.g. "👍"
  userId         String
  announcementId String?
  commentId      String?

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  announcement Announcement? @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  comment      Comment?      @relation(fields: [commentId], references: [id], onDelete: Cascade)

  @@unique([userId, announcementId, emoji])  // one emoji per user per announcement
  @@unique([userId, commentId, emoji])
  @@index([announcementId])
  @@index([commentId])
}

model Mention {
  id        String   @id @default(cuid())
  commentId String
  userId    String   // mentioned user
  createdAt DateTime @default(now())

  comment Comment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([commentId])
  @@index([userId])
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  payload   Json             // { announcementId, commentId, mentionedBy, ... }
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
}

enum NotificationType {
  MENTION
  WORKSPACE_INVITE
  GOAL_STATUS_CHANGE
}

model AuditLog {
  id          String   @id @default(cuid())
  workspaceId String
  actorId     String   // userId who performed the action
  action      String   // e.g. "goal.created", "announcement.pinned"
  entityType  String   // "Goal" | "ActionItem" | "Announcement" etc.
  entityId    String
  diff        Json?    // before/after snapshot
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
  @@index([actorId])
  @@index([entityType])
}
```

### 3.3 Index Strategy

| Table | Index | Reason |
|---|---|---|
| User | email | Login lookup |
| WorkspaceMember | (workspaceId), (userId) | Member list + user's workspace list |
| Goal | workspaceId, status, dueDate | Dashboard stats queries |
| ActionItem | workspaceId, status, assigneeId | Kanban board queries |
| Announcement | workspaceId, isPinned | Feed ordering (pinned first) |
| AuditLog | (workspaceId, createdAt), entityType | Filtered timeline |
| Notification | (userId, isRead) | Unread badge count |

---

## 4. API Contracts

### 4.1 Conventions

- Base URL: `https://your-api.up.railway.app/api`
- All request bodies: `Content-Type: application/json`
- All responses: `{ data: <payload> }` on success, `{ error: { code: string, message: string } }` on failure
- Authentication: access token in httpOnly cookie `access_token`; refresh token in httpOnly cookie `refresh_token`
- Workspace context: `:workspaceId` path param; middleware validates membership
- Pagination: `?page=1&limit=20` (default limit 20, max 100); response includes `{ data, meta: { total, page, limit } }`

### 4.2 Error Codes

| HTTP | code | Meaning |
|---|---|---|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Missing or expired access token |
| 403 | FORBIDDEN | Authenticated but insufficient role |
| 404 | NOT_FOUND | Resource does not exist |
| 409 | CONFLICT | Duplicate (e.g. email already registered) |
| 422 | UNPROCESSABLE | Business rule violation |
| 500 | INTERNAL_ERROR | Unexpected server error |

---

### 4.3 Auth Endpoints

#### POST /api/auth/register
Register a new user.

Request:
```json
{ "name": "Alice", "email": "alice@example.com", "password": "Min8chars!" }
```

Validation: name 1–100 chars; email valid format; password min 8 chars, 1 uppercase, 1 digit.

Response 201:
```json
{ "data": { "id": "cuid", "name": "Alice", "email": "alice@example.com", "avatarUrl": null } }
```
Sets `access_token` (15m) and `refresh_token` (7d) httpOnly cookies.

Response 409: email already registered.

---

#### POST /api/auth/login
Request:
```json
{ "email": "alice@example.com", "password": "Min8chars!" }
```
Response 200: same shape as register. Sets cookies.
Response 401: invalid credentials.

---

#### POST /api/auth/refresh
No body. Reads `refresh_token` cookie, issues new `access_token` cookie.
Response 200: `{ "data": { "ok": true } }`
Response 401: missing or expired refresh token.

---

#### POST /api/auth/logout
Clears both cookies, invalidates the refresh token record in DB.
Response 200: `{ "data": { "ok": true } }`

---

#### GET /api/auth/me
Returns current authenticated user.
Response 200:
```json
{ "data": { "id": "cuid", "name": "Alice", "email": "...", "avatarUrl": "..." } }
```

---

#### PATCH /api/auth/profile
Update name and/or avatar.

Request (multipart/form-data):
- `name` (string, optional)
- `avatar` (file, optional, max 2MB, image/*)

Response 200: updated user object.
Cloudinary upload: folder `avatars/`, public_id = userId, overwrite = true.

---

### 4.4 Workspace Endpoints

All workspace endpoints require authentication.

#### POST /api/workspaces
Create a workspace. Caller becomes ADMIN.

Request:
```json
{ "name": "Engineering", "description": "Eng team hub", "accentColor": "#6366f1" }
```
Validation: name 1–100 chars; accentColor valid hex (default `#6366f1`).
Response 201: workspace object + member count.

---

#### GET /api/workspaces
List workspaces the current user belongs to.
Response 200: `{ "data": [ workspace objects with role ] }`

---

#### GET /api/workspaces/:workspaceId
Get single workspace details.
Response 200: workspace + members array.

---

#### PATCH /api/workspaces/:workspaceId
Admin only. Update name, description, accentColor.
Response 200: updated workspace.

---

#### DELETE /api/workspaces/:workspaceId
Admin only. Soft-deletes all nested data (cascades via Prisma).
Response 204.

---

#### POST /api/workspaces/:workspaceId/invite
Admin only. Send invitation by email.

Request: `{ "email": "bob@example.com", "role": "MEMBER" }`

Behaviour:
- If user exists: create WorkspaceMember directly, emit `workspace:member_added` socket event.
- If user does not exist: store pending invitation (can use a simple `Invitation` table — see Assumption A1) and optionally send email (bonus).

Response 200: `{ "data": { "status": "added" | "invited" } }`

---

#### GET /api/workspaces/:workspaceId/members
Response 200: array of `{ userId, name, email, avatarUrl, role, joinedAt }`.

---

#### PATCH /api/workspaces/:workspaceId/members/:userId
Admin only. Change role.
Request: `{ "role": "ADMIN" | "MEMBER" }`
Response 200: updated member record.

---

#### DELETE /api/workspaces/:workspaceId/members/:userId
Admin only (or self-remove). Remove member.
Response 204.

---

### 4.5 Goals & Milestones Endpoints

All require workspace membership.

#### POST /api/workspaces/:workspaceId/goals
Authorization: **any workspace member (ADMIN or MEMBER)** — confirmed decision, not an assumption.

Request:
```json
{
  "title": "Launch V2",
  "description": "...",
  "ownerId": "cuid",
  "dueDate": "2026-06-30T00:00:00Z",
  "status": "NOT_STARTED"
}
```
Validation: title 1–200 chars; ownerId must be workspace member; dueDate ISO8601.
Response 201: goal object.
Emits: `goal:created` to workspace room.
Audit: `goal.created`.

---

#### GET /api/workspaces/:workspaceId/goals
Query params: `?status=IN_PROGRESS&ownerId=cuid&page=1&limit=20`
Response 200: paginated goals with milestone count and progress aggregate.

---

#### GET /api/workspaces/:workspaceId/goals/:goalId
Response 200: goal + milestones + recent 10 updates.

---

#### PATCH /api/workspaces/:workspaceId/goals/:goalId
Request: partial update of title, description, ownerId, dueDate, status.
Response 200: updated goal.
Emits: `goal:updated`.
Audit: `goal.updated` with diff.

---

#### DELETE /api/workspaces/:workspaceId/goals/:goalId
Admin only.
Response 204.
Audit: `goal.deleted`.

---

#### POST /api/workspaces/:workspaceId/goals/:goalId/milestones
Request: `{ "title": "...", "progress": 0, "dueDate": "..." }`
Validation: progress 0–100.
Response 201: milestone.
Audit: `milestone.created`.

---

#### PATCH /api/workspaces/:workspaceId/goals/:goalId/milestones/:milestoneId
Request: partial — title, progress, dueDate.
Response 200: updated milestone.
Emits: `goal:updated` (triggers goal re-render).
Audit: `milestone.updated`.

---

#### DELETE /api/workspaces/:workspaceId/goals/:goalId/milestones/:milestoneId
Response 204.

---

#### POST /api/workspaces/:workspaceId/goals/:goalId/updates
Post a progress update (activity feed entry).
Request: `{ "body": "Completed auth integration" }`
Validation: body 1–2000 chars.
Response 201: GoalUpdate object with author.
Emits: `goal:update_posted`.

---

#### GET /api/workspaces/:workspaceId/goals/:goalId/updates
Paginated list of updates, descending by createdAt.
Response 200: paginated GoalUpdate array.

---

### 4.6 Action Item Endpoints

#### POST /api/workspaces/:workspaceId/action-items
Request:
```json
{
  "title": "Write unit tests",
  "description": "...",
  "assigneeId": "cuid",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2026-06-15T00:00:00Z",
  "goalId": "cuid"
}
```
Response 201: action item.
Emits: `actionItem:created`.
Audit: `actionItem.created`.

---

#### GET /api/workspaces/:workspaceId/action-items
Default scope: returns only action items assigned to the authenticated user (`assigneeId = req.user.id`). — confirmed decision.

Query params:
- `assigneeId=<userId>` — filter by a specific assignee
- `assigneeId=all` — return all workspace items regardless of assignee
- `status=TODO` — filter by status
- `goalId=cuid` — filter by linked goal
- `page=1&limit=50`

Response 200: paginated action items.

---

#### PATCH /api/workspaces/:workspaceId/action-items/:itemId
Partial update. When status changes, emits `actionItem:statusChanged`.
Request: any subset of title, description, assigneeId, priority, status, dueDate, goalId, position.
Response 200: updated item.
Audit: `actionItem.updated`.

---

#### DELETE /api/workspaces/:workspaceId/action-items/:itemId
Response 204.
Audit: `actionItem.deleted`.

---

#### PATCH /api/workspaces/:workspaceId/action-items/reorder
Batch reorder for Kanban drag-and-drop.
Request: `{ "items": [{ "id": "cuid", "status": "IN_PROGRESS", "position": 0 }, ...] }`
Response 200: `{ "data": { "ok": true } }`

---

### 4.7 Announcement Endpoints

#### POST /api/workspaces/:workspaceId/announcements
Admin only.
Request: `{ "title": "Q2 kickoff", "body": "<tiptap-json-string>", "isPinned": false }`
Response 201: announcement.
Emits: `announcement:created`.
Audit: `announcement.created`.

---

#### GET /api/workspaces/:workspaceId/announcements
Response 200: paginated announcements, pinned first, then descending createdAt. Includes reaction counts and comment count.

---

#### GET /api/workspaces/:workspaceId/announcements/:announcementId
Response 200: full announcement with comments (paginated) and reactions.

---

#### PATCH /api/workspaces/:workspaceId/announcements/:announcementId
Admin only. Update title, body, isPinned.

**Pin exclusivity (confirmed decision):** only one announcement may be pinned per workspace at a time. When `isPinned: true` is set on a target, the backend must atomically unpin all others in the same workspace:

```js
// controller — pin handler
await prisma.$transaction([
  prisma.announcement.updateMany({
    where: { workspaceId, isPinned: true },
    data:  { isPinned: false },
  }),
  prisma.announcement.update({
    where: { id: announcementId },
    data:  { isPinned: true },
  }),
]);
```

When `isPinned: false` is set (unpin), a plain `update` with no `updateMany` is sufficient.

Response 200: updated.
Emits: `announcement:updated` (or `announcement:pinned` if isPinned changed).
Audit: `announcement.updated` (action = `announcement.pinned` when isPinned changes to true).

---

#### DELETE /api/workspaces/:workspaceId/announcements/:announcementId
Admin only.
Response 204.

---

#### POST /api/workspaces/:workspaceId/announcements/:announcementId/reactions
Toggle reaction.
Request: `{ "emoji": "👍" }`
Behaviour: if reaction exists for (userId, announcementId, emoji) → delete (unreact); else create.
Response 200: `{ "data": { "action": "added" | "removed", "counts": { "👍": 3 } } }`
Emits: `announcement:reactionUpdated`.

---

#### POST /api/workspaces/:workspaceId/announcements/:announcementId/comments
Request: `{ "body": "Great news! @bob check this out" }`
Validation: body 1–1000 chars.
Behaviour: parse `@username` mentions → create Mention records → create Notifications → emit `notification:new` to mentioned users.
Response 201: comment with author.
Emits: `announcement:commentAdded`.

---

#### GET /api/workspaces/:workspaceId/announcements/:announcementId/comments
Paginated, ascending createdAt.
Response 200: comments with author and reaction counts.

---

#### POST /api/workspaces/:workspaceId/announcements/:announcementId/comments/:commentId/reactions
Same toggle logic as announcement reactions.

---

### 4.8 Analytics Endpoints

#### GET /api/workspaces/:workspaceId/analytics/summary
Response 200:
```json
{
  "data": {
    "totalGoals": 12,
    "completedThisWeek": 3,
    "overdueCount": 2,
    "totalActionItems": 47,
    "actionItemsCompletedThisWeek": 8
  }
}
```
"This week" = ISO week containing today (Monday 00:00 UTC → Sunday 23:59 UTC).

---

#### GET /api/workspaces/:workspaceId/analytics/goal-completion
Response 200: array of `{ week: "2026-W18", completed: 2, total: 5 }` for past 12 weeks.

---

#### GET /api/workspaces/:workspaceId/analytics/export
Response 200: CSV download.
Headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="workspace-export-<date>.csv"`
Content: one section per entity type (Goals, Milestones, ActionItems, Announcements), separated by blank rows.

---

### 4.9 Audit Log Endpoints

#### GET /api/workspaces/:workspaceId/audit-log
Admin only.
Query params: `?entityType=Goal&actorId=cuid&from=2026-01-01&to=2026-05-01&page=1&limit=50`
Response 200: paginated audit log entries with actor name.

---

#### GET /api/workspaces/:workspaceId/audit-log/export
Admin only.
Response 200: CSV of filtered audit log.

---

### 4.10 Notification Endpoints

#### GET /api/notifications
Response 200: `{ "data": [ notifications ], "meta": { "unreadCount": 5 } }`

---

#### PATCH /api/notifications/:notificationId/read
Response 200: updated notification.

---

#### PATCH /api/notifications/read-all
Mark all notifications as read.
Response 200: `{ "data": { "ok": true } }`

---

## 5. Feature Specifications

### 5.1 Authentication

#### User Stories
- As a new user, I can register with email and password so that I can access the platform.
- As a returning user, I can log in and have my session persist across browser refreshes.
- As a user, I can upload a profile avatar so that teammates recognise me.
- As a user, I can log out and have both tokens invalidated.

#### UI/UX Flow

```
/login  ──(no account?)──►  /register  ──(success)──►  /workspaces
  │                                                         │
  └──(success)──────────────────────────────────────────────┘
```

Pages: `/login`, `/register`, `/profile`

Protected redirect: middleware in `apps/web/middleware.js` reads `access_token` cookie; redirects unauthenticated requests for `/workspaces/*` to `/login`.

#### Frontend Components

| Component | File | Purpose |
|---|---|---|
| `LoginForm` | `app/(auth)/login/page.js` | Email/password form with validation |
| `RegisterForm` | `app/(auth)/register/page.js` | Name, email, password + confirm |
| `ProfilePage` | `app/(app)/profile/page.js` | Avatar upload + name edit |
| `AvatarUpload` | `components/ui/AvatarUpload.js` | Drag-and-drop or click, preview |
| `AuthGuard` | `components/AuthGuard.js` | Client-side guard wrapping app layout |

#### Zustand Auth Store (`store/authStore.js`)

```js
// State shape
{
  user: null,          // { id, name, email, avatarUrl }
  isLoading: false,
  hydrated: false,
}

// Actions: login(credentials), register(data), logout(), fetchMe(), updateProfile(data)
```

#### Validation Rules

| Field | Rule |
|---|---|
| name | Required, 1–100 chars |
| email | Required, valid email format |
| password | Required, min 8 chars, at least 1 uppercase, 1 digit |
| avatar file | image/* MIME type, max 2MB |

#### Backend Implementation

- Passwords hashed with `bcryptjs` (cost factor 12).
- Access token: HS256 JWT, payload `{ sub: userId }`, expires `15m`, secret `JWT_ACCESS_SECRET`.
- Refresh token: HS256 JWT, payload `{ sub: userId, jti: uuid }`, expires `7d`, stored in `RefreshToken` table.
- Middleware `authenticate.js`: reads `access_token` cookie, verifies JWT, attaches `req.user`.
- `POST /auth/refresh`: verifies refresh token, checks `RefreshToken` table (rotation — invalidate old, issue new).

#### Edge Cases
- Expired access token with valid refresh: refresh endpoint auto-called by frontend `apiClient` interceptor on 401.
- Simultaneous login from two devices: each gets independent refresh token row.
- Avatar upload failure (Cloudinary down): return 502 with `UPLOAD_FAILED` code; profile update does not persist.

---

### 5.2 Workspaces

#### User Stories
- As a user, I can create a workspace and invite teammates.
- As an Admin, I can customise the workspace name, description, and accent colour.
- As a user, I can switch between workspaces I belong to.
- As an Admin, I can assign and change member roles.

#### UI/UX Flow

```
/workspaces                    ── list of user's workspaces, "+ New Workspace" button
  └── /workspaces/new          ── creation modal (name, description, colour picker)
  └── /workspaces/:id          ── workspace dashboard (sidebar nav with accent colour)
      └── /workspaces/:id/settings  ── Admin: edit workspace, manage members, invite
```

#### Frontend Components

| Component | Purpose |
|---|---|
| `WorkspaceSwitcher` | Dropdown in sidebar listing all workspaces |
| `WorkspaceCard` | Card on `/workspaces` index |
| `CreateWorkspaceModal` | Form with colour picker (use `react-colorful`) |
| `WorkspaceSettingsPage` | Name/desc/colour edit + member table |
| `InviteMemberModal` | Email input + role select |
| `MemberTable` | Table with role badge and remove/change-role actions |

#### Zustand Workspace Store (`store/workspaceStore.js`)

```js
{
  workspaces: [],
  currentWorkspaceId: null,
  currentWorkspace: null,   // full object with members
  members: [],
}
// Actions: fetchWorkspaces(), setCurrentWorkspace(id), createWorkspace(data),
//          updateWorkspace(id, data), inviteMember(id, email, role),
//          updateMemberRole(workspaceId, userId, role), removeMember(workspaceId, userId)
```

#### Accent Colour Application
The workspace `accentColor` hex is stored in Zustand and applied as a CSS custom property on the workspace layout root element: `style={{ '--accent': workspace.accentColor }}`. Tailwind arbitrary values `text-[var(--accent)]` and `bg-[var(--accent)]` then theme the sidebar and headers.

#### Edge Cases
- User attempts to remove themselves if sole Admin: return 422 `LAST_ADMIN`.
- Invite email already a member: return 409 `ALREADY_MEMBER`.
- Non-existent workspaceId in URL: redirect to `/workspaces`.

---

### 5.3 Goals & Milestones

#### User Stories
- As any workspace member (ADMIN or MEMBER), I can create a goal with a title, description, owner, due date, and status. (Confirmed — both roles may create goals.)
- As a goal owner (or Admin), I can nest milestones under a goal and track percentage progress.
- As a team member, I can post progress updates to a goal's activity feed.
- As any workspace member, I can view the goal list filtered by status or owner.

#### UI/UX Flow

```
/workspaces/:id/goals                  ── goal list (filter bar + "+ New Goal")
  └── /workspaces/:id/goals/:goalId    ── goal detail
      ├── Overview tab (title, status, milestones, progress ring)
      ├── Activity tab (GoalUpdate feed + post box)
      └── Action Items tab (filtered action items linked to this goal)
```

#### Frontend Components

| Component | Purpose |
|---|---|
| `GoalList` | Filterable, paginated list of goal cards |
| `GoalCard` | Shows title, owner avatar, status badge, milestone progress bar, due date |
| `GoalDetailPage` | Tabbed layout for goal |
| `GoalForm` | Create/edit modal — title, description, owner select, date picker, status |
| `MilestoneList` | Ordered list inside goal detail with inline edit |
| `MilestoneItem` | Shows title, progress slider (0–100), due date |
| `GoalUpdateFeed` | Scrollable list of GoalUpdate entries |
| `PostUpdateForm` | Textarea + submit for new GoalUpdate |
| `ProgressRing` | SVG circle showing average milestone progress |
| `StatusBadge` | Colour-coded pill: NOT_STARTED (grey), IN_PROGRESS (blue), COMPLETED (green), OVERDUE (red) |

#### Progress Calculation
Average milestone progress for a goal is computed client-side:
`Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)`
If no milestones: show 0%.

#### Validation Rules

| Field | Rule |
|---|---|
| title | Required, 1–200 chars |
| ownerId | Must be a current workspace member |
| dueDate | Optional, must be a future date on creation |
| status | One of GoalStatus enum values |
| milestone.progress | Integer 0–100 |

#### Backend Logic
- On `PATCH goal status → COMPLETED`: record `goal.completed` audit log entry; emit `goal:updated`.
- Overdue detection: a background consideration — for the assessment, compute `OVERDUE` dynamically in analytics queries (`dueDate < NOW() AND status != 'COMPLETED'`). No cron job needed.

#### Optimistic UI (Advanced Feature 2) — Goal Status Change
1. User clicks status badge on GoalCard.
2. Zustand action immediately updates `goal.status` in local store.
3. API `PATCH` fires in background.
4. On success: reconcile with server response (no visible change if match).
5. On error: revert `goal.status` to previous value, show toast "Failed to update status".

Same pattern applies to milestone progress slider.

---

### 5.4 Announcements

#### User Stories
- As an Admin, I can publish rich-text announcements to the whole workspace.
- As an Admin, I can pin an announcement so it appears at the top of the feed.
- As any member, I can react to an announcement with an emoji.
- As any member, I can comment on an announcement and @mention teammates.

#### UI/UX Flow

```
/workspaces/:id/announcements           ── feed (pinned section, then chronological)
  ├── [Admin] "+ New Announcement" button ── CreateAnnouncementModal
  └── AnnouncementCard (click to expand or navigate to detail)
      /workspaces/:id/announcements/:announcementId  ── full detail with comments
```

#### Frontend Components

| Component | Purpose |
|---|---|
| `AnnouncementFeed` | Sorted list with pinned section at top |
| `AnnouncementCard` | Title, author, timestamp, body preview, reaction bar, comment count |
| `CreateAnnouncementModal` | Tiptap editor for rich text, title field, pin checkbox |
| `AnnouncementDetailPage` | Full body render, reaction bar, CommentList |
| `RichTextEditor` | Tiptap instance with Bold, Italic, BulletList, Link, Image upload extensions |
| `ReactionBar` | Row of emoji buttons with counts; click to toggle |
| `CommentList` | Paginated comments with author avatar |
| `CommentInput` | Textarea with @mention autocomplete (typeahead from workspace members) |
| `PinButton` | Toggle pin (Admin only, visible) |

#### @Mention Implementation
- `CommentInput` listens for `@` keypress and shows a `MemberDropdown` filtered by typed text.
- Selected member name is inserted as `@name` plain text.
- On submit: backend uses regex `/\@([\w.]+)/g` to extract names, queries `WorkspaceMember` table joined to `User` by name match, creates `Mention` and `Notification` records.
- Mentioned users receive real-time `notification:new` socket event.

#### Rich Text Storage
- Tiptap serialises to JSON (`editor.getJSON()`); stored as stringified JSON in `Announcement.body`.
- On render: `editor.commands.setContent(JSON.parse(body))` with `editable: false`.

#### Pin Exclusivity UX (confirmed decision)
Only one announcement may be pinned at a time across the workspace. When an Admin clicks **Pin** on a new announcement:
- The backend transaction atomically unpins all others and pins the target (see §4.7).
- The frontend receives the `announcement:updated` socket event for the newly-pinned item and for the previously-pinned item (both are pushed).
- A toast is shown: "Announcement pinned — previous pin removed." (only when a prior pinned item existed).
- `PinButton` shows a filled/unfilled pin icon; clicking a pinned item's pin button unpins it (sets `isPinned: false`) with no `updateMany` needed.

#### Edge Cases
- Admin un-pins the only pinned announcement: plain update sets `isPinned: false`; pinned section renders nothing.
- Two Admins attempt to pin different announcements simultaneously: the second transaction's `updateMany` will unpin whatever the first transaction just pinned; last-write-wins is acceptable per §7.7.
- Reaction toggle race: unique constraint on `(userId, announcementId, emoji)` prevents duplicate; catch Prisma P2002 and treat as already-added.
- Comment with no valid @mention names: creates comment, no notifications.

---

### 5.5 Action Items

#### User Stories
- As a workspace member, I can create an action item with a title, assignee, priority, status, due date, and optionally link it to a goal.
- As a workspace member, I can view action items in a Kanban board or list view.
- As an assignee, I can drag cards between Kanban columns to update status.

#### UI/UX Flow

```
/workspaces/:id/action-items
  ├── View toggle: [Kanban] [List]
  ├── Scope toggle: [My Items ✓] [All Items]   ← default is "My Items"
  ├── Filter bar: priority, goalId, status (assignee filter only shown in "All Items" scope)
  └── "+ New Action Item" button → CreateActionItemModal
```

**Default scope (confirmed decision):** on first load the Kanban board shows only action items where `assigneeId = current user`. The scope toggle ("My Items" / "All Items") maps to `GET /action-items` query param: no `assigneeId` param (defaults to `req.user.id`) vs `?assigneeId=all`. Zustand `filters.assigneeId` stores `null` (my items) or `'all'`; the store action passes `assigneeId=all` to the API when `'all'`.

#### Kanban Board Structure

Four columns mapping to `ActionItemStatus`:
- `TODO` — "To Do"
- `IN_PROGRESS` — "In Progress"
- `IN_REVIEW` — "In Review"
- `DONE` — "Done"

Use `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd) for drag-and-drop.

On drop: call `PATCH /action-items/reorder` with new status + position (optimistic update applies immediately).

#### Frontend Components

| Component | Purpose |
|---|---|
| `ActionItemsPage` | Page with view toggle and filter bar |
| `KanbanBoard` | DnD context, 4 columns |
| `KanbanColumn` | Droppable column with header and item cards |
| `ActionItemCard` | Draggable card: title, assignee avatar, priority badge, due date |
| `ActionItemList` | Table view with sortable columns |
| `CreateActionItemModal` | Full form: title, description, assignee select, priority, status, date, goal link |
| `PriorityBadge` | LOW (grey), MEDIUM (blue), HIGH (orange), URGENT (red) |

#### Zustand Action Item Store (`store/actionItemStore.js`)

```js
{
  items: [],         // all items for current workspace, normalised by id
  view: 'kanban',    // 'kanban' | 'list'
  // assigneeId: null = "My Items" (API defaults to req.user.id)
  // assigneeId: 'all' = "All workspace items" (API receives ?assigneeId=all)
  filters: { assigneeId: null, priority: null, goalId: null, status: null }
}
// Actions: fetchItems(workspaceId, filters), createItem(data), updateItem(id, patch),
//          deleteItem(id), reorderItems(updates), setView(view), setFilter(key, val)
// fetchItems passes assigneeId=all when filters.assigneeId === 'all'; omits param otherwise.
```

#### Optimistic UI for Kanban Drag
1. Drop event fires → update item's `status` and `position` in Zustand immediately.
2. POST reorder batch to API.
3. On API error: revert to snapshot taken before drag started; toast "Reorder failed".

#### Validation Rules

| Field | Rule |
|---|---|
| title | Required, 1–200 chars |
| priority | Required, one of ActionPriority enum |
| status | Default TODO |
| assigneeId | Optional, must be workspace member if provided |
| goalId | Optional, must belong to same workspace |

---

### 5.6 Analytics Dashboard

#### User Stories
- As any workspace member, I can view summary stats for the workspace on the dashboard.
- As any member, I can see a goal completion trend chart for the past 12 weeks.
- As an Admin, I can export all workspace data as a CSV file.

#### UI/UX Flow

```
/workspaces/:id/dashboard
  ├── StatCards row (4 cards)
  ├── GoalCompletionChart (Recharts LineChart or BarChart)
  └── [Admin] "Export CSV" button
```

#### Frontend Components

| Component | Purpose |
|---|---|
| `DashboardPage` | Fetches summary + chart data on mount |
| `StatCard` | Icon + label + number + trend arrow |
| `GoalCompletionChart` | Recharts `<BarChart>` with 12 week bars |
| `ExportButton` | Triggers file download via `window.open` or `fetch` with `blob()` |

#### Stat Cards
1. Total Goals (all statuses)
2. Items Completed This Week
3. Overdue Goals (count where dueDate < today AND status != COMPLETED)
4. Active Members (members with at least one action in past 7 days — use AuditLog count)

#### Chart Data Shape
```js
[
  { week: "W07", completed: 2, total: 5 },
  { week: "W08", completed: 3, total: 6 },
  // 12 entries
]
```
Rendered as a stacked bar chart: `completed` (accent colour) over `total` (grey).

#### CSV Export Format
```
WORKSPACE EXPORT: Engineering Team
Exported: 2026-05-01T10:00:00Z

GOALS
id,title,status,owner,dueDate,createdAt
...

MILESTONES
id,goalId,title,progress,dueDate
...

ACTION ITEMS
id,title,status,priority,assignee,goalId,dueDate
...

ANNOUNCEMENTS
id,title,author,isPinned,createdAt
...
```

---

### 5.7 Audit Log (Advanced Feature 5)

#### User Stories
- As an Admin, I can view an immutable timeline of all changes made in the workspace.
- As an Admin, I can filter the audit log by entity type, actor, and date range.
- As an Admin, I can export the filtered audit log as a CSV.

#### What Gets Logged

| Action string | Trigger |
|---|---|
| `goal.created` | POST /goals |
| `goal.updated` | PATCH /goals/:id |
| `goal.deleted` | DELETE /goals/:id |
| `milestone.created` | POST /milestones |
| `milestone.updated` | PATCH /milestones/:id |
| `actionItem.created` | POST /action-items |
| `actionItem.updated` | PATCH /action-items/:id |
| `actionItem.deleted` | DELETE /action-items/:id |
| `announcement.created` | POST /announcements |
| `announcement.updated` | PATCH /announcements/:id |
| `announcement.pinned` | PATCH isPinned → true |
| `member.invited` | POST /invite |
| `member.roleChanged` | PATCH /members/:id |
| `member.removed` | DELETE /members/:id |

#### Backend Implementation

`auditLog.service.js` exports a single function:
```js
async function log({ workspaceId, actorId, action, entityType, entityId, diff }) {
  await prisma.auditLog.create({ data: { workspaceId, actorId, action, entityType, entityId, diff } });
}
```
Called inside each controller after the primary DB mutation, wrapped in `try/catch` so audit failure never breaks the main operation.

#### Frontend Components

| Component | Purpose |
|---|---|
| `AuditLogPage` | `/workspaces/:id/settings/audit-log` — Admin only |
| `AuditLogFilters` | entityType select, actorId select, date range pickers |
| `AuditLogTimeline` | Virtualised list (use `react-window`) of log entries |
| `AuditLogEntry` | Icon + actor name + action description + timestamp + diff collapsible |
| `AuditExportButton` | CSV download of filtered log |

---

## 6. Authentication & Authorization

### 6.1 Auth Strategy

- **Access token**: JWT HS256, 15-minute expiry, stored in `access_token` httpOnly cookie (SameSite=Strict in production, SameSite=None+Secure for cross-origin Railway deploy).
- **Refresh token**: JWT HS256, 7-day expiry, stored in `refresh_token` httpOnly cookie. A corresponding `RefreshToken` row enables server-side revocation.
- **Token rotation**: on each `/auth/refresh` call, the old refresh token row is deleted and a new one is created.
- **Frontend intercept**: `apiClient` (axios or native fetch wrapper) catches 401 responses, calls `/auth/refresh`, retries original request once.

### 6.2 Middleware Chain

```
Request
  └── cookieParser()
  └── authenticate(req, res, next)        ← verifies access_token cookie, sets req.user
  └── requireWorkspaceMember(role?)       ← checks WorkspaceMember row, optionally requires ADMIN
  └── controller
```

`requireWorkspaceMember('ADMIN')` rejects with 403 if `member.role !== 'ADMIN'`.

### 6.3 Roles & Permissions Matrix

| Action | Admin | Member |
|---|---|---|
| View workspace | Yes | Yes |
| Edit workspace settings | Yes | No |
| Invite members | Yes | No |
| Change member roles | Yes | No |
| Remove members | Yes | No |
| Create goals | Yes | Yes (confirmed) |
| Edit own goals | Yes | Yes |
| Delete any goal | Yes | No |
| Create milestones | Yes | Yes |
| Post goal updates | Yes | Yes |
| Create action items | Yes | Yes |
| Edit own action items | Yes | Yes |
| Edit others' action items | Yes | No |
| Delete action items | Yes | No |
| Create announcements | Yes | No |
| Edit/delete announcements | Yes | No |
| Pin announcements | Yes | No |
| React/comment on announcements | Yes | Yes |
| View analytics | Yes | Yes |
| Export CSV | Yes | Yes |
| View audit log | Yes | No |
| Export audit log | Yes | No |

Goal creation is open to all workspace members (ADMIN and MEMBER) — confirmed by FredoCloud. Only Admins can delete goals they don't own.

### 6.4 Next.js Middleware (`apps/web/middleware.js`)

```js
// Protects all routes under /workspaces, /profile
// Reads access_token cookie; if absent, redirects to /login
// Does NOT verify JWT (that happens server-side on API calls)
```

---

## 7. Real-time & Collaboration

### 7.1 Socket.io Setup

- Socket.io server attached to the same Express HTTP server instance.
- CORS: allow `CLIENT_URL` origin with credentials.
- Authentication: on `connection`, client sends access token via `auth: { token }` option; server verifies JWT in the `connection` middleware.
- Workspace rooms: client joins `workspace:${workspaceId}` room on navigation to a workspace.

### 7.2 Client Connection (`apps/web/lib/socket.js`)

```js
import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      withCredentials: true,
      auth: { token: getCookieValue('access_token') }  // read from document.cookie
    });
  }
  return socket;
}
```

Socket is initialised in the workspace layout component and torn down on unmount.

### 7.3 Room Management

| Event (client → server) | Payload | Effect |
|---|---|---|
| `workspace:join` | `{ workspaceId }` | Server: `socket.join('workspace:' + workspaceId)` |
| `workspace:leave` | `{ workspaceId }` | Server: `socket.leave(...)` |

### 7.4 Server-emitted Events

All events are emitted to `workspace:${workspaceId}` room.

| Event | Payload | Triggered by |
|---|---|---|
| `goal:created` | `{ goal }` | POST /goals |
| `goal:updated` | `{ goal }` | PATCH /goals/:id |
| `goal:update_posted` | `{ update }` | POST /goals/:id/updates |
| `actionItem:created` | `{ actionItem }` | POST /action-items |
| `actionItem:statusChanged` | `{ id, status, position }` | PATCH /action-items/:id |
| `announcement:created` | `{ announcement }` | POST /announcements |
| `announcement:updated` | `{ announcement }` | PATCH /announcements/:id |
| `announcement:reactionUpdated` | `{ announcementId, counts }` | POST /reactions |
| `announcement:commentAdded` | `{ comment }` | POST /comments |
| `workspace:member_added` | `{ member }` | POST /invite (existing user) |
| `presence:online` | `{ userId, workspaceId }` | workspace:join event |
| `presence:offline` | `{ userId, workspaceId }` | disconnect event |

User-scoped events (emitted to `user:${userId}` room):
| Event | Payload |
|---|---|
| `notification:new` | `{ notification }` |

### 7.5 Presence

- On `workspace:join`: server emits `presence:online` to the workspace room (excluding the joining socket).
- On `disconnect`: server checks if user has any remaining sockets in the room; if none, emits `presence:offline`.
- Client-side: Zustand `presenceStore` maintains `Set<userId>` of online members, rendered as green dots on member avatars.

```js
// store/presenceStore.js
{
  onlineUserIds: new Set(),
}
// Actions: setOnline(userId), setOffline(userId)
```

### 7.6 Client-side Event Handling

In the workspace layout `useEffect`, register listeners:

```js
socket.on('goal:created', (data) => goalStore.getState().addGoal(data.goal));
socket.on('goal:updated', (data) => goalStore.getState().updateGoal(data.goal));
socket.on('actionItem:statusChanged', (data) => actionItemStore.getState().updateItemStatus(data));
socket.on('announcement:created', (data) => announcementStore.getState().prependAnnouncement(data.announcement));
socket.on('announcement:reactionUpdated', (data) => announcementStore.getState().updateReactions(data));
socket.on('announcement:commentAdded', (data) => announcementStore.getState().addComment(data.comment));
socket.on('presence:online', (data) => presenceStore.getState().setOnline(data.userId));
socket.on('presence:offline', (data) => presenceStore.getState().setOffline(data.userId));
socket.on('notification:new', (data) => notificationStore.getState().addNotification(data.notification));
```

### 7.7 Conflict Resolution

For the assessment scope, last-write-wins is acceptable (no OT/CRDT needed). Concurrent PATCH requests to the same entity: the second request overwrites the first. Socket events push the server's authoritative state to all clients after each write, which self-corrects any divergence within one round-trip.

---

## 8. Non-functional Requirements

### 8.1 Performance

| Target | Requirement |
|---|---|
| Initial page load (LCP) | < 2.5s on 4G |
| API response time (p95) | < 300ms for list endpoints |
| Socket event delivery | < 100ms within same region |
| CSV export | < 5s for workspaces with < 10,000 rows |

Techniques:
- Next.js server components for dashboard and goal list (avoid client-side data fetch waterfall).
- Prisma query: always select only needed fields, never `findMany` without a `where` scoped to `workspaceId`.
- Pagination enforced on all list endpoints (max limit 100).
- Cloudinary transformations: request `w_200,h_200,c_fill,f_auto` for avatars.
- `react-window` for virtualised Kanban columns with many items.

### 8.2 Security

- httpOnly cookies prevent XSS token theft.
- `cors()` restricted to `CLIENT_URL`; `credentials: true`.
- All inputs validated with `express-validator` before hitting Prisma.
- Prisma parameterised queries prevent SQL injection.
- Rate limiting: `express-rate-limit` — 10 requests/minute on auth endpoints, 200 req/min on general API.
- Cloudinary uploads: server-side signed upload (backend generates a signed upload URL and returns it; client uploads directly to Cloudinary — keeps API key secret).
- File type validation: `multer` with `fileFilter` allowing only `image/*` MIME types for avatars.
- Helmet.js for security headers.
- Environment secrets never committed; `.env.example` with placeholder values only.

### 8.3 Scalability

For the assessment (single Railway instance), the architecture is sufficient. Future scaling notes:
- Socket.io would require Redis adapter (`socket.io-redis`) for multi-instance deployments.
- Analytics queries should be moved to a read replica or materialized views at scale.
- Cloudinary handles CDN and image scaling externally.

### 8.4 Accessibility

- All interactive elements have `aria-label` or visible label.
- Colour contrast: minimum WCAG AA (4.5:1 for normal text).
- Keyboard navigable: modal focus trap, Escape to close, Tab order follows DOM order.
- Status badges use text + colour (not colour alone).
- Form errors associated with inputs via `aria-describedby`.

### 8.5 Browser Support

- Last 2 versions of Chrome, Firefox, Safari, Edge.
- No IE11 support required.

---

## 9. Development Roadmap

### Advanced Feature Selection Rationale

**Chosen: Optimistic UI (Option 2) + Audit Log (Option 5)**

- Optimistic UI integrates directly into the core Kanban and Goal features, making the app feel polished without requiring extra infrastructure. It is visible to evaluators immediately on interaction.
- Audit Log is a standalone backend concern (one service function + one table) that adds significant evaluator visibility into code organisation and database design, and reuses the already-built admin infrastructure.

Options 1 (collaborative editing) and 3 (offline support) require significant additional libraries (Yjs, service workers) that consume disproportionate time in a 12–16h window. Option 4 (Advanced RBAC) is partially covered by the core two-role system.

---

### Phase 1: Foundation (Days 0–0.5, ~3h)

**Goal:** Monorepo boots, database is connected, auth works end-to-end.

| Step | Task | Deliverable |
|---|---|---|
| 1.1 | `pnpm create turbo@latest` — scaffold monorepo with `apps/web` and `apps/api` | Turborepo root with both apps |
| 1.2 | Configure `turbo.json` with `build`, `dev`, `lint` pipelines; add `packages/config` for shared ESLint | `turbo dev` starts both apps |
| 1.3 | `pnpm create next-app apps/web --app --js --tailwind --no-ts` | Next.js 14 app boots at localhost:3000 |
| 1.4 | `pnpm init` in `apps/api`, install express, cors, cookie-parser, helmet, express-rate-limit, express-validator, bcryptjs, jsonwebtoken, prisma, @prisma/client, cloudinary, multer, socket.io, dotenv | API boots at localhost:4000 |
| 1.5 | Write `prisma/schema.prisma` (full schema from Section 3.2) | `npx prisma migrate dev` succeeds |
| 1.6 | Implement auth controllers: register, login, refresh, logout, me, profile | Postman confirms JWT cookies set correctly |
| 1.7 | Implement `authenticate` middleware | Protected route returns 401 without cookie |
| 1.8 | Build `/login` and `/register` pages with form validation | User can register and log in |
| 1.9 | Build `authStore` (Zustand) and `apiClient` with 401 interceptor + auto-refresh | Token refresh works on page reload |
| 1.10 | Implement Next.js `middleware.js` for route protection | `/workspaces` redirects unauthenticated |
| 1.11 | Build `/profile` page with avatar upload | Avatar appears in UI after upload |
| 1.12 | Create database seed script (`prisma/seed.js`) with 1 demo user + 1 workspace | `prisma db seed` works |

---

### Phase 2: Workspaces & Real-time Core (Day 1, ~3h)

**Goal:** Workspace CRUD works; Socket.io is wired up.

| Step | Task | Deliverable |
|---|---|---|
| 2.1 | Workspace controller: create, list, get, update, delete | All workspace REST endpoints pass |
| 2.2 | Member endpoints: invite, list, update role, remove | Invite by email adds WorkspaceMember |
| 2.3 | `requireWorkspaceMember` middleware | 403 on non-member access |
| 2.4 | Socket.io server setup: attach to Express HTTP server, connection auth, `workspace:join/leave` room management | Socket connects in browser dev tools |
| 2.5 | Presence tracking: `presence:online/offline` events | `presenceStore` updates on second tab open |
| 2.6 | Workspace list page `/workspaces` with `WorkspaceSwitcher` in sidebar layout | User can create and switch workspaces |
| 2.7 | Workspace settings page (name/colour/description edit + member table + invite modal) | Admin can invite a member by email |
| 2.8 | Apply `accentColor` CSS custom property to workspace layout | Sidebar changes colour per workspace |

---

### Phase 3: Goals, Milestones & Optimistic UI (Day 1–2, ~3.5h)

**Goal:** Full goals/milestones feature with optimistic status updates.

| Step | Task | Deliverable |
|---|---|---|
| 3.1 | Goals REST controller (all CRUD) | All goal endpoints pass |
| 3.2 | Milestones sub-resource controller | Milestone CRUD works |
| 3.3 | GoalUpdate (activity feed) controller | POST + GET updates works |
| 3.4 | Emit Socket.io events on all goal mutations | Second browser tab sees new goal without refresh |
| 3.5 | Audit log service + integrate into all goal/milestone controllers | `AuditLog` rows created |
| 3.6 | Goals list page with filter bar, GoalCard, StatusBadge, ProgressRing | Goals display correctly |
| 3.7 | Goal detail page with 3 tabs (Overview, Activity, Action Items) | Milestone list renders with progress sliders |
| 3.8 | Implement optimistic UI for goal status change (GoalCard status toggle) | Status updates instantly; rolls back on simulated 500 |
| 3.9 | Implement optimistic UI for milestone progress slider | Slider moves instantly; rolls back on error |
| 3.10 | GoalForm (create/edit modal) | User can create goal from list page |

---

### Phase 4: Action Items (Day 2, ~2h)

**Goal:** Kanban board is drag-and-droppable; list view works; optimistic reorder.

| Step | Task | Deliverable |
|---|---|---|
| 4.1 | Action item REST controller (CRUD + batch reorder) | All endpoints pass |
| 4.2 | Emit `actionItem:created`, `actionItem:statusChanged` socket events | Real-time column update across tabs |
| 4.3 | Audit log integration for action items | Logs written |
| 4.4 | Install `@hello-pangea/dnd` in `apps/web` | No install errors |
| 4.5 | Build KanbanBoard with 4 columns and draggable cards; default scope = "My Items" (`assigneeId = currentUser`) with "My Items / All Items" scope toggle | Cards can be dragged between columns; toggle switches between personal and full workspace view |
| 4.6 | Optimistic UI for drag: snapshot before, revert on error | Correct rollback demonstrated |
| 4.7 | List view (table with sortable columns) | Toggle between views works |
| 4.8 | CreateActionItemModal with all fields | New items appear in correct column |

---

### Phase 5: Announcements (Day 2, ~2h)

**Goal:** Admins can post rich-text announcements; members react and comment; @mentions notify.

| Step | Task | Deliverable |
|---|---|---|
| 5.1 | Announcement REST controller (CRUD, pin) | All endpoints pass |
| 5.2 | Reaction toggle endpoint | Toggle adds/removes correctly |
| 5.3 | Comment create endpoint with @mention parsing + Notification creation | Mentioned user gets Notification row |
| 5.4 | Audit log integration | Logs written on pin, create, update |
| 5.5 | Socket.io events for all announcement mutations | Feed updates live |
| 5.6 | `notification:new` emitted to `user:${userId}` room | Notification bell badge increments |
| 5.7 | AnnouncementFeed page with pinned section | Pinned announcements shown first |
| 5.8 | Install Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) | Rich text editor renders |
| 5.9 | CreateAnnouncementModal with Tiptap editor | Admin can publish rich text |
| 5.10 | ReactionBar with toggle | Click adds/removes emoji |
| 5.11 | CommentInput with @mention autocomplete (typeahead from `workspaceStore.members`) | @mention shows member dropdown |
| 5.12 | Notification dropdown in top nav (bell icon, unread count, mark-all-read) | Clicking bell shows recent notifications |

---

### Phase 6: Analytics Dashboard (Day 2–3, ~1.5h)

**Goal:** Dashboard shows live stats and chart; CSV export works.

| Step | Task | Deliverable |
|---|---|---|
| 6.1 | Analytics summary query controller | `/analytics/summary` returns correct numbers |
| 6.2 | Goal completion chart query (12-week aggregation) | `/analytics/goal-completion` returns 12 data points |
| 6.3 | CSV export controller | Downloads valid CSV file |
| 6.4 | Install Recharts in `apps/web` | No install errors |
| 6.5 | Dashboard page with 4 StatCards | Numbers match DB state |
| 6.6 | GoalCompletionChart (Recharts BarChart) | Chart renders with data |
| 6.7 | ExportButton triggers download | CSV file downloads correctly |

---

### Phase 7: Audit Log UI (Day 3, ~1h)

**Goal:** Admin-only audit log page with filters and CSV export.

| Step | Task | Deliverable |
|---|---|---|
| 7.1 | Audit log query controller with filters and pagination | Filtered results return correctly |
| 7.2 | Audit log CSV export endpoint | Downloads filtered CSV |
| 7.3 | AuditLogPage at `/workspaces/:id/settings/audit-log` | Timeline renders |
| 7.4 | AuditLogFilters (entityType, actor, date range) | Filter changes update results |
| 7.5 | AuditLogEntry with diff collapsible | Before/after diff displays |

---

### Phase 8: Polish, Seed & Deploy (Day 3, ~2h)

| Step | Task | Deliverable |
|---|---|---|
| 8.1 | Expand seed script: 2 workspaces, 4 users, 5 goals, 10 action items, 3 announcements | Demo account ready |
| 8.2 | Railway project setup: create project, add PostgreSQL plugin, add api service, add web service | Services deployed |
| 8.3 | Set all environment variables in Railway dashboard | Both services start without env errors |
| 8.4 | Run `prisma migrate deploy` on production DB | Schema applied |
| 8.5 | Run seed on production | Demo data visible |
| 8.6 | Smoke test all features on production URLs | All core features confirmed working |
| 8.7 | Write README.md (setup, env vars, advanced feature choices, known limitations) | README complete |
| 8.8 | (Bonus) Add Swagger/OpenAPI docs with `swagger-jsdoc` + `swagger-ui-express` at `/api/docs` | Docs render |

---

### Recommended Commit Convention

```
feat(auth): add JWT refresh token rotation
feat(goals): implement optimistic status update with rollback
feat(announcements): add @mention parsing and notifications
fix(kanban): prevent duplicate reorder on rapid drag
chore(db): add indexes on goal status and dueDate
docs(readme): add env variable reference table
```

---

## 10. Testing Strategy

### 10.1 Backend (Jest + Supertest)

**Setup:** `apps/api/src/__tests__/`, test database via `DATABASE_URL` pointing to a separate test DB or using `prisma.$transaction` rollback pattern.

**Unit tests (target: all service functions):**
- `auth.service.test.js`: password hash, JWT generation, token rotation
- `auditLog.service.test.js`: log function creates correct row
- `mention.service.test.js`: regex parsing extracts correct usernames

**Integration tests (target: all route groups):**
- `auth.routes.test.js`: register → login → refresh → logout flow
- `goals.routes.test.js`: CRUD, permission checks (member cannot delete others' goals)
- `announcements.routes.test.js`: admin creates, member cannot create, reactions toggle
- `actionItems.routes.test.js`: create, reorder, Kanban status change

**Test coverage target:** 70% line coverage on controllers and services.

### 10.2 Frontend (React Testing Library)

**Setup:** `apps/web/__tests__/`, mock `apiClient` module.

**Unit tests (target: key components):**
- `LoginForm.test.js`: validation errors, submit calls store action
- `GoalCard.test.js`: renders status badge, optimistic update fires on click
- `ReactionBar.test.js`: toggle adds/removes emoji, count updates
- `KanbanBoard.test.js`: columns render, card count matches status group

**Coverage target:** 60% for components with business logic.

### 10.3 End-to-End

Not required by the assignment but if time permits: Playwright basic smoke test covering register → create workspace → create goal → change status.

### 10.4 Manual Test Checklist (pre-submission)

- [ ] Register new user, log in, upload avatar
- [ ] Create workspace, invite second user (open incognito tab)
- [ ] Second user sees workspace in list
- [ ] Create goal → second tab shows new goal without refresh
- [ ] Drag Kanban card → status changes → both tabs updated
- [ ] Admin posts announcement → member tab shows it live
- [ ] Member reacts → reaction count updates on admin tab
- [ ] Member comments with @mention → admin gets notification bell
- [ ] Dashboard stats match actual DB counts
- [ ] CSV export downloads and opens in spreadsheet
- [ ] Audit log shows all mutations
- [ ] Logout clears cookies, redirects to login

---

## 11. Deployment & DevOps

### 11.1 Local Development

```bash
# Clone repo
git clone https://github.com/<username>/collaborative-team-hub.git
cd collaborative-team-hub

# Install dependencies
pnpm install

# Set environment variables
cp apps/api/.env.example apps/api/.env
# Fill in: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLOUDINARY_*, CLIENT_URL

# Run database migrations
cd apps/api && npx prisma migrate dev && cd ../..

# Seed database
cd apps/api && npx prisma db seed && cd ../..

# Start all services (turborepo parallel)
pnpm dev
# web → http://localhost:3000
# api → http://localhost:4000
```

### 11.2 Environment Variables

**`apps/api/.env`**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/team_hub
JWT_ACCESS_SECRET=<random-32-char-string>
JWT_REFRESH_SECRET=<random-32-char-string>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=4000
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 11.3 Railway Deployment

1. Push repo to GitHub (public).
2. Create new Railway project → "Deploy from GitHub repo".
3. Add **PostgreSQL plugin** to the project (auto-injects `DATABASE_URL` into api service).
4. Create **api service**: root directory = `apps/api`, build command = `npm run build` (add `"build": "prisma generate && prisma migrate deploy"` to api package.json scripts), start command = `node src/index.js`.
5. Create **web service**: root directory = `apps/web`, build command = `npm run build`, start command = `npm run start`.
6. Set environment variables in each service's "Variables" panel.
7. Add Railway health check: `GET /api/health` returning 200 (add this endpoint to Express).
8. Trigger deploy; check build logs for Prisma migration success.
9. Run seed: Railway CLI `railway run --service api npx prisma db seed` or temporarily add seed to build script.

### 11.4 turbo.json Configuration

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

### 11.5 package.json Root Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 11.6 Railway-specific Notes

- Railway automatically assigns `PORT` — Express must use `process.env.PORT || 4000`.
- Next.js on Railway: set `PORT` env to whatever Railway assigns (Railway handles this automatically for `npm run start`).
- CORS: `CLIENT_URL` must exactly match the Railway web service URL (no trailing slash).
- Cookie `SameSite`: set to `None` and `Secure: true` in production (cross-origin between Railway domains); `Lax` in development.

---

## 12. Open Questions & Assumptions

### Assumptions Made

| ID | Assumption | Impact if Wrong |
|---|---|---|
| A1 | Invitations for non-registered users are stored in an `Invitation` table (email + workspaceId + role + token) but not sent via email unless the bonus email feature is built. The invite link is only surfaced in the UI as a "pending invitations" list. | Low — if email is required for all invites, add Nodemailer and send a registration link. |
| A2 | "Post progress updates on a goal's activity feed" means plain-text posts (not rich text). | Low — add Tiptap to GoalUpdate if rich text is needed. |
| A3 | Emoji reactions are a predefined set (e.g., 6 common emoji: 👍 ❤️ 🎉 😂 😮 😢). Free-form emoji picker is a bonus enhancement. | Low — swap in `emoji-mart` picker if open emoji is needed. |
| A4 | "Kanban board" uses 4 fixed columns matching the `ActionItemStatus` enum. Custom columns are out of scope. | Low — would require significant schema change (column table). |
| A5 | CSV export is synchronous (generated on request). For large workspaces (>10k rows) this may time out on Railway's 30s request limit. For the assessment dataset (demo seed), this is fine. | Low at assessment scale. |
| A6 | The two advanced features chosen are Optimistic UI and Audit Log. This is stated in the README as required. | None — just needs to be documented. |
| A7 | "Active Members" stat on the dashboard is defined as members who appear as actor in AuditLog in the past 7 days. | Low — could also mean members with a Socket.io session. |
| A8 | Socket.io auth uses the access token read from `document.cookie` (not a separate API call). On token expiry during a Socket session, the socket reconnects automatically; re-read of cookie will use the refreshed token if the `apiClient` interceptor ran first. | Medium — if token expiry causes persistent socket auth failure, add a `socket.auth.token` update on refresh. |

### Resolved Questions

| # | Question | Decision |
|---|---|---|
| Q1 | Should workspace members be able to create goals, or only Admins? | **Resolved:** Both ADMIN and MEMBER may create goals. Reflected in §4.5, §5.3, §6.3. |
| Q3 | Does "pin" remove a previous pin (only one pinned at a time) or allow multiple? | **Resolved:** Single exclusive pin — at most one pinned announcement per workspace at a time. Atomic unpin-then-pin via `prisma.$transaction`. Reflected in §3.2, §4.7, §5.4. |
| Q4 | Should the Kanban board default to all workspace items or only the current user's items? | **Resolved:** Default is "My Items" (current user's assignees). An "All Items" toggle overrides via `?assigneeId=all`. Reflected in §4.6, §5.5, Phase 4 roadmap. |

### Open Questions (Clarify with FredoCloud if time permits)

| # | Question | Why it matters |
|---|---|---|
| Q2 | Is rich text required for goal descriptions as well, or just announcements? | If yes, Tiptap must be integrated into GoalForm too. |
| Q5 | Are dark/light theme, keyboard shortcuts, and email notifications required for full marks, or are they strictly optional bonus? The evaluation table does not explicitly score them separately. | Time allocation decision. |
