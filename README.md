# Mini InsightOps

Live demo: https://full-stack-prototype-eta.vercel.app

Prototype console for exploring AI-driven insight events across map, dashboard, and table views with RBAC enforced on the API.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test Users

All users share the password `password`.

- admin@test.com (Admin)
- analyst@test.com (Analyst)
- viewer@test.com (Viewer)

## Tech Notes

- Frontend: Next.js App Router + React + TypeScript + Tailwind
- Backend: Next.js API routes (in-memory data store)
- Maps: MapLibre via react-map-gl, no API key needed
- Charts: Recharts

## API Summary

- Auth: `POST /api/auth/login`
- Events: `GET /api/events`, `GET /api/events/:id`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- Users (admin only): `GET /api/users`, `PUT /api/users/:id`

## RBAC

- Admin: full access, manage users
- Analyst: read + create/edit events
- Viewer: read-only

## Tradeoffs / Shortcuts

- In-memory store resets on server restart.
- Authentication tokens are stored in memory for prototype speed.
- Validation is lightweight and field-focused (no schema lib).

## Optional Environment Variables

None required. The map uses an open MapLibre style.
