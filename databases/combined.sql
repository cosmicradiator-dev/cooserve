-- ============================================================================
-- COOPERATIVE GIG SERVICES PLATFORM - ALL-IN-ONE DATABASE SETUP SCRIPT
-- ============================================================================
-- This single script provisions the complete Supabase PostgreSQL database:
-- 1. Cleans up any stale triggers
-- 2. PostGIS Extension & Custom Enums
-- 3. Core Tables, Spatial Indexes, & Audit Logging Table
-- 4. Fixed Universal Audit Trigger Functions (JSONB-safe)
-- 5. Row Level Security (RLS) & Security Definer Helpers
-- 6. All Layer 3 RLS Security Policies
-- 7. Mock Auth Users & Seed Data (Admin, Workers, Customer, Jobs, Ledgers)
-- 8. Audit Triggers Activation
--
-- Safe to re-run multiple times (100% Idempotent).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: TEARDOWN STALE TRIGGERS (Prevents field error during setup)
-- ----------------------------------------------------------------------------
drop trigger if exists trg_audit_cost_parameters on cost_parameters;
drop trigger if exists trg_audit_worker_verification on worker_profiles;

-- ----------------------------------------------------------------------------
-- STEP 2: EXTENSIONS & ENUMS
-- ----------------------------------------------------------------------------
create extension if not exists postgis;
create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('admin', 'worker', 'customer');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type job_status as enum ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- STEP 3: TABLES DEFINITIONS
-- ----------------------------------------------------------------------------

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

-- 3. Worker Locations (PostGIS Geography Point)
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

-- 5. Earnings Ledger
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
  idempotency_key text unique,
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

-- 9. Enterprise Audit Log Table
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id),
  action text not null,
  target_table text,
  target_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- STEP 4: UNIVERSAL AUDIT TRIGGER FUNCTIONS (Bug-free JSONB extraction)
-- ----------------------------------------------------------------------------
create or replace function audit_trigger_func()
returns trigger as $$
declare
  actor_user_id uuid;
begin
  begin
    actor_user_id := auth.uid();
  exception
    when others then
      actor_user_id := null;
  end;

  if (tg_op = 'UPDATE') then
    insert into audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      before,
      after
    ) values (
      actor_user_id,
      tg_table_name || '.update',
      tg_table_name,
      coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key', to_jsonb(new) ->> 'user_id', 'unknown'),
      to_jsonb(old),
      to_jsonb(new)
    );
    return new;
  elsif (tg_op = 'DELETE') then
    insert into audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      before,
      after
    ) values (
      actor_user_id,
      tg_table_name || '.delete',
      tg_table_name,
      coalesce(to_jsonb(old) ->> 'id', to_jsonb(old) ->> 'key', to_jsonb(old) ->> 'user_id', 'unknown'),
      to_jsonb(old),
      null
    );
    return old;
  elsif (tg_op = 'INSERT') then
    insert into audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      before,
      after
    ) values (
      actor_user_id,
      tg_table_name || '.insert',
      tg_table_name,
      coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key', to_jsonb(new) ->> 'user_id', 'unknown'),
      null,
      to_jsonb(new)
    );
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create or replace function audit_worker_verification_func()
returns trigger as $$
declare
  actor_user_id uuid;
begin
  if (old.verification_status is distinct from new.verification_status) then
    begin
      actor_user_id := auth.uid();
    exception
      when others then
        actor_user_id := null;
    end;

    insert into audit_log (
      actor_id,
      action,
      target_table,
      target_id,
      before,
      after
    ) values (
      actor_user_id,
      'worker.verify',
      'worker_profiles',
      coalesce(to_jsonb(new) ->> 'user_id', to_jsonb(new) ->> 'id', 'unknown'),
      jsonb_build_object('verification_status', old.verification_status),
      jsonb_build_object('verification_status', new.verification_status)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- STEP 5: ROW LEVEL SECURITY (RLS) & POLICIES
-- ----------------------------------------------------------------------------
alter table users enable row level security;
alter table worker_profiles enable row level security;
alter table worker_locations enable row level security;
alter table service_requests enable row level security;
alter table earnings enable row level security;
alter table transactions enable row level security;
alter table ratings_feedback enable row level security;
alter table cost_parameters enable row level security;
alter table audit_log enable row level security;

-- Helper function: check if authenticated user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return (
    coalesce(auth.jwt() ->> 'role', '') = 'admin'
    or exists (
      select 1 from users
      where id = auth.uid() and role = 'admin'
    )
  );
end;
$$ language plpgsql security definer;

-- 1. Users Policies
drop policy if exists "Users can read own profile or admin can read all" on users;
create policy "Users can read own profile or admin can read all"
  on users for select
  using (auth.uid() = id or is_admin());

drop policy if exists "Users can update own profile" on users;
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id or is_admin())
  with check (auth.uid() = id or is_admin());

drop policy if exists "Users can insert own profile" on users;
create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid() = id or is_admin());

-- 2. Worker Profiles Policies
drop policy if exists "Anyone can read verified worker profiles" on worker_profiles;
create policy "Anyone can read verified worker profiles"
  on worker_profiles for select
  using (verification_status = 'verified' or auth.uid() = user_id or is_admin());

drop policy if exists "Workers can update own profile (except verification)" on worker_profiles;
create policy "Workers can update own profile (except verification)"
  on worker_profiles for update
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

drop policy if exists "Workers can insert own profile" on worker_profiles;
create policy "Workers can insert own profile"
  on worker_profiles for insert
  with check (auth.uid() = user_id or is_admin());

-- 3. Worker Locations Policies
drop policy if exists "Anyone can read worker locations for discovery" on worker_locations;
create policy "Anyone can read worker locations for discovery"
  on worker_locations for select
  using (true);

drop policy if exists "Workers can update own location" on worker_locations;
create policy "Workers can update own location"
  on worker_locations for all
  using (auth.uid() = worker_id or is_admin())
  with check (auth.uid() = worker_id or is_admin());

-- 4. Service Requests Policies
drop policy if exists "Customers and assigned workers can view service requests" on service_requests;
create policy "Customers and assigned workers can view service requests"
  on service_requests for select
  using (
    auth.uid() = customer_id
    or auth.uid() = worker_id
    or is_admin()
    or (status = 'pending' and exists (
      select 1 from worker_profiles where user_id = auth.uid() and verification_status = 'verified'
    ))
  );

drop policy if exists "Customers can create service requests" on service_requests;
create policy "Customers can create service requests"
  on service_requests for insert
  with check (auth.uid() = customer_id or is_admin());

drop policy if exists "Parties can update service requests" on service_requests;
create policy "Parties can update service requests"
  on service_requests for update
  using (auth.uid() = customer_id or auth.uid() = worker_id or is_admin())
  with check (auth.uid() = customer_id or auth.uid() = worker_id or is_admin());

-- 5. Earnings Policies
drop policy if exists "Workers can read own earnings" on earnings;
create policy "Workers can read own earnings"
  on earnings for select
  using (auth.uid() = worker_id or is_admin());

drop policy if exists "Service role / Admin can insert earnings" on earnings;
create policy "Service role / Admin can insert earnings"
  on earnings for insert
  with check (is_admin());

-- 6. Transactions Policies
drop policy if exists "Customers can read own transactions" on transactions;
create policy "Customers can read own transactions"
  on transactions for select
  using (auth.uid() = customer_id or is_admin());

drop policy if exists "Service role / Admin can insert transactions" on transactions;
create policy "Service role / Admin can insert transactions"
  on transactions for insert
  with check (auth.uid() = customer_id or is_admin());

-- 7. Cost Parameters Policies
drop policy if exists "Anyone can read cost parameters" on cost_parameters;
create policy "Anyone can read cost parameters"
  on cost_parameters for select
  using (true);

drop policy if exists "Only admin can modify cost parameters" on cost_parameters;
create policy "Only admin can modify cost parameters"
  on cost_parameters for all
  using (is_admin())
  with check (is_admin());

-- 8. Audit Log Policies
drop policy if exists "Only admin can view audit logs" on audit_log;
create policy "Only admin can view audit logs"
  on audit_log for select
  using (is_admin());

drop policy if exists "System and admin can insert audit logs" on audit_log;
create policy "System and admin can insert audit logs"
  on audit_log for insert
  with check (true);

-- ----------------------------------------------------------------------------
-- STEP 6: SEED DATA (Creates test accounts & initial configuration)
-- ----------------------------------------------------------------------------

-- 1. Seed Cost Parameters
insert into cost_parameters (key, value) values
  ('base_fare', 100),
  ('per_km_rate', 12),
  ('experience_multiplier', 5),
  ('urgency_multiplier', 1.5),
  ('service_type_default_multiplier', 1.0)
on conflict (key) do update set value = excluded.value;

-- 2. Seed Mock Auth Users into auth.users with bcrypt passwords (Password123!)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data
    ) values
      ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@coop.org', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"role":"admin","full_name":"Platform Super Admin"}'),
      ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ramesh@coop.org', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"role":"worker","full_name":"Ramesh Sharma"}'),
      ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sunita@coop.org', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"role":"worker","full_name":"Sunita Devi"}'),
      ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amit@coop.org', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"role":"worker","full_name":"Amit Patel"}'),
      ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya@mail.com', crypt('Password123!', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"role":"customer","full_name":"Priya Verma"}')
    on conflict (id) do update set
      encrypted_password = crypt('Password123!', gen_salt('bf')),
      email_confirmed_at = now();
  end if;
end $$;

-- 3. Seed Public Users
insert into users (id, role, full_name, username, phone, address) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Platform Super Admin', 'admin', '+18005550100', '100 Coop Plaza, Metro City'),
  ('00000000-0000-0000-0000-000000000002', 'worker', 'Ramesh Sharma (Electrician)', 'ramesh_elec', '+919876543210', 'Sector 14, Delhi'),
  ('00000000-0000-0000-0000-000000000003', 'worker', 'Sunita Devi (Plumber)', 'sunita_plumber', '+919876543211', 'Lajpat Nagar, Delhi'),
  ('00000000-0000-0000-0000-000000000004', 'worker', 'Amit Patel (Carpenter)', 'amit_carpenter', '+919876543212', 'Karol Bagh, Delhi'),
  ('00000000-0000-0000-0000-000000000005', 'customer', 'Priya Verma', 'priya_v', '+919876543220', 'Connaught Place, Delhi')
on conflict (id) do nothing;

-- 4. Seed Worker Profiles
insert into worker_profiles (user_id, skill_type, experience_years, certification_url, verification_status, rating_avg, is_available) values
  ('00000000-0000-0000-0000-000000000002', 'electrician', 7, 'https://storage.coop.test/cert-elec-1.pdf', 'verified', 4.9, true),
  ('00000000-0000-0000-0000-000000000003', 'plumber', 5, 'https://storage.coop.test/cert-plumb-2.pdf', 'verified', 4.8, true),
  ('00000000-0000-0000-0000-000000000004', 'carpenter', 3, null, 'pending', 4.2, true)
on conflict (user_id) do update set
  verification_status = excluded.verification_status,
  is_available = excluded.is_available;

-- 5. Seed Worker Locations (Coordinates around Delhi: 28.6139° N, 77.2090° E)
insert into worker_locations (worker_id, location, service_radius_km) values
  ('00000000-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(77.2167, 28.6448), 4326)::geography, 10),
  ('00000000-0000-0000-0000-000000000003', ST_SetSRID(ST_MakePoint(77.2433, 28.5677), 4326)::geography, 8),
  ('00000000-0000-0000-0000-000000000004', ST_SetSRID(ST_MakePoint(77.1906, 28.6517), 4326)::geography, 5)
on conflict (worker_id) do update set
  location = excluded.location,
  service_radius_km = excluded.service_radius_km;

-- 6. Seed Sample Completed Job, Earning & Transaction
insert into service_requests (
  id,
  customer_id,
  worker_id,
  service_type,
  worker_type_requested,
  description,
  location,
  status,
  briefing,
  quoted_amount,
  created_at
) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000002',
  'electrician',
  'Master Electrician',
  'Fix main distribution board circuit breaker tripping',
  ST_SetSRID(ST_MakePoint(77.2195, 28.6315), 4326)::geography,
  'completed',
  'Carry 32A MCB replacement and digital multimeter.',
  245.00,
  now() - interval '2 days'
) on conflict (id) do nothing;

insert into earnings (
  id,
  worker_id,
  job_id,
  amount,
  earned_at
) values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  245.00,
  now() - interval '2 days'
) on conflict (id) do nothing;

insert into transactions (
  id,
  customer_id,
  job_id,
  amount,
  gateway_ref,
  idempotency_key,
  status,
  created_at
) values (
  '30000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000005',
  '10000000-0000-0000-0000-000000000001',
  245.00,
  'pay_test_order_initial_001',
  'idemp_seed_10000000-0000-0000-0000-000000000001',
  'paid',
  now() - interval '2 days'
) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- STEP 7: ATTACH AUDIT TRIGGERS
-- ----------------------------------------------------------------------------
create trigger trg_audit_cost_parameters
  after insert or update or delete on cost_parameters
  for each row execute function audit_trigger_func();

create trigger trg_audit_worker_verification
  after update on worker_profiles
  for each row execute function audit_worker_verification_func();

-- ----------------------------------------------------------------------------
-- STEP 8: AUTOMATED USER SYNCHRONIZATION TRIGGER FROM SUPABASE AUTH
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, full_name, username, phone, address)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name;

  if (coalesce(new.raw_user_meta_data->>'role', '') = 'worker') then
    insert into public.worker_profiles (user_id, skill_type, experience_years)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'skill_type', 'electrician'),
      coalesce((new.raw_user_meta_data->>'experience_years')::numeric, 1)
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

