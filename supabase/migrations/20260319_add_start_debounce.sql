-- Compatibility migration for the old /start debounce filename.
-- Keeps local manual rollout instructions safe by applying the new atomic claim approach.

drop trigger if exists cb_events_cleanup_trigger on public.cb_events;
drop function if exists public.cb_events_cleanup_trigger();
drop function if exists public.cb_events_cleanup_old_start_commands();
drop index if exists public.cb_events_start_command_unique_idx;
drop index if exists public.cb_events_start_command_recent_idx;

create table if not exists public.cb_command_locks (
  user_tg_id text not null,
  command_name text not null,
  last_processed_at timestamptz not null default now(),
  last_payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_tg_id, command_name)
);

create index if not exists cb_command_locks_command_processed_idx
  on public.cb_command_locks (command_name, last_processed_at desc);

create or replace function public.cb_claim_command(
  p_user_tg_id text,
  p_command_name text,
  p_payload_json jsonb default '{}'::jsonb,
  p_dedupe_window interval default interval '2 seconds'
)
returns table (
  should_process boolean,
  user_tg_id text,
  command_name text,
  processed_at timestamptz
)
language sql
as $$
  with claimed as (
    insert into public.cb_command_locks as locks (
      user_tg_id,
      command_name,
      last_processed_at,
      last_payload_json,
      created_at,
      updated_at
    )
    values (
      p_user_tg_id,
      p_command_name,
      now(),
      coalesce(p_payload_json, '{}'::jsonb),
      now(),
      now()
    )
    on conflict (user_tg_id, command_name) do update
      set last_processed_at = excluded.last_processed_at,
          last_payload_json = excluded.last_payload_json,
          updated_at = excluded.updated_at
      where locks.last_processed_at <= now() - p_dedupe_window
    returning
      true as should_process,
      user_tg_id,
      command_name,
      last_processed_at as processed_at,
      last_payload_json as payload_json
  ),
  ignored as (
    update public.cb_command_locks as locks
    set last_payload_json = coalesce(p_payload_json, '{}'::jsonb),
        updated_at = now()
    where locks.user_tg_id = p_user_tg_id
      and locks.command_name = p_command_name
      and not exists (select 1 from claimed)
    returning
      false as should_process,
      locks.user_tg_id,
      locks.command_name,
      locks.last_processed_at as processed_at,
      locks.last_payload_json as payload_json
  )
  select
    should_process,
    user_tg_id,
    command_name,
    processed_at
  from claimed

  union all

  select
    should_process,
    user_tg_id,
    command_name,
    processed_at
  from ignored
  limit 1;
$$;
