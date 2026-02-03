# Mini InsightOps — Project Documentation

## What it does
- Prototype web app to explore “Insight Events” on a dashboard, map, and table.
- Role‑based access control (RBAC) with Admin, Analyst, Viewer roles.
- Admin: full access + user management.
- Analyst: create/edit events.
- Viewer: read‑only.
- Server‑side RBAC enforcement on all API endpoints.

## High‑level architecture
- Next.js App Router frontend and backend (API routes).
- In‑memory data store (seeded with 30+ events).
- Map rendering via MapLibre + react‑map‑gl.
- Charts via Recharts.

## Project structure (key folders/files)

### `src/app`
- `page.tsx` — Redirects to `/login`.
- `layout.tsx`, `globals.css` — Global layout + theme + typography.
- `login/page.tsx` — Login UI, handles auth.
- `dashboard/page.tsx` — Insights dashboard charts + highlights.
- `map/page.tsx` — Map view with filters + side detail panel.
- `events/page.tsx` — Event table with filters, sorting, pagination, CRUD.
- `users/page.tsx` — Admin‑only user role management.
- `api/*` — Backend API routes.

### `src/app/api`
- `auth/login` — POST login; returns token + user.
- `auth/me` — GET current user from token.
- `events` — GET list with filters; POST create (admin/analyst).
- `events/[id]` — GET, PUT (admin/analyst), DELETE (admin).
- `users` — GET list (admin only).
- `users/[id]` — PUT role update (admin only).

### `src/lib`
- `data.ts` — In‑memory store + filters + CRUD.
- `auth.ts` — Session/token auth in memory.
- `validation.ts` — Event payload validation.
- `types.ts` — Shared types.
- `client.ts` — Frontend auth store + API fetch helper.
- `format.ts` — Date formatting helper.

### `src/components`
- `AppShell.tsx` — Main layout shell + navigation.
- `AuthGate.tsx` — Client‑side gate and redirect.
- `InsightMap.tsx` — Map rendering (react‑map‑gl/maplibre).
- `SectionCard.tsx` — Dashboard cards.
- `useAuthState.tsx` — Local auth state hook.

## How to run
```bash
npm install
npm run dev
```
Then open the printed local URL (typically `http://localhost:3000` or next available).

## Test users
- `admin@test.com` / `password`
- `analyst@test.com` / `password`
- `viewer@test.com` / `password`

## API usage (summary)

### Auth
- `POST /api/auth/login`
  ```json
  { "email": "admin@test.com", "password": "password" }
  ```

### Events
- `GET /api/events` supports filters:
  - `category`, `severity`, `lastDays`, `minScore`, `q`, `page`, `pageSize`, `sort`, `order`
- `POST /api/events` (admin/analyst)
- `GET /api/events/:id`
- `PUT /api/events/:id` (admin/analyst)
- `DELETE /api/events/:id` (admin)

### Users
- `GET /api/users` (admin)
- `PUT /api/users/:id` (admin)
  ```json
  { "role": "viewer" }
  ```

Auth is via `Authorization: Bearer <token>` (token is stored in localStorage by the app).

## RBAC enforcement
- Frontend hides controls based on role.
- Server‑side checks enforced in API routes via `authService.requireRole`.

## Key UX flows
1) Login → Dashboard  
2) Map view with filters + clickable markers  
3) Table view with pagination + create/edit/delete  
4) User management (admin only)
