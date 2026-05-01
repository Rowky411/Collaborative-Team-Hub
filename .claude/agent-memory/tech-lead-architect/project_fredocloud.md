---
name: FredoCloud Collaborative Team Hub Assessment
description: Intern technical assessment project context — mandatory stack, features, scoring, and deadline
type: project
---

Full-stack intern assessment for FredoCloud (Sharjah, UAE). Deadline: 3 days from receipt (received ~2026-05-01). Expected effort: 12–16 hours. Individual submission.

**Stack is 100% mandatory — no deviations allowed:**
- Monorepo: Turborepo
- Frontend: Next.js 14+ App Router, JavaScript only (no TypeScript)
- Styling: Tailwind CSS
- State: Zustand
- Backend: Node.js + Express.js REST API
- Database: PostgreSQL + Prisma ORM
- Auth: JWT access + refresh tokens in httpOnly cookies
- Real-time: Socket.io
- File storage: Cloudinary (avatars & attachments)
- Deployment: Railway (frontend + backend as separate services, one project)
- Charts: Recharts (specified for analytics)

**Core features (all required):** Auth, Workspaces, Goals & Milestones, Announcements, Action Items, Real-time & Activity, Analytics.

**Advanced features — must pick exactly 2** (recommended: Optimistic UI + Audit Log for best ROI in 12–16h).

**Scoring rubric (100 pts):**
- Functionality: 25
- Code Quality: 20
- Monorepo Architecture: 15
- UI/UX: 15
- Advanced Features: 10
- Performance: 10
- Documentation: 5
- Bonus: up to 10 (tests, email, Swagger, UI creativity)

**Submission requirements:** Live Railway URLs, public GitHub repo with conventional commits, README.md, 3–5 min video walkthrough, seeded demo account.

**Why:** Candidate evaluation — evaluators look at production correctness, code organisation, and Turborepo setup quality.

**How to apply:** Always align specs and task breakdowns to the mandatory stack. Never suggest TypeScript. Prioritise shipping all core features before touching bonus items. Recommend Optimistic UI + Audit Log as the 2 advanced features (high evaluator visibility, manageable scope).
