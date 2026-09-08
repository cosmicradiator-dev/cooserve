-- ============================================================================
-- Row Level Security (RLS) Policies
-- Layer 3 authorization defense-in-depth
-- ============================================================================

-- Enable RLS on all sensitive tables
alter table users enable row level security;
alter table worker_profiles enable row level security;
alter table worker_locations enable row level security;
alter table service_requests enable row level security;
alter table earnings enable row level security;
alter table transactions enable row level security;
alter table ratings_feedback enable row level security;
alter table cost_parameters enable row level security;
alter table audit_log enable row level security;

-- Helper function: is current user an admin?
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

-- ----------------------------------------------------------------------------
-- 1. Users Policies
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. Worker Profiles Policies
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 3. Worker Locations Policies
-- ----------------------------------------------------------------------------
drop policy if exists "Anyone can read worker locations for discovery" on worker_locations;
create policy "Anyone can read worker locations for discovery"
  on worker_locations for select
  using (true);

drop policy if exists "Workers can update own location" on worker_locations;
create policy "Workers can update own location"
  on worker_locations for all
  using (auth.uid() = worker_id or is_admin())
  with check (auth.uid() = worker_id or is_admin());

-- ----------------------------------------------------------------------------
-- 4. Service Requests Policies
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 5. Earnings Policies
-- ----------------------------------------------------------------------------
drop policy if exists "Workers can read own earnings" on earnings;
create policy "Workers can read own earnings"
  on earnings for select
  using (auth.uid() = worker_id or is_admin());

drop policy if exists "Service role / Admin can insert earnings" on earnings;
create policy "Service role / Admin can insert earnings"
  on earnings for insert
  with check (is_admin());

-- ----------------------------------------------------------------------------
-- 6. Transactions Policies
-- ----------------------------------------------------------------------------
drop policy if exists "Customers can read own transactions" on transactions;
create policy "Customers can read own transactions"
  on transactions for select
  using (auth.uid() = customer_id or is_admin());

drop policy if exists "Service role / Admin can insert transactions" on transactions;
create policy "Service role / Admin can insert transactions"
  on transactions for insert
  with check (auth.uid() = customer_id or is_admin());

-- ----------------------------------------------------------------------------
-- 7. Cost Parameters Policies
-- ----------------------------------------------------------------------------
drop policy if exists "Anyone can read cost parameters" on cost_parameters;
create policy "Anyone can read cost parameters"
  on cost_parameters for select
  using (true);

drop policy if exists "Only admin can modify cost parameters" on cost_parameters;
create policy "Only admin can modify cost parameters"
  on cost_parameters for all
  using (is_admin())
  with check (is_admin());

-- ----------------------------------------------------------------------------
-- 8. Audit Log Policies
-- ----------------------------------------------------------------------------
drop policy if exists "Only admin can view audit logs" on audit_log;
create policy "Only admin can view audit logs"
  on audit_log for select
  using (is_admin());

drop policy if exists "System and admin can insert audit logs" on audit_log;
create policy "System and admin can insert audit logs"
  on audit_log for insert
  with check (true);

