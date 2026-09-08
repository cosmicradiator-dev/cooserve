# Cooperative Gig Services Platform — Frozen Architecture v2.0 (Enterprise)

**Problem Statement ID:** 26089 — Cooperative Gig Services Platform for Household & Community Services
**Stack:** Next.js 14 (App Router) on **Vercel** · **Supabase** (Postgres + PostGIS + Auth + Realtime + Storage) · Capacitor JS for mobile · Upstash Redis for rate limiting & nearby caching · Sentry for observability.

## Layered Backend Architecture
- **Route Handler (`app/api/v1/**`)**: Thin HTTP adapter. Parses/validates Zod input, invokes service function, handles standard response formatting.
- **Service Layer (`lib/services/**`)**: Encapsulates business logic, asserts role permissions (`assertRole`), performs calculations, coordinates repositories.
- **Repository Layer (`lib/repositories/**`)**: The ONLY layer that imports the Supabase client and directly interacts with the database.

## 3-Tier RBAC
1. **Edge Middleware (`middleware.ts`)**: Fast 307 redirects away from unauthorized role areas (`/admin/*`, `/worker/*`, `/customer/*`).
2. **Service Layer (`lib/auth/rbac.ts`)**: Explicit `assertRole(session, roles)` check before executing business logic.
3. **Database RLS (`databases/policies.sql`)**: Postgres Row Level Security enforcing isolation at the DB engine level.

## Payments & Financial Integrity
- Idempotency keys required on order generation (`transactions.idempotency_key`).
- Webhook signature verification for Razorpay.
- Atomic settlement of transaction status and worker earnings.

## person-4 Nearby Workers Count
- `lib/services/nearbyWorkersService.ts` utilizing PostGIS `ST_DWithin`.
- Cached for 15s in Upstash Redis by geo-bucket.
- Supabase Realtime subscription on `worker_locations` for instant UI badge updates.

