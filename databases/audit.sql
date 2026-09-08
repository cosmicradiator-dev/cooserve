-- ============================================================================
-- Enterprise Audit Trail Triggers and Procedures
-- Records before and after state for money/config-relevant actions
-- ============================================================================

-- Function to handle audit recording
create or replace function audit_trigger_func()
returns trigger as $$
declare
  actor_user_id uuid;
begin
  -- Extract actor from JWT or fallback to null
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
      coalesce(new.id::text, new.key::text, new.user_id::text, 'unknown'),
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
      coalesce(old.id::text, old.key::text, old.user_id::text, 'unknown'),
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
      coalesce(new.id::text, new.key::text, new.user_id::text, 'unknown'),
      null,
      to_jsonb(new)
    );
    return new;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger on cost_parameters table
drop trigger if exists trg_audit_cost_parameters on cost_parameters;
create trigger trg_audit_cost_parameters
  after insert or update or delete on cost_parameters
  for each row execute function audit_trigger_func();

-- Trigger on worker_profiles verification changes
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
      new.user_id::text,
      jsonb_build_object('verification_status', old.verification_status),
      jsonb_build_object('verification_status', new.verification_status)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_audit_worker_verification on worker_profiles;
create trigger trg_audit_worker_verification
  after update on worker_profiles
  for each row execute function audit_worker_verification_func();

