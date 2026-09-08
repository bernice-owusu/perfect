# AGENTS.md

## Project Overview

React SPA + Express API server for a Ghanaian e-commerce storefront ("Perfect For You"). AI Studio origin app.

## Commands

- `npm run dev` — starts both API + Vite dev server via `tsx server.ts` (port 3000)
- `npm run lint` — runs `tsc --noEmit` (TypeScript check only, no ESLint/Prettier)
- `npm run build` — Vite build + esbuild bundles `server.ts` into `dist/server.cjs`
- `npm run start` — runs bundled production server from `dist/server.cjs`

No test runner or test files exist in this repo.

## Architecture

**Server** (`server.ts`): Single Express file. All API routes (`/api/*`), data seeding, and Vite middleware live here. In dev mode it injects Vite middleware; in production it serves `dist/` static files.

**Data layer**: `data/store.json` is the persistent store. On first boot, `server.ts` seeds it with hardcoded products, categories, orders, settings, and reviews. All writes go through `saveData()` which flushes the full store to this JSON file. There is no database.

**Frontend**: React 19 SPA in `src/`. Uses `StoreContext.tsx` as the central state store (fetches from `/api/*` on mount). Cart and wishlist persist in `localStorage`. Routing is in-memory (`currentRoute` state), not React Router.

**Admin portal**: Navigate to `/perfectadmin` (URL path or hash). Login hardcoded in `server.ts`: `admin@perfectforyou.com` / `admin123`.

**Styling**: Tailwind CSS v4 via `@tailwindcss/vite`. Custom theme defined in `src/index.css` using `@theme` block. Key design tokens: `--color-forest` (#1a3c34), `--color-cream` (#f5f2ed), `--color-earth` (#5a5a40). Fonts: Playfair Display (serif), Plus Jakarta Sans (sans).

## Important Gotchas

- **Tailwind v4 syntax**: Uses `@import "tailwindcss"` and `@theme {}` blocks, NOT the old v3 `@tailwind` directives or `tailwind.config.js`. The Tailwind plugin is `@tailwindcss/vite` (not PostCSS).
- **Path alias**: `@/*` maps to repo root (configured in both `tsconfig.json` and `vite.config.ts`).
- **HMR can be disabled**: `DISABLE_HMR=true` env var turns off file watching (used by AI Studio agent to prevent flicker during edits). Do not re-enable it.
- **Prices are decimals**: All prices in `data/store.json` and the API use raw decimal values (e.g., `0.80` for GH₵0.80). `formatPrice()` in `src/utils/format.ts` formats with `.toFixed(2)`.
- **Product deletion is soft**: `DELETE /api/products/:id` sets `is_active: false`, not a hard delete.
- **Order tracking**: `/api/orders/track` endpoint uses `order_number` query param (e.g., `PFY-000101`).
- **No `.env.local` file**: The README references it but it doesn't exist in the repo. Only `.env.example` exists. For local dev, create `.env.local` with `GEMINI_API_KEY`.
- **Currency**: GH₵ (Ghana Cedis). Delivery zones are Ghana-specific with cedi-denominated fees.
