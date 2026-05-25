# Mini InsightOps

A full-stack prototype console for exploring AI-driven insight events across map, dashboard, and table views, with server-enforced role-based access control (RBAC).

**Live demo:** https://full-stack-prototype-eta.vercel.app

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Test Users](#test-users)
- [API Reference](#api-reference)
- [RBAC](#rbac)
- [Key UX Flows](#key-ux-flows)
- [Tradeoffs & Shortcuts](#tradeoffs--shortcuts)
- [Environment Variables](#environment-variables)

---

## Overview

Mini InsightOps is a prototype web application for visualizing and managing "Insight Events" — categorized, scored observations that can be plotted on a map, explored in a dashboard with charts, and managed via a filterable data table. Authentication and authorization are enforced both on the frontend and in every API route.

---

## Features

- **Dashboard** — summary charts and highlighted events built with Recharts
- **Map view** — interactive event markers with a side detail panel, powered by MapLibre (no API key required)
- **Event table** — filterable, sortable, paginated list with full CRUD (role-permissioned)
- **User management** — admin-only panel for updating user roles
- **RBAC** — three roles (Admin, Analyst, Viewer) enforced server-side on all API endpoints
- **In-memory data store** — seeded with 30+ events, no database setup needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Maps | MapLibre GL + react-map-gl |
| Charts | Recharts |
| Auth | Custom in-memory token auth |
| Data store | In-memory (server-side) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Redirects to /login
│   ├── layout.tsx            # Global layout + theme
│   ├── globals.css           # Global styles
│   ├── login/page.tsx        # Login UI and auth flow
│   ├── dashboard/page.tsx    # Charts + event highlights
│   ├── map/page.tsx          # Map with filters and detail panel
│   ├── events/page.tsx       # Table with filters, sorting, pagination, CRUD
│   ├── users/page.tsx        # Admin-only user role management
│   └── api/
│       ├── auth/login/       # POST — authenticate and get token
│       ├── auth/me/          # GET — current user from token
│       ├── events/           # GET list, POST create
│       ├── events/[id]/      # GET, PUT, DELETE single event
│       ├── users/            # GET list (admin only)
│       └── users/[id]/       # PUT role update (admin only)
├── components/
│   ├── AppShell.tsx          # Main layout shell + navigation
│   ├── AuthGate.tsx          # Client-side auth guard + redirect
│   ├── InsightMap.tsx        # Map rendering (react-map-gl / MapLibre)
│   ├── SectionCard.tsx       # Dashboard card wrapper
│   └── useAuthState.tsx      # Auth state hook
└── lib/
    ├── data.ts               # In-memory store, filters, CRUD helpers
    ├── auth.ts               # Session/token management (in-memory)
    ├── validation.ts         # Event payload validation
    ├── types.ts              # Shared TypeScript types
    ├── client.ts             # Frontend auth store + API fetch helper
    └── format.ts             # Date formatting utilities
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:3000` in your browser. The app redirects to the login page automatically.

**Other scripts:**

```bash
npm run build   # Production build
npm run start   # Start the production server
npm run lint    # Run ESLint
```

---

## Test Users

All test accounts share the password `password`.

| Email | Role | Permissions |
|---|---|---|
| admin@test.com | Admin | Full access + user management |
| analyst@test.com | Analyst | Read + create/edit events |
| viewer@test.com | Viewer | Read-only |

---

## API Reference

All protected routes require the header:

```
Authorization: Bearer <token>
```

The token is returned by `/api/auth/login` and stored in `localStorage` by the frontend.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate; returns `{ token, user }` |
| GET | `/api/auth/me` | Returns the current user for a valid token |

**Login request body:**
```json
{ "email": "admin@test.com", "password": "password" }
```

### Events

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/events` | Any role | List events with optional filters |
| POST | `/api/events` | Admin, Analyst | Create a new event |
| GET | `/api/events/:id` | Any role | Get a single event |
| PUT | `/api/events/:id` | Admin, Analyst | Update an event |
| DELETE | `/api/events/:id` | Admin only | Delete an event |

**Supported query parameters for `GET /api/events`:**

| Parameter | Description |
|---|---|
| `category` | Filter by event category |
| `severity` | Filter by severity level |
| `lastDays` | Events from the last N days |
| `minScore` | Minimum insight score |
| `q` | Full-text search |
| `page` | Page number (default: 1) |
| `pageSize` | Results per page |
| `sort` | Sort field |
| `order` | `asc` or `desc` |

### Users

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/users` | Admin only | List all users |
| PUT | `/api/users/:id` | Admin only | Update a user's role |

**Role update request body:**
```json
{ "role": "viewer" }
```

---

## RBAC

Role-based access control is enforced at two layers:

- **Frontend** — UI controls (create, edit, delete buttons; user management link) are hidden based on the current user's role.
- **Server-side** — every API route validates the token and checks the required role via `authService.requireRole`. Requests with insufficient permissions receive a `403 Forbidden` response.

| Permission | Viewer | Analyst | Admin |
|---|---|---|---|
| View dashboard, map, events | Yes | Yes | Yes |
| Create / edit events | No | Yes | Yes |
| Delete events | No | No | Yes |
| View / manage users | No | No | Yes |

---

## Key UX Flows

1. **Login** — enter credentials on `/login`; successful auth stores the token and redirects to `/dashboard`.
2. **Dashboard** — view aggregated charts and highlighted events at a glance.
3. **Map** — browse events as geo-markers; apply category/severity filters; click a marker to open the detail panel.
4. **Event table** — filter, sort, and paginate events; create or edit events (Analyst+); delete events (Admin).
5. **User management** — Admin-only page at `/users` to change the role of any account.

---

## Tradeoffs & Shortcuts

- **In-memory store** — data resets on every server restart; no persistence layer by design.
- **In-memory token store** — auth tokens are held in server memory; tokens are lost on restart and there is no refresh flow.
- **Lightweight validation** — event payloads are validated with hand-written field checks rather than a schema library (e.g. Zod).
- **No real AI backend** — events are pre-seeded mock data; the "AI-driven" framing is conceptual for the prototype.

---

## Environment Variables

No environment variables are required. The map uses an open MapLibre style that does not need an API key.
