# TeamFlow Client

A React + Tailwind frontend for the TeamFlow API (projects, tasks, RCAs,
comments, attachments, notifications, reports).

## Stack

- **React 18** + **React Router 6** (client-side routing, protected routes)
- **Tailwind CSS** (utility classes only, no component library, minimal palette)
- **Vite** (dev server + build)
- Plain `fetch` — no axios/query library, so the API layer stays a small,
  auditable set of classes (see below)

## Getting started

```bash
cp .env.example .env      # defaults to /api via the Vite dev proxy
npm install
npm run dev                # http://localhost:5173
```

The dev server proxies `/api/*` to `http://localhost:4000` (the TeamFlow
backend) — see `vite.config.js`. Override the target with
`VITE_API_PROXY_TARGET` if your backend runs elsewhere.

```bash
npm run build               # production build -> dist/
npm run preview              # serve the production build locally
```

## Architecture (OOP API layer)

Every backend route is wrapped by a small class, so the UI never builds a
URL or parses an error by hand:

```
src/api/
  ApiError.js        - normalized error type (status, details, isNotFound, ...)
  ApiClient.js        - fetch wrapper: auth header, timeout, JSON (de)serialization
  TokenStore.js       - single place the JWT lives
  BaseService.js      - shared constructor for every resource service
  AuthService.js       ─┐
  ProjectService.js     │  one class per backend resource, one method
  TaskService.js        │  per route (create/list/getOne/update/...),
  RcaService.js         │  named and shaped to match src/routes/*.js
  CommentService.js     │  and src/validators/*.js in the backend exactly
  AttachmentService.js  │
  NotificationService.js│
  ReportService.js      ─┘
  index.js            - composition root: one ApiClient + all services,
                         exported as the `api` singleton used everywhere
```

Everywhere else in the app imports `{ api }` from `src/api` and calls
`api.tasks.create(...)`, `api.rcas.submit(...)`, etc. — no component ever
touches `fetch` directly. Adding a new backend route means adding one method
to the matching service class, not touching UI code.

React state/composition (context, hooks, components) is layered on top of
that OOP core using the idioms React actually rewards — a class-based
`AuthContext` component tree would fight the framework for no benefit.

## Project structure

```
src/
  api/            see above
  context/        AuthContext (wraps AuthService with React state)
  hooks/          useAsync (generic load/error/data state machine)
  components/
    common/       Button, Input, Select, Textarea, Modal, ConfirmDialog,
                   Badge/StatusBadge/PriorityBadge/SeverityBadge, Tabs,
                   Pagination, Spinner/EmptyState/ErrorBanner
    layout/       Navbar, AppLayout, ProtectedRoute
    projects/     ProjectCard/Form, Member list/add form,
                   Tasks/Rcas/Members/Reports/Settings panels (project tabs)
    tasks/        TaskCard, TaskBoard (kanban, drag & drop), TaskList (table),
                   TaskFilters, TaskForm
    rca/          RcaCard/Form, RcaSectionEditor, ReviewerList,
                   AssignReviewerForm, ReviewDecisionForm
    comments/     CommentList (safe mention rendering), CommentForm
    attachments/  AttachmentList, AttachmentUpload
    notifications/NotificationBell (polling dropdown)
  pages/          one per route: Login, Register, Projects, ProjectDetail,
                  TaskDetail, RcaDetail, Settings, NotFound
```

## Visual design

The UI is intentionally monochrome (the `brand` gray scale) with **one accent
gradient** (`indigo → violet → fuchsia`, defined once in `tailwind.config.js`
as `accent-gradient` / `accent-gradient-soft` / `accent-gradient-text`) used
consistently for things that mean "primary action" or "this is a core
entity": the logo, primary buttons, the active nav link, the active tab
underline, the kanban board/list toggle, entity-card top rails (project/RCA
cards), the notification-count badge, and workload bars on the reports page.
Everything else - text, borders, secondary buttons, table rows - stays
neutral gray so the accent doesn't get diluted into noise.

## UX choices worth knowing about

- **Board or list, your choice.** Each project remembers a view preference
  (`kanban`/`list`) via `PATCH /projects/:id/view-preference`; switching
  views persists it for next time.
- **Kanban drag-and-drop** calls the same `PATCH /tasks/:id/status` the
  dropdown on the task detail page uses — the backend's allowed-transition
  rules are the single source of truth, so an illegal drag just surfaces the
  backend's error message instead of silently failing.
- **Non-blocking warnings.** Task create/update surfaces "assignee looks
  overloaded" as an inline warning, matching the backend's design of
  warning-not-blocking.
- **Reviewer prompts.** A reviewer only sees the approve/reject form on an
  RCA when they are, in fact, an assigned reviewer with no decision yet.

## Security notes

- **No token in `localStorage`.** The JWT lives in memory
  (`TokenStore`), mirrored into `sessionStorage` only so a refresh doesn't
  force a re-login (cleared when the tab closes). This is a mitigation, not
  a fix — an XSS bug can still read it. The real fix is the backend issuing
  an httpOnly session cookie instead of a bearer JWT; `TokenStore` is
  written as the one place that would need to change if that happens.
- **A baseline CSP** is set in `index.html` (`script-src 'self'`, no
  `object-src`, no framing). Prefer setting the equivalent as a real HTTP
  header at your reverse proxy/CDN in production — a `<meta>` CSP can't set
  `frame-ancestors` in every browser and is easy to forget to update.
- **No `dangerouslySetInnerHTML` anywhere.** Comment `@[Name](id)` mentions
  are parsed into plain React text/`span` nodes (see `CommentList.jsx`), so
  user-authored text is never interpreted as markup — React's default
  escaping does the rest.
- **Client-side validation never replaces server validation.** Forms mirror
  the backend's zod constraints (max lengths, required fields, enums) purely
  for fast feedback; every mutation still round-trips through the real
  validators in `src/validators/*.js` on the backend, and `ApiError` surfaces
  those messages verbatim rather than a client-guessed one.
- **Uploads** are capped client-side to the same `MAX_UPLOAD_MB` the backend
  enforces (`AttachmentService`), so oversized files fail fast instead of
  wasting a round trip — the backend's `multer` limit is still what actually
  protects the server.
- **401 handling is centralized.** `ApiClient` calls one registered
  "unauthorized" handler on any 401, which `AuthContext` uses to clear the
  token and drop back to the login screen — no component has to remember to
  handle a dead session itself.
- **CORS/same-origin.** In production, serve this build from the same origin
  as the API (behind one reverse proxy) rather than pointing `VITE_API_BASE_URL`
  at a cross-origin host; that avoids needing a permissive CORS policy on the
  API at all.

## Known gaps (matching the backend's own "Known Limitations")

- No attachment download/delete UI — the backend doesn't currently wire up
  routes for `GET`/`DELETE` on a single attachment (only list + upload), so
  there's nothing for the UI to call yet.
- No comment delete UI, for the same reason (`DELETE` isn't routed).
- Notifications are polled every 30s rather than pushed; there's no
  websocket/SSE endpoint on the backend to subscribe to yet.
