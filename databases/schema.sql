-- ============================================================================
-- Cooperative Gig Services Platform - Schema
-- PostGIS enabled schema for workers, service requests, and transactions
-- ============================================================================

create extension if not exists postgis;

-- Role enum
do $$ begin
  create type user_role as enum ('admin', 'worker', 'customer');
exception
  when duplicate_object then null;
end $$;

-- Job status enum
do $$ begin
  create type job_status as enum ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- 1. Users Table (extends auth.users)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null,
  username text unique not null,
  phone text,
  address text,
  created_at timestamptz default now()
);

-- 2. Worker Profiles
create table if not exists worker_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  skill_type text not null,
  experience_years numeric default 0,
  certification_url text,
  verification_status text default 'pending', -- 'pending', 'verified', 'rejected'
  rating_avg numeric default 0,
  is_available boolean default true
);

-- 3. Worker Locations (PostGIS geography point)
create table if not exists worker_locations (
  worker_id uuid primary key references worker_profiles(user_id) on delete cascade,
  location geography(Point, 4326) not null,
  service_radius_km numeric default 5,
  updated_at timestamptz default now()
);
create index if not exists worker_locations_geo_idx on worker_locations using gist (location);

-- 4. Service Requests
create table if not exists service_requests (
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
create index if not exists service_requests_geo_idx on service_requests using gist (location);

-- 5. Earnings
create table if not exists earnings (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references worker_profiles(user_id),
  job_id uuid references service_requests(id),
  amount numeric not null,
  earned_at timestamptz default now()
);

-- 6. Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id),
  job_id uuid references service_requests(id),
  amount numeric not null,
  gateway_ref text,
  idempotency_key text unique,              -- prevents double-processing webhooks/retries
  status text default 'created',
  created_at timestamptz default now()
);

-- 7. Ratings and Feedback
create table if not exists ratings_feedback (
  job_id uuid primary key references service_requests(id),
  customer_id uuid references users(id),
  worker_id uuid references worker_profiles(user_id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- 8. Cost Parameters
create table if not exists cost_parameters (
  key text primary key,
  value numeric not null,
  updated_by uuid references users(id),
  updated_at timestamptz default now()
);

-- Default Cost Parameters
insert into cost_parameters (key, value) values
  ('base_fare', 100),
  ('per_km_rate', 12),
  ('experience_multiplier', 5),
  ('urgency_multiplier', 1.5),
  ('service_type_default_multiplier', 1.0)
on conflict (key) do update set value = excluded.value;

-- 9. Enterprise Audit Log Table
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,               -- e.g. 'cost_parameters.update', 'worker.verify'
  target_table text,
  target_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);

