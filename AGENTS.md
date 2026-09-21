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

**Data layer**: MongoDB (Atlas) is the ONLY store — `mongodb` driver, single `store` document in the default DB (shape matches the old `data/store.json`; no schema). `DATABASE_URL` (in `.env`) is REQUIRED; the server refuses to boot without it (no JSON-file fallback — `data/store.json` was removed). On a brand-new/empty DB, `initStore()` seeds only default categories + settings; products/orders/reviews start empty and are entered via the admin panel. All writes flow through `saveData()` → `persistStoreToDb()` (upserts the whole store doc, bumps `storeRevision`). The local network must be able to resolve `*.j6f3hak.mongodb.net` — **use a direct (non-SRV) connection string** because TXT/SRV lookups time out on this machine (replicaSet: `atlas-vrzicf-shard-0`, authSource: `admin`).

**Frontend**: React 19 SPA in `src/`. Uses `StoreContext.tsx` as the central state store (fetches from `/api/*` on mount). Cart and wishlist persist in `localStorage`. Routing is in-memory (`currentRoute` state), not React Router.

**Admin portal**: Navigate to `/perfectadmin` (URL path or hash). Login hardcoded in `server.ts`: `admin@perfectforyou.com` / `admin123`. Logged-in admin sends `Authorization: Bearer <token>` on every admin API call (helpers: `adminToken()`/`adminHeaders()` in `AdminPortal.tsx`). Admin tokens are in-memory in `server.ts` and invalidated on `/api/admin/logout`.

**API auth**: Public routes: `GET /api/products*`, `GET /api/categories`, `GET /api/settings`, `GET /api/reviews`, `GET /api/health`, `GET /api/revision`, `POST /api/orders`, `POST /api/paystack/verify`, `GET /api/paystack/public-key`, `POST /api/admin/login`. Everything else (`GET /api/orders`, `PUT /api/settings`, product/category/review mutations, order status, upload, admin stats, logout) requires `requireAdmin`. `GET /api/orders` is admin-only because it exposes customer PII; the storefront only fetches orders when signed in.

**Styling**: Tailwind CSS v4 via `@tailwindcss/vite`. Custom theme defined in `src/index.css` using `@theme` block. Key design tokens: `--color-forest` (#1a3c34), `--color-cream` (#f5f2ed), `--color-earth` (#5a5a40). Fonts: Playfair Display (serif), Plus Jakarta Sans (sans).

## Important Gotchas

- **Tailwind v4 syntax**: Uses `@import "tailwindcss"` and `@theme {}` blocks, NOT the old v3 `@tailwind` directives or `tailwind.config.js`. The Tailwind plugin is `@tailwindcss/vite` (not PostCSS).
- **Path alias**: `@/*` maps to repo root (configured in both `tsconfig.json` and `vite.config.ts`).
- **HMR can be disabled**: `DISABLE_HMR=true` env var turns off file watching (used by AI Studio agent to prevent flicker during edits). Do not re-enable it.
- **Prices are decimals**: All prices in the store (and API responses) use raw decimal values (e.g., `0.80` for GH₵0.80). `formatPrice()` in `src/utils/format.ts` formats with `.toFixed(2)`.
- **Product deletion is hard**: `DELETE /api/products/:id` removes the product (and its reviews) from the store; it is not a soft delete.
- **Delivery is not booked at checkout**: Customers give contact info + pay; the team reaches out within 24 hours to arrange delivery. There is no order-tracking feature (no `/api/orders/track`, removed).
- **Env file**: a single `.env` (gitignored) holds everything — `DATABASE_URL` (required — the server exits without it) plus the live Paystack keys. `.env.example` documents the needed vars. There is no `.env.local`.
- **Currency**: GH₵ (Ghana Cedis). Delivery zones are Ghana-specific with cedi-denominated fees.
- **Paystack is live, not simulated**: checkout opens the real Paystack inline popup (`https://js.paystack.co/v1/inline.js`, channels card + mobile_money, amount in pesewas). The browser gets the public key from `GET /api/paystack/public-key` (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`); the server verifies every transaction with `PAYSTACK_SECRET_KEY` against `GET https://api.paystack.co/transaction/verify/:reference` (including an amount check) before creating the order. `POST /api/paystack/verify` returns `verified:false` for unknown references.

## Deployment

**Render** (primary): `render.yaml` defines a Node web service — build `npm install && npm run build`, start `npm start` (`dist/server.cjs`), health check `/api/health`. Set `DATABASE_URL`, `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `NODE_ENV=production` in the dashboard. A 1GB disk is mounted at `/opt/render/project/src/public/uploads` so uploaded images survive deploys (paid plan required). Atlas Network Access must allow `0.0.0.0/0`.

**Vercel** (alternative): `vercel.json` + `api/handler.ts` run the Express app as a serverless function (`api/index.js`, rebuilt by `npm run build`). Serverless caveats: read-only filesystem (uploads don't persist) and in-memory admin tokens reset on cold starts.
