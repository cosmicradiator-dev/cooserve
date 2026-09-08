-- ============================================================================
-- Seed Data for Cooperative Gig Services Platform
-- Includes test admin, workers, customers, locations, and cost parameters
-- ============================================================================

-- Ensure PostGIS is enabled
create extension if not exists postgis;

-- 1. Seed Cost Parameters
insert into cost_parameters (key, value) values
  ('base_fare', 100),
  ('per_km_rate', 12),
  ('experience_multiplier', 5),
  ('urgency_multiplier', 1.5),
  ('service_type_default_multiplier', 1.0)
on conflict (key) do update set value = excluded.value;

-- 2. Mock Admin User Seed (Simulating Auth user row)
-- Note: In production Supabase, users are first inserted into auth.users.
-- This script creates corresponding public.users rows with predefined UUIDs for local dev & testing.

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

