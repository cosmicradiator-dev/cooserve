-- ============================================================================
-- Seed Data for Cooperative Gig Services Platform
-- Includes test admin, workers, customers, locations, and cost parameters
-- ============================================================================

-- Ensure PostGIS & PGCrypto are enabled
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- 0. Ensure Audit Trigger is updated with JSONB safety before inserting into cost_parameters
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
    insert into audit_log (actor_id, action, target_table, target_id, before, after)
    values (actor_user_id, tg_table_name || '.update', tg_table_name, coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key', to_jsonb(new) ->> 'user_id', 'unknown'), to_jsonb(old), to_jsonb(new));
    return new;
  elsif (tg_op = 'DELETE') then
    insert into audit_log (actor_id, action, target_table, target_id, before, after)
    values (actor_user_id, tg_table_name || '.delete', tg_table_name, coalesce(to_jsonb(old) ->> 'id', to_jsonb(old) ->> 'key', to_jsonb(old) ->> 'user_id', 'unknown'), to_jsonb(old), null);
    return old;
  elsif (tg_op = 'INSERT') then
    insert into audit_log (actor_id, action, target_table, target_id, before, after)
    values (actor_user_id, tg_table_name || '.insert', tg_table_name, coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key', to_jsonb(new) ->> 'user_id', 'unknown'), null, to_jsonb(new));
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- 1. Seed Cost Parameters
insert into cost_parameters (key, value) values
  ('base_fare', 100),
  ('per_km_rate', 12),
  ('experience_multiplier', 5),
  ('urgency_multiplier', 1.5),
  ('service_type_default_multiplier', 1.0)
on conflict (key) do update set value = excluded.value;

-- 2. Mock Admin & User Seed with bcrypt-hashed passwords (Password123!)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'auth' and table_name = 'users') then
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
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

insert into users (id, role, full_name, username, phone, address) values
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Platform Super Admin', 'admin', '+18005550100', '100 Coop Plaza, Metro City'),
  ('00000000-0000-0000-0000-000000000002', 'worker', 'Ramesh Sharma (Electrician)', 'ramesh_elec', '+919876543210', 'Sector 14, Delhi'),
  ('00000000-0000-0000-0000-000000000003', 'worker', 'Sunita Devi (Plumber)', 'sunita_plumber', '+919876543211', 'Lajpat Nagar, Delhi'),
  ('00000000-0000-0000-0000-000000000004', 'worker', 'Amit Patel (Carpenter)', 'amit_carpenter', '+919876543212', 'Karol Bagh, Delhi'),
  ('00000000-0000-0000-0000-000000000005', 'customer', 'Priya Verma', 'priya_v', '+919876543220', 'Connaught Place, Delhi')
on conflict (id) do nothing;

-- 3. Seed Worker Profiles
insert into worker_profiles (user_id, skill_type, experience_years, certification_url, verification_status, rating_avg, is_available) values
  ('00000000-0000-0000-0000-000000000002', 'electrician', 7, 'https://storage.coop.test/cert-elec-1.pdf', 'verified', 4.9, true),
  ('00000000-0000-0000-0000-000000000003', 'plumber', 5, 'https://storage.coop.test/cert-plumb-2.pdf', 'verified', 4.8, true),
  ('00000000-0000-0000-0000-000000000004', 'carpenter', 3, null, 'pending', 4.2, true)
on conflict (user_id) do update set
  verification_status = excluded.verification_status,
  is_available = excluded.is_available;

-- 4. Seed Worker Locations (Coordinates around Delhi: 28.6139° N, 77.2090° E)
insert into worker_locations (worker_id, location, service_radius_km) values
  ('00000000-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(77.2167, 28.6448), 4326)::geography, 10),
  ('00000000-0000-0000-0000-000000000003', ST_SetSRID(ST_MakePoint(77.2433, 28.5677), 4326)::geography, 8),
  ('00000000-0000-0000-0000-000000000004', ST_SetSRID(ST_MakePoint(77.1906, 28.6517), 4326)::geography, 5)
on conflict (worker_id) do update set
  location = excluded.location,
  service_radius_km = excluded.service_radius_km;

-- 5. Seed Sample Completed Job and Earning
insert into service_requests (
  id, customer_id, worker_id, service_type, worker_type_requested, description, location, status, briefing, quoted_amount, created_at
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
  id, worker_id, job_id, amount, earned_at
) values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  245.00,
  now() - interval '2 days'
) on conflict (id) do nothing;

insert into transactions (
  id, customer_id, job_id, amount, gateway_ref, idempotency_key, status, created_at
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

-- 6. Automated Synchronization Trigger from Supabase Auth
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

