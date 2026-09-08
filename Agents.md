# Cooperative Gig Services Platform — Frozen Architecture v2.0 (Enterprise)

**Problem Statement ID:** 26089 — Cooperative Gig Services Platform for Household & Community Services
**Stack:** Next.js (frontend + backend, Node.js runtime) on **Vercel only** · **Supabase** (Postgres + PostGIS + Auth + Realtime + Storage) · Capacitor JS for mobile · 100% free-tier services.

This revision treats the app as a real product, not a hackathon demo: layered backend, RBAC enforced at three levels, rate limiting, observability, CI/CD, environment separation, and a testing strategy — all still buildable on free tiers.

---

## 0. Decisions Locked In This Revision

| Item | Decision |
|---|---|
| Backend | **No separate Node.js server.** All backend logic lives in Next.js Route Handlers (`app/api/**`), which run on the Node.js runtime on Vercel. One deployable, one repo, one hosting bill (free). |
| Aspect ratio | 9:16 portrait shell (unchanged from v1 — see prior note if you actually want landscape). |
| Environments | `dev` → `staging` → `production`, each with its **own Supabase project** (free tier allows 2 free projects; a 3rd requires either pausing one or upgrading — noted in §5). |
| Architecture style | Layered: **Route Handler → Service → Repository → Supabase**, with Zod validation and RLS as defense-in-depth, not the only guard. |

---

## 1. Tech Stack

```
Framework:            Next.js 14 (App Router), TypeScript, Node.js runtime for API routes
Styling:               Tailwind CSS
Mobile wrapper:        Capacitor JS (Android + iOS)
State (client):        Zustand
Forms/validation:      react-hook-form + zod (same zod schemas reused server-side)
Maps:                  Leaflet + react-leaflet + OpenStreetMap tiles
Database:              PostgreSQL + PostGIS — Supabase
Auth:                  Supabase Auth (email/password) + custom JWT claims for role
Realtime:              Supabase Realtime
Storage:               Supabase Storage (certifications, profile photos)
Payments:              Razorpay (Test Mode) with webhook signature verification
Rate limiting/cache:   Upstash Redis (free tier) via @upstash/ratelimit, used from Edge Middleware
Error tracking:        Sentry (free tier, Next.js SDK)
Analytics/logs:        Vercel Analytics + Vercel Log Drains (free tier limits apply)
CI/CD:                 GitHub Actions (free minutes on public/small repos) → Vercel deploys
Testing:               Vitest (unit/integration), Playwright (e2e)
Hosting:               Vercel (Hobby tier) — frontend + API, nothing else to host
```

---

## 2. Architecture Principles

1. **Single deployable.** Frontend and backend are the same Next.js app. This removes an entire class of enterprise problems (CORS, two deploy pipelines, two sets of env vars) while still giving you real backend layering.
2. **Layered backend, not "fat route handlers."** Every API route is a thin adapter:
   `Route Handler (HTTP concerns only) → Service (business logic) → Repository (data access)`.
   This is what makes it "enterprise" — logic is testable without spinning up HTTP, and swapping Supabase for something else later only touches the repository layer.
3. **Defense in depth on authorization.** Three independent checks, not one:
   - Edge Middleware blocks role-mismatched routes before render.
   - Service layer re-checks the caller's role before executing business logic (never trust the client got redirected).
   - Postgres Row Level Security is the last line — even a leaked service key misuse or a bug in the above two layers can't leak another user's row.
4. **Everything validated at the boundary.** Zod schemas live in `lib/validation/` and are imported both by the client form and the API route handling that form — one schema, two enforcement points, zero drift.
5. **Idempotent writes where money is involved.** Payment order creation and webhook handling use idempotency keys so retries (network blips, Razorpay webhook redelivery) can't double-charge or double-credit earnings.

---

## 3. High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                     Capacitor Native Shell (Android/iOS)            │
│         WebView loads the production Vercel URL; native            │
│         plugins: Geolocation, Camera                                │
└──────────────────────────────┬──────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼──────────────────────────────────────┐
│                      Next.js on Vercel (single app)                   │
│                                                                         │
│  Edge Middleware ──► auth check, role routing guard, rate limit check  │
│         │                                                               │
│  ┌──────▼───────────────┐   ┌───────────────────────────────────────┐ │
│  │  app/(routes)         │   │  app/api/v1/**  (Route Handlers)      │ │
│  │  role-scoped UI       │   │       │                                │ │
│  │  (admin/worker/       │   │       ▼                                │ │
│  │   customer)           │   │  lib/services/*  (business logic,     │ │
│  └───────────────────────┘   │  re-checks role, calls repositories)  │ │
│                                │       │                                │ │
│                                │       ▼                                │ │
│                                │  lib/repositories/* (only layer that  │ │
│                                │  talks to Supabase client)            │ │
│                                └───────────────┬───────────────────────┘ │
└────────────────────────────────────────────────┼─────────────────────────┘
                                                   │
                    ┌──────────────────────────────┼───────────────────────┐
                    │                              │                       │
           ┌────────▼────────┐         ┌───────────▼──────────┐  ┌─────────▼────────┐
           │    Supabase      │         │   Upstash Redis       │  │    Razorpay      │
           │  Postgres+PostGIS│         │  (rate limit, cache    │  │   Test Mode      │
           │  Auth / Realtime │         │   for nearby-count)    │  │  Checkout+Webhook│
           │  Storage / RLS   │         └────────────────────────┘  └──────────────────┘
           └──────────────────┘
                    │
           ┌────────▼────────┐
           │     Sentry       │  (errors from both client & server, same app)
           └──────────────────┘
```

---

## 4. Repository Structure

```
cooperative-gig-platform/
│
├── local-services-marketplace/               # The one deployable Next.js app
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/signup/page.tsx
│   │   ├── admin/{dashboard,workers}/page.tsx + layout.tsx (role guard)
│   │   ├── worker/{dashboard,location,earnings,profile}/page.tsx + layout.tsx
│   │   ├── customer/{request,payments,profile}/page.tsx + layout.tsx
│   │   │
│   │   └── api/v1/                            # versioned API surface
│   │       ├── auth/signup/route.ts
│   │       ├── jobs/route.ts                  # POST create, GET list
│   │       ├── jobs/[id]/assign/route.ts
│   │       ├── jobs/[id]/status/route.ts
│   │       ├── workers/location/route.ts
│   │       ├── workers/[id]/verify/route.ts
│   │       ├── earnings/route.ts
│   │       ├── payments/create-order/route.ts
│   │       ├── payments/webhook/route.ts
│   │       ├── admin/cost-parameters/route.ts
│   │       └── person-4/nearby-count/route.ts
│   │
│   ├── lib/
│   │   ├── services/                          # business logic, one file per domain
│   │   │   ├── jobService.ts
│   │   │   ├── workerService.ts
│   │   │   ├── paymentService.ts
│   │   │   ├── costEngineService.ts
│   │   │   └── nearbyWorkersService.ts         # person-4 logic lives here
│   │   ├── repositories/                       # ONLY place that imports the Supabase client
│   │   │   ├── jobRepository.ts
│   │   │   ├── workerRepository.ts
│   │   │   ├── paymentRepository.ts
│   │   │   └── costParameterRepository.ts
│   │   ├── validation/                         # zod schemas, shared client+server
│   │   │   ├── jobSchema.ts
│   │   │   ├── signupSchema.ts
│   │   │   └── costParameterSchema.ts
│   │   ├── supabase/
│   │   │   ├── client.ts                       # browser client (anon key)
│   │   │   └── server.ts                       # server client (service role, server-only)
│   │   ├── auth/rbac.ts                        # role-check helper used by every service fn
│   │   ├── http/
│   │   │   ├── apiResponse.ts                  # standard { data } / { error } envelope
│   │   │   └── errors.ts                       # AppError classes → HTTP status mapping
│   │   ├── rateLimit.ts                        # Upstash-backed limiter
│   │   └── logger.ts                           # structured logging wrapper (pino-style)
│   │
│   ├── middleware.ts                           # Edge: auth + role guard + rate limit
│   ├── components/
│   │   ├── shell/AspectShell.tsx
│   │   ├── nav/WorkerBottomNav.tsx / CustomerBottomNav.tsx
│   │   ├── map/LocationPicker.tsx
│   │   └── ui/...
│   │
│   ├── tests/
│   │   ├── unit/                               # Vitest — services & repositories mocked
│   │   ├── integration/                        # Vitest — hits a test Supabase project
│   │   └── e2e/                                # Playwright — full user flows
│   │
│   ├── capacitor.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── databases/
│   ├── schema.sql
│   ├── migrations/                             # Supabase CLI migration files, timestamped
│   ├── seed.sql
│   ├── policies.sql                            # RLS policies
│   └── audit.sql                                # audit_log table + trigger
│
├── .github/workflows/
│   ├── ci.yml                                  # lint, typecheck, unit+integration tests
│   └── e2e.yml                                 # playwright against a preview deploy
│
└── docs/
    └── architecture.md                         # this file
```

---

## 5. Environment Strategy

| Env | Supabase project | Vercel env | Purpose |
|---|---|---|---|
| `dev` | Local Supabase (via `supabase start`, Docker) or a free cloud project | local `.env.local` | Day-to-day development |
| `staging` | Free Supabase project #1 | Vercel Preview deployments | QA, demo, PR review |
| `production` | Free Supabase project #2 | Vercel Production deployment | Real users |

Supabase's free tier gives **2 active cloud projects**; running `dev` locally via the Supabase CLI (Docker-based, free, no cloud slot used) keeps you within that limit while still having isolated staging + production. Vercel Preview deployments (automatic per-PR) point at the `staging` Supabase project via preview-scoped environment variables; Production deployment points at the `production` project.

Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`) are stored only in Vercel's encrypted environment variable store per-environment — never committed, never in `NEXT_PUBLIC_*` vars.

---

## 6. Database Schema (`databases/schema.sql`)

```sql
create extension if not exists postgis;

create type user_role as enum ('admin', 'worker', 'customer');
create type job_status as enum ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  username text unique not null,
  phone text,
  address text,
  created_at timestamptz default now()
);

create table worker_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  skill_type text not null,
  experience_years numeric default 0,
  certification_url text,
  verification_status text default 'pending',
  rating_avg numeric default 0,
  is_available boolean default true
);

create table worker_locations (
  worker_id uuid primary key references worker_profiles(user_id) on delete cascade,
  location geography(Point, 4326) not null,
  service_radius_km numeric default 5,
  updated_at timestamptz default now()
);
create index worker_locations_geo_idx on worker_locations using gist (location);

create table service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id),
  worker_id uuid references worker_profiles(user_id),
  service_type text not null,
  worker_type_requested text,
  description text,
  location geography(Point, 4326) not null,
  status job_status default 'pending',
  briefing text,
  quoted_amount numeric,
  created_at timestamptz default now(),
  scheduled_at timestamptz
);
create index service_requests_geo_idx on service_requests using gist (location);

create table earnings (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references worker_profiles(user_id),
  job_id uuid references service_requests(id),
  amount numeric not null,
  earned_at timestamptz default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id),
  job_id uuid references service_requests(id),
  amount numeric not null,
  gateway_ref text,
  idempotency_key text unique,              -- prevents double-processing webhooks/retries
  status text default 'created',
  created_at timestamptz default now()
);

create table ratings_feedback (
  job_id uuid primary key references service_requests(id),
  customer_id uuid references users(id),
  worker_id uuid references worker_profiles(user_id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table cost_parameters (
  key text primary key,
  value numeric not null,
  updated_by uuid references users(id),
  updated_at timestamptz default now()
);

insert into cost_parameters (key, value) values
  ('base_fare', 100),
  ('per_km_rate', 12),
  ('experience_multiplier', 5),
  ('urgency_multiplier', 1.5),
  ('service_type_default_multiplier', 1.0);

-- enterprise addition: audit trail for sensitive admin actions
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,               -- e.g. 'cost_parameters.update', 'worker.verify'
  target_table text,
  target_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);
```

`databases/policies.sql` — RLS is the last line of defense (see §2.3):

- `users`: a row is readable/writable only by its owner (`auth.uid() = id`), except `admin` role which can read all.
- `worker_locations`, `earnings`: writable only by the owning worker; readable by the owning worker and `admin`.
- `service_requests`: readable/writable by the owning `customer_id` or the assigned `worker_id`; full access for `admin`.
- `cost_parameters`, `audit_log`: writable only by `admin` (checked against a `role` custom claim synced onto the JWT via a Supabase Auth Hook on signup/role-change).

---

## 7. Auth & RBAC — Three Enforcement Layers

**Layer 1 — Edge Middleware (`middleware.ts`)**
Runs before any route renders. Reads the Supabase session, extracts `role`, and 307-redirects away from `/admin/*`, `/worker/*`, `/customer/*` if the role doesn't match. Also applies the Upstash rate limiter here (see §9) so abusive traffic never reaches a route handler.

**Layer 2 — Service layer (`lib/auth/rbac.ts`)**
Every function in `lib/services/*` takes the caller's session/role as an explicit argument and calls `assertRole(session, 'admin')` (or similar) before doing anything. This means even a route handler that forgets a check, or a future internal caller (a Cron job, a test), still can't perform an unauthorized action — the check lives with the logic, not with the HTTP layer.

**Layer 3 — Postgres RLS**
Described in §6. Even if layers 1 and 2 both had a bug, or the service-role key were used carelessly somewhere, RLS still stops one customer from reading another customer's `service_requests`.

**Signup flow:** `/signup` creates a Supabase Auth user, then the API route calls `userService.createUser()` which inserts into `users` with `role ∈ {worker, customer}` only. `admin` accounts are never self-service — seeded directly via `databases/seed.sql` or created by an existing admin through a protected internal tool.

---

## 8. API Design Standards

- **Versioned:** all routes under `/api/v1/**`. Bumping to `/api/v2/**` later doesn't break the mobile shell mid-rollout (important once a Capacitor build is out in app stores and you can't force an instant update).
- **Standard response envelope** (`lib/http/apiResponse.ts`):
  ```ts
  // success
  { data: T }
  // failure
  { error: { code: string; message: string } }
  ```
- **Typed errors** (`lib/http/errors.ts`): `ValidationError`, `UnauthorizedError`, `NotFoundError`, `ConflictError` — each maps to a fixed HTTP status, thrown from the service layer, caught once at the route-handler boundary. No route handler hand-writes `NextResponse.json({...}, {status: ...})` for errors individually.
- **Idempotency:** `POST /api/v1/payments/create-order` and the webhook handler require/generate an `idempotency_key`, checked against `transactions.idempotency_key` before writing.

---

## 9. Security Hardening

- **Rate limiting:** Upstash Redis + `@upstash/ratelimit`, applied in `middleware.ts` — e.g. 20 req/min per IP on `/api/v1/auth/*`, higher limits elsewhere. Free tier of Upstash covers this comfortably at MVP scale.
- **Secure headers:** `next.config.js` sets `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security` via the `headers()` config — cheap, no extra service needed.
- **Webhook verification:** Razorpay webhook signature checked server-side before trusting any payload (`lib/services/paymentService.ts`).
- **Secrets never in client bundle:** anything without the `NEXT_PUBLIC_` prefix stays server-only by Next.js convention; the Supabase **service role key** is imported only inside `lib/supabase/server.ts`, which is never imported from a `"use client"` file — enforce this with an ESLint boundary rule (`eslint-plugin-boundaries` or a simple custom rule) so it can't regress silently.
- **Audit logging:** admin actions that change money-relevant config (`cost_parameters`) or worker verification status write a row to `audit_log` with before/after state.

---

## 10. Observability

- **Errors:** Sentry free tier, `@sentry/nextjs` — captures both client and server (API route) exceptions in the same project, with source maps for readable stack traces.
- **Structured logging:** `lib/logger.ts` wraps `console.log` in a consistent JSON shape (`{level, msg, requestId, userId, ...}`); Vercel's built-in log viewer (free tier, short retention) is enough at this stage — no separate log aggregator needed.
- **Request IDs:** middleware attaches a `x-request-id` header, threaded through service calls and into log lines, so a single request can be traced across the layered call stack.
- **Uptime:** a free tier from something like UptimeRobot or Better Stack (both have no-cost plans) pinging the production health-check route (`/api/v1/health`) is enough monitoring for this stage without adding cost.

---

## 11. CI/CD Pipeline

`.github/workflows/ci.yml` (runs on every PR):
1. `pnpm install`
2. `pnpm lint` + `pnpm typecheck`
3. `pnpm test:unit` (Vitest, services/repositories mocked — fast, no network)
4. `pnpm test:integration` (Vitest against the `staging` Supabase project, using a seeded test schema)
5. Vercel auto-builds a **Preview Deployment** for the PR

`.github/workflows/e2e.yml` (runs on the Preview Deployment URL once it's live):
6. Playwright runs the core flows: signup → login → worker sets location → customer requests service → quote calculated → payment (test mode) → earnings reflect the payout.

Merge to `main` → Vercel promotes to **Production**, pointed at the `production` Supabase project via environment-scoped variables.

---

## 12. Testing Strategy

| Layer | Tool | What it covers |
|---|---|---|
| Unit | Vitest | `lib/services/*` logic with repositories mocked — cost engine math, RBAC checks, validation edge cases |
| Integration | Vitest + real Supabase (staging) | Repository layer against actual Postgres/PostGIS — geo queries, RLS policies actually deny what they should |
| E2E | Playwright | Full user journeys across all three roles, run against a live Preview Deployment |

---

## 13. Role-Specific Screens

*(Unchanged in substance from v1 — restated here for completeness of this single frozen document.)*

**Worker (4-tab bottom nav):** Dashboard (assigned job + briefing) · Work Location (Leaflet pin + radius slider → `worker_locations`) · Earnings (from `earnings` joined to `service_requests`) · Profile (personal info/username).

**Customer (3-tab bottom nav):** Request Work (service-type dropdown, issue textbox, worker-type select → live quote via cost engine) · Payments (Razorpay checkout + past `transactions`, or "No transactions yet.") · Profile (address + personal info).

**Admin:** Cost-parameter editor (writes `cost_parameters`, audit-logged) · Worker verification queue · Basic stats.

---

## 14. Geo-Matching Engine (`lib/services/jobService.ts` → `lib/repositories/workerRepository.ts`)

```sql
select wp.user_id, wl.location <-> sr.location as distance_m
from worker_profiles wp
join worker_locations wl on wl.worker_id = wp.user_id
cross join (select geography(point(:lng, :lat)) as location) sr
where wp.skill_type = :service_type
  and wp.verification_status = 'verified'
  and wp.is_available = true
  and ST_DWithin(wl.location, sr.location, wl.service_radius_km * 1000)
order by distance_m asc
limit 10;
```

The service layer calls this repository function, applies business rules (e.g. don't assign a worker already at capacity), then either auto-assigns the nearest match or returns a shortlist — kept a config toggle so the behavior is a product decision, not a code change.

---

## 15. `person-4` — Nearby-Workers-Count Module

- `lib/services/nearbyWorkersService.ts` — same `ST_DWithin` pattern, `count(*)` grouped by `skill_type`.
- `app/api/v1/person-4/nearby-count/route.ts` — thin handler, delegates to the service, cached briefly in Upstash Redis (e.g. 15s TTL keyed by rounded lat/lng) so rapid client polling doesn't hammer Postgres.
- Client hook subscribes to Supabase Realtime on `worker_locations` for live updates between cache refreshes.
- Surfaced as a trust badge on the customer's Request Work screen.

---

## 16. Cost Calculation Engine (`lib/services/costEngineService.ts`)

```
quote = base_fare
      + (distance_km * per_km_rate)
      + (worker.experience_years * experience_multiplier)
      * (is_urgent ? urgency_multiplier : 1)
      * service_type_multiplier[service_type]
```

Reads live from `cost_parameters` via `costParameterRepository.ts` — admin edits take effect on the very next quote, no redeploy. Every parameter change is written to `audit_log` with the actor, old value, and new value.

---

## 17. Payments (Razorpay Test Mode)

- `POST /api/v1/payments/create-order` — service layer generates an idempotency key, creates a Razorpay order for `quoted_amount`, returns `order_id`.
- Client opens Razorpay Checkout (test card `4111 1111 1111 1111`).
- `POST /api/v1/payments/webhook` — verifies the Razorpay signature, checks `idempotency_key` hasn't been processed already, writes `transactions.status = 'paid'`, inserts the matching `earnings` row for the worker in the same DB transaction (both writes succeed or both roll back).
- Swapping to live Razorpay keys post-KYC is a config change only — no architecture change.

---

## 18. Color Scheme (Tailwind tokens) — unchanged

| Token | Hex | Use |
|---|---|---|
| `primary` (Cooperative Teal) | `#0F766E` | Worker-app accent, primary CTAs |
| `secondary` (Labour Amber) | `#F59E0B` | Customer-app accent |
| `admin` (Indigo) | `#4338CA` | Admin-only screens |
| `success` | `#16A34A` | Verified/paid/completed states |
| `danger` | `#DC2626` | Rejections/errors |
| `bg` / `bg-dark` | `#F8FAFC` / `#0F172A` | Light/dark backgrounds |
| `text` / `text-muted` | `#1E293B` / `#64748B` | Text hierarchy |

---

## 19. Mobile Packaging (Capacitor) — unchanged

```ts
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'coop.gigplatform.app',
  appName: 'Cooperative Gig Services',
  webDir: 'public',
  server: {
    url: 'https://your-app.vercel.app',   // production URL; a separate staging build points at the preview URL
    cleartext: false
  }
};
```

Native plugins: `@capacitor/geolocation`, `@capacitor/camera`. Build via `npx cap sync && npx cap open android/ios`, or automate in a GitHub Actions job (separate from `ci.yml`) that only runs on release tags.

---

## 20. Aspect-Locked Shell — unchanged

```tsx
export function AspectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="relative w-full max-w-[430px] aspect-[9/16] overflow-y-auto bg-bg shadow-xl">
        {children}
      </div>
    </div>
  );
}
```

---

## 21. Build Prompt (feed this to a coding agent to scaffold the project)

```
Build an enterprise-structured Next.js 14 (App Router) + TypeScript + Tailwind
CSS application called "Cooperative Gig Services Platform" inside
`local-services-marketplace/`, with a `databases/` folder for SQL and a
`person-4` service module for a nearby-workers-count feature. Single
deployable, hosted on Vercel only — no separate backend server. Database:
Supabase Postgres + PostGIS. Auth: Supabase Auth with role stored in a
`users` table and synced as a JWT custom claim. Payments: Razorpay Test Mode.
Maps: Leaflet + OpenStreetMap. Mobile: Capacitor JS pointing at the deployed
Vercel URL. Rate limiting/caching: Upstash Redis. Error tracking: Sentry.

Architecture requirements:
1. Layer the backend as Route Handler → Service → Repository. Route handlers
   under app/api/v1/** only parse/validate input (zod) and call a service
   function; services contain business logic and re-check the caller's role
   before acting; repositories are the ONLY files that import the Supabase
   client and talk to the database.
2. Enforce RBAC three ways: Edge Middleware blocking role-mismatched routes,
   an explicit assertRole() check inside every service function, and Postgres
   Row Level Security policies as the final backstop.
3. Standard API response envelope ({ data } / { error: { code, message } })
   and typed error classes (ValidationError, UnauthorizedError, NotFoundError,
   ConflictError) mapped to HTTP statuses in one place.
4. Idempotency keys on payment order creation and webhook handling; the
   webhook writes the transaction row and the worker's earnings row in a
   single DB transaction.
5. Audit log table capturing admin actions that change cost_parameters or
   worker verification status, with actor, before/after values.
6. All screens inside a 9:16 aspect-locked shell component.
7. Signup flow creates a Supabase Auth user + a `users` row with role
   restricted to worker/customer (admin is seeded directly, never
   self-service).
8. Worker app (4-tab bottom nav): Dashboard (assigned job + briefing), Work
   Location (Leaflet pin + radius slider saving to a PostGIS geography
   point), Earnings (from the earnings table), Profile.
9. Customer app (3-tab bottom nav): Request Work (service dropdown, issue
   textbox, worker-type select, live quote from the cost engine), Payments
   (Razorpay checkout + past transactions, or "No transactions yet." if
   empty), Profile (address + personal info).
10. Admin dashboard: cost-parameter editor (audit-logged), worker
    verification queue.
11. Geo-matching: nearest verified, available, in-radius workers via
    PostGIS ST_DWithin, ordered by distance.
12. person-4 module: nearby-available-workers count by lat/lng/radius,
    cached briefly in Upstash Redis, live-updated via Supabase Realtime
    subscriptions on worker_locations.
13. Color tokens: primary #0F766E (teal, worker accent), secondary #F59E0B
    (amber, customer accent), admin accent #4338CA (indigo), success
    #16A34A, danger #DC2626, backgrounds #F8FAFC / #0F172A.
14. Set up GitHub Actions CI (lint, typecheck, unit tests via Vitest,
    integration tests against a staging Supabase project) and a Playwright
    e2e workflow against Vercel Preview Deployments.
15. Secure headers via next.config.js, Upstash-backed rate limiting in
    middleware, Sentry error tracking wired into both client and server.

Scaffold the full file tree, databases/schema.sql + policies.sql + audit.sql,
every layer described above, the CI workflow files, and the Capacitor config,
following the architecture exactly.
```

---

## 22. Deferred Past This Freeze

AI-based demand forecasting, multilingual UI, and insurance/welfare integration remain compatible future additions (a Vercel Cron job for forecasting, `next-intl` for language, an extra table + admin flow for insurance) but are intentionally out of this v2 freeze. Say the word if any of these should be locked in before you actually start building.
