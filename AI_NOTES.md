# AI Notes

## What I used AI for (and why)
- Scaffolded the overall app structure and identified an efficient division between API routes, data store, and UI pages.
- Drafted initial versions of the API routes, validation helpers, and UI layouts to accelerate development under the 2-day timebox.

## Prompts / high-level summaries
- "Generate a Next.js app router prototype with RBAC, in-memory API, and map + dashboard pages."
- "Create clean, modern UI layouts for a dashboard, map view, and event table with filters."

## What I changed/refactored afterwards
- Standardized naming and data shapes across API + UI.
- Added validation and consistent error handling for API responses.
- Simplified UI state handling and removed unused code paths.
- Ensured RBAC is enforced both in the UI and on server routes.

## What I would improve next with more time
I would add persistent storage (SQLite/Postgres) with migrations, unit tests for filtering/validation logic, and optimistic UI updates for event mutations. I’d also implement marker clustering/heatmaps on the map, saved filters per user, and refine the design system with a reusable component library and accessibility-focused interactions.
