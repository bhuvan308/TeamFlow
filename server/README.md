# TeamFlow API

Express + PostgreSQL backend for TeamFlow: project/task management, dependency
tracking, RCA investigations with mandatory reviewer sign-off, a single
notification event pipeline (in-app + email, deduplicated), and reporting/export.

## Setup

```bash
npm install
cp .env.example .env    # then fill in DATABASE_URL, JWT_SECRET, SMTP_*
createdb teamflow        # or point DATABASE_URL at an existing instance
npm run migrate
npm run seed              # optional demo data (3 users, a project, tasks, an RCA)
npm run dev
```

API listens on `http://localhost:4000` (see `PORT` in `.env`). Health check: `GET /health`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | Signing secret for auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Email dispatch for the notification pipeline |
| `UPLOAD_DIR` | Local disk path for attachments (dev only - swap `src/storage/localDriver.js` for an S3 driver in prod) |
| `MAX_UPLOAD_MB` | Upload size limit |

## Assumptions made

- Single organisation, no multi-tenant isolation beyond project membership.
- "Blocked by" dependency is the only relation type; there's no "related to"
  or "duplicates" edge, since the doc only calls out blocking dependencies.
- Reviewer decisions are final once recorded — no "un-deciding," only removing
  an *undecided* reviewer (covers "reviewer becomes unavailable").
- Notification dedupe is scoped to (user, event, entity, state) — a genuinely
  new event (e.g. reassigning after unassigning) is treated as a new alert,
  not a duplicate of the original.
- CSV export runs the same filtered query as the list view rather than a
  separate reporting path, so exported rows always match what's on screen.

## Features implemented

- JWT auth, project membership with roles (owner/admin/member/viewer)
- Kanban/calendar/list view preference stored per user per project
- Tasks with parent/subtask nesting, dependency graph with cycle detection
- Status lifecycle enforced via an explicit transition table; dependency
  conflicts and assignee overload surfaced as non-blocking warnings
- RCA workflow: draft sections → submit (requires complete sections + at
  least one reviewer) → review decisions → auto-resolve to closed/rejected
  once every assigned reviewer has decided
- Notification pipeline: every alert is written to `notifications` (acting as
  both audit log and dedupe check via a DB unique constraint) before
  dispatch; email respects per-user opt-out
- Append-only `activity_logs` for task/RCA state changes
- Dashboard aggregations (completion rate, workload, velocity, RCA volume,
  project health) computed live per request
- CSV export scoped to active list filters
- Polymorphic comments (with @mention parsing) and attachments on tasks/RCAs

## Known limitations

- In-app notifications are read on-demand (polling), not pushed via WebSocket.
- Email delivery failures are recorded as `failed` and surfaced to the caller,
  not silently retried in the background (matches the product doc's stated
  tradeoff).
- Rate limiting (`middleware/rateLimiter.js`) is in-memory and per-instance —
  fine for a single server, would need a Redis-backed limiter to scale
  horizontally.
- File attachments are stored on local disk in dev via `storage/localDriver.js`;
  swapping to S3/GCS means writing one new driver with the same `save/read/remove`
  interface, no other code changes required.
- No content scanning on uploaded files beyond mime type and size.

## Testing

```bash
node --test tests/
```

Requires `DATABASE_URL` pointed at a real (ideally disposable/test) Postgres
instance with migrations applied — tests exercise the actual service layer
against the database rather than mocking the data layer.
