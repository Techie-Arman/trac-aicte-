create sequence if not exists public.case_number_sequence;

create table if not exists public.bureaus (
  id text primary key,
  code text not null unique,
  name text not null,
  description text not null default '',
  is_seed boolean not null default false
);

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('rb_official', 'pgrc_official', 'other_official', 'regional', 'senior', 'admin')),
  bureau_id text references public.bureaus(id),
  bureau_code text,
  region text,
  is_seed boolean not null default false
);

create table if not exists public.institutions (
  id text primary key,
  aicte_permanent_id text not null unique,
  name text not null,
  address text not null default '',
  district text not null default '',
  state text not null default '',
  region text not null default '',
  type text not null default '',
  created_at timestamptz not null default now(),
  is_seed boolean not null default false
);

create table if not exists public.complaints (
  id text primary key,
  case_number text not null unique,
  institution_id text references public.institutions(id),
  institution_name_raw text not null,
  permanent_id_raw text,
  category text not null,
  description text not null,
  complainant_type text not null check (complainant_type in ('student', 'faculty', 'stakeholder', 'other')),
  date_received timestamptz not null,
  status text not null check (status in ('pending', 'under_process', 'disposed', 'transferred', 'escalated')),
  bureau_id text not null references public.bureaus(id),
  bureau_code text not null,
  assigned_officer_id text,
  assigned_officer_name text,
  last_action text,
  next_action text,
  last_action_date timestamptz,
  expected_disposal_date timestamptz,
  match_method text check (match_method in ('id', 'manual')),
  created_at timestamptz not null default now(),
  created_by uuid,
  is_seed boolean not null default false
);

create table if not exists public.case_actions (
  id text primary key default gen_random_uuid()::text,
  case_id text not null references public.complaints(id) on delete cascade,
  action_type text not null check (action_type in ('created', 'updated', 'remark', 'transferred', 'escalated', 'disposed', 'institution_resolved')),
  performed_by text not null,
  performed_by_name text not null,
  bureau_id text not null references public.bureaus(id),
  bureau_code text not null,
  remarks text not null,
  before_state jsonb,
  after_state jsonb,
  from_bureau_code text,
  to_bureau_code text,
  created_at timestamptz not null default now(),
  is_seed boolean not null default false
);

create table if not exists public.institution_resolution_queue (
  id text primary key,
  case_id text not null unique references public.complaints(id) on delete cascade,
  case_number text not null,
  raw_institution_name text not null,
  raw_permanent_id text,
  status text not null check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  bureau_code text not null,
  is_seed boolean not null default false
);

create table if not exists public.institution_match_suggestions (
  id text primary key,
  queue_id text not null references public.institution_resolution_queue(id) on delete cascade,
  suggested_institution_id text not null references public.institutions(id),
  suggested_institution_name text not null,
  suggested_permanent_id text not null,
  confidence double precision not null check (confidence between 0 and 1),
  match_details jsonb not null,
  is_seed boolean not null default false
);

create table if not exists public.overlap_flags (
  id text primary key,
  institution_id text not null references public.institutions(id),
  institution_name text not null,
  aicte_permanent_id text not null,
  status text not null check (status in ('open', 'reviewed', 'coordinated', 'dismissed')),
  involved_bureaus text[] not null default '{}',
  case_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  is_seed boolean not null default false
);

create table if not exists public.overlap_review_events (
  id text primary key,
  flag_id text not null references public.overlap_flags(id) on delete cascade,
  action text not null check (action in ('coordinated', 'dismissed', 'remark')),
  notes text not null default '',
  reviewed_by text not null,
  reviewed_by_name text not null,
  reviewed_at timestamptz not null default now(),
  is_seed boolean not null default false
);

create table if not exists public.duplicate_flags (
  id text primary key,
  institution_id text not null references public.institutions(id),
  institution_name text not null,
  aicte_permanent_id text not null,
  confidence double precision not null check (confidence between 0 and 1),
  status text not null check (status in ('open', 'confirmed_duplicate', 'dismissed')),
  case_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  created_by uuid,
  is_seed boolean not null default false
);

create table if not exists public.duplicate_review_events (
  id text primary key,
  flag_id text not null references public.duplicate_flags(id) on delete cascade,
  action text not null check (action in ('confirmed_duplicate', 'dismissed', 'remark')),
  notes text not null default '',
  reviewed_by text not null,
  reviewed_by_name text not null,
  reviewed_at timestamptz not null default now(),
  is_seed boolean not null default false
);

create table if not exists public.sla_rules (
  id text primary key,
  category text not null,
  bureau_id text not null references public.bureaus(id),
  bureau_code text not null,
  days_allowed integer not null check (days_allowed > 0),
  warning_days_before integer not null check (warning_days_before >= 0),
  is_seed boolean not null default false
);

create table if not exists public.alerts (
  id text primary key,
  type text not null check (type in ('overlap', 'duplicate', 'pending_reminder', 'escalation', 'sla_warning', 'sla_breach')),
  recipient_bureau_code text,
  recipient_user_id text,
  case_id text references public.complaints(id) on delete cascade,
  case_number text,
  flag_id text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  is_seed boolean not null default false
);

create table if not exists public.app_settings (
  id text primary key,
  value integer not null,
  is_seed boolean not null default false
);

create index if not exists complaints_created_by_idx on public.complaints(created_by);
create index if not exists complaints_institution_id_idx on public.complaints(institution_id);
create index if not exists complaints_bureau_status_idx on public.complaints(bureau_code, status);
create index if not exists case_actions_case_created_idx on public.case_actions(case_id, created_at desc);
create index if not exists resolution_queue_status_idx on public.institution_resolution_queue(status, created_at desc);
create index if not exists alerts_recipient_unread_idx on public.alerts(recipient_user_id, is_read, created_at desc);

create or replace function public.next_case_number()
returns text
language plpgsql
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := 'TRAC-' || to_char(current_timestamp, 'YYYY') || '-' ||
      lpad(nextval('public.case_number_sequence')::text, 5, '0');
    exit when not exists (
      select 1 from public.complaints where case_number = candidate
    );
  end loop;
  return candidate;
end;
$$;

alter table public.complaints alter column case_number set default public.next_case_number();

create or replace function public.create_case(
  p_id text,
  p_institution_id text,
  p_institution_name_raw text,
  p_permanent_id_raw text,
  p_category text,
  p_description text,
  p_complainant_type text,
  p_date_received timestamptz,
  p_status text,
  p_bureau_id text,
  p_bureau_code text,
  p_assigned_officer_name text,
  p_expected_disposal_date timestamptz,
  p_match_method text
)
returns setof public.complaints
language plpgsql
security invoker
set search_path = ''
as $$
declare
  inserted_case public.complaints;
  actor_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to register a case';
  end if;
  if p_status <> 'pending' then
    raise exception 'New cases must start in pending status';
  end if;

  actor_name := coalesce(nullif(p_assigned_officer_name, ''), auth.jwt() ->> 'email', 'Official');

  insert into public.complaints (
    id, institution_id, institution_name_raw, permanent_id_raw, category,
    description, complainant_type, date_received, status, bureau_id, bureau_code,
    assigned_officer_id, assigned_officer_name, expected_disposal_date,
    match_method, created_by, is_seed
  ) values (
    p_id, p_institution_id, p_institution_name_raw, p_permanent_id_raw, p_category,
    p_description, p_complainant_type, p_date_received, p_status, p_bureau_id, p_bureau_code,
    auth.uid()::text, actor_name, p_expected_disposal_date, p_match_method, auth.uid(), false
  )
  returning * into inserted_case;

  insert into public.case_actions (
    case_id, action_type, performed_by, performed_by_name, bureau_id, bureau_code, remarks, is_seed
  ) values (
    inserted_case.id, 'created', auth.uid()::text, actor_name, inserted_case.bureau_id,
    inserted_case.bureau_code, 'Complaint registered in the central monitoring repository', false
  );

  if inserted_case.institution_id is null then
    insert into public.institution_resolution_queue (
      id, case_id, case_number, raw_institution_name, raw_permanent_id, status, bureau_code, is_seed
    ) values (
      gen_random_uuid()::text, inserted_case.id, inserted_case.case_number,
      inserted_case.institution_name_raw, inserted_case.permanent_id_raw, 'pending',
      inserted_case.bureau_code, false
    );
  end if;

  return next inserted_case;
end;
$$;

revoke all on function public.next_case_number() from public, anon, authenticated;
revoke all on function public.create_case(text, text, text, text, text, text, text, timestamptz, text, text, text, text, timestamptz, text) from public, anon;
grant execute on function public.create_case(text, text, text, text, text, text, text, timestamptz, text, text, text, text, timestamptz, text) to authenticated;
grant execute on function public.next_case_number() to authenticated;
grant usage on sequence public.case_number_sequence to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'bureaus', 'users', 'institutions', 'complaints', 'case_actions',
    'institution_resolution_queue', 'institution_match_suggestions',
    'overlap_flags', 'overlap_review_events', 'duplicate_flags',
    'duplicate_review_events', 'sla_rules', 'alerts', 'app_settings'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
  end loop;
end;
$$;

create policy "authenticated users read bureaus" on public.bureaus
  for select to authenticated using (true);
create policy "authenticated users read institutions" on public.institutions
  for select to authenticated using (true);
create policy "authenticated users read demo and own profiles" on public.users
  for select to authenticated using (is_seed or id = (select auth.uid())::text);
create policy "users create own least-privilege profile" on public.users
  for insert to authenticated
  with check (
    id = (select auth.uid())::text
    and role = 'other_official'
    and email = (select auth.jwt() ->> 'email')
    and not is_seed
  );
grant insert on public.users to authenticated;

create policy "read demo and own cases" on public.complaints
  for select to authenticated using (is_seed or created_by = (select auth.uid()));
create policy "create own cases" on public.complaints
  for insert to authenticated with check (created_by = (select auth.uid()) and not is_seed);
create policy "update demo and own cases" on public.complaints
  for update to authenticated
  using (is_seed or (created_by = (select auth.uid()) and not is_seed))
  with check (is_seed or (created_by = (select auth.uid()) and not is_seed));
grant insert, update on public.complaints to authenticated;

create policy "read visible case audit" on public.case_actions
  for select to authenticated using (
    is_seed or exists (
      select 1 from public.complaints c
      where c.id = case_id and (c.is_seed or c.created_by = (select auth.uid()))
    )
  );
create policy "append own case audit" on public.case_actions
  for insert to authenticated with check (
    performed_by = (select auth.uid())::text and exists (
      select 1 from public.complaints c
      where c.id = case_id and (c.is_seed or c.created_by = (select auth.uid()))
    )
  );
grant insert on public.case_actions to authenticated;

create policy "read visible resolution queue" on public.institution_resolution_queue
  for select to authenticated using (
    is_seed or exists (
      select 1 from public.complaints c
      where c.id = case_id and (c.is_seed or c.created_by = (select auth.uid()))
    )
  );
create policy "create own resolution queue" on public.institution_resolution_queue
  for insert to authenticated with check (
    not is_seed and exists (
      select 1 from public.complaints c
      where c.id = case_id and c.created_by = (select auth.uid())
    )
  );
grant insert on public.institution_resolution_queue to authenticated;
create policy "resolve demo and own queue items" on public.institution_resolution_queue
  for update to authenticated using (
    is_seed or exists (
      select 1 from public.complaints c
      where c.id = case_id and c.created_by = (select auth.uid())
    )
  ) with check (
    is_seed or exists (
      select 1 from public.complaints c
      where c.id = case_id and c.created_by = (select auth.uid())
    )
  );
grant update on public.institution_resolution_queue to authenticated;

create policy "read visible suggestions" on public.institution_match_suggestions
  for select to authenticated using (
    is_seed or exists (
      select 1 from public.institution_resolution_queue q
      join public.complaints c on c.id = q.case_id
      where q.id = queue_id and (c.is_seed or c.created_by = (select auth.uid()))
    )
  );

create policy "read demo and own overlap flags" on public.overlap_flags
  for select to authenticated using (is_seed or created_by = (select auth.uid()));
create policy "review demo and own overlap flags" on public.overlap_flags
  for update to authenticated using (is_seed or created_by = (select auth.uid()))
  with check (is_seed or created_by = (select auth.uid()));
grant update on public.overlap_flags to authenticated;
create policy "read visible overlap reviews" on public.overlap_review_events
  for select to authenticated using (
    is_seed or exists (
      select 1 from public.overlap_flags f
      where f.id = flag_id and (f.is_seed or f.created_by = (select auth.uid()))
    )
  );
create policy "append overlap reviews" on public.overlap_review_events
  for insert to authenticated with check (
    reviewed_by = (select auth.uid())::text and exists (
      select 1 from public.overlap_flags f
      where f.id = flag_id and (f.is_seed or f.created_by = (select auth.uid()))
    )
  );
grant insert on public.overlap_review_events to authenticated;

create policy "read demo and own duplicate flags" on public.duplicate_flags
  for select to authenticated using (is_seed or created_by = (select auth.uid()));
create policy "review demo and own duplicate flags" on public.duplicate_flags
  for update to authenticated using (is_seed or created_by = (select auth.uid()))
  with check (is_seed or created_by = (select auth.uid()));
grant update on public.duplicate_flags to authenticated;
create policy "read visible duplicate reviews" on public.duplicate_review_events
  for select to authenticated using (
    is_seed or exists (
      select 1 from public.duplicate_flags f
      where f.id = flag_id and (f.is_seed or f.created_by = (select auth.uid()))
    )
  );
create policy "append duplicate reviews" on public.duplicate_review_events
  for insert to authenticated with check (
    reviewed_by = (select auth.uid())::text and exists (
      select 1 from public.duplicate_flags f
      where f.id = flag_id and (f.is_seed or f.created_by = (select auth.uid()))
    )
  );
grant insert on public.duplicate_review_events to authenticated;

create policy "authenticated users read SLA rules" on public.sla_rules
  for select to authenticated using (true);
create policy "authenticated users read alerts" on public.alerts
  for select to authenticated using (is_seed or recipient_user_id = (select auth.uid())::text);
create policy "mark visible alerts read" on public.alerts
  for update to authenticated using (is_seed or recipient_user_id = (select auth.uid())::text)
  with check (is_seed or recipient_user_id = (select auth.uid())::text);
grant update on public.alerts to authenticated;
create policy "authenticated users read settings" on public.app_settings
  for select to authenticated using (true);
create policy "admins update demo settings" on public.app_settings
  for update to authenticated
  using (
    is_seed and exists (
      select 1 from public.users u
      where u.id = (select auth.uid())::text and u.role = 'admin' and not u.is_seed
    )
  )
  with check (
    is_seed and exists (
      select 1 from public.users u
      where u.id = (select auth.uid())::text and u.role = 'admin' and not u.is_seed
    )
  );
grant update on public.app_settings to authenticated;

create or replace function public.update_case_status(
  p_case_id text,
  p_status text,
  p_remarks text,
  p_actor_name text
)
returns setof public.complaints
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_case public.complaints;
  action_kind text;
  previous_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to update a case';
  end if;

  select status into previous_status
  from public.complaints
  where id = p_case_id
  for update;
  if not found then
    raise exception 'Case was not found or cannot be updated';
  end if;

  update public.complaints
  set status = p_status,
      last_action = coalesce(nullif(p_remarks, ''), 'Status changed to ' || p_status),
      last_action_date = now()
  where id = p_case_id
  returning * into updated_case;

  if not found then
    raise exception 'Case was not found or cannot be updated';
  end if;

  action_kind := case p_status
    when 'transferred' then 'transferred'
    when 'escalated' then 'escalated'
    when 'disposed' then 'disposed'
    else 'updated'
  end;

  insert into public.case_actions (
    case_id, action_type, performed_by, performed_by_name,
    bureau_id, bureau_code, remarks, before_state, after_state
  ) values (
    updated_case.id, action_kind, auth.uid()::text, coalesce(nullif(p_actor_name, ''), 'Official'),
    updated_case.bureau_id, updated_case.bureau_code,
    coalesce(nullif(p_remarks, ''), 'Status changed to ' || p_status),
    jsonb_build_object('status', previous_status),
    jsonb_build_object('status', updated_case.status)
  );

  return next updated_case;
end;
$$;

create or replace function public.transfer_case(
  p_case_id text,
  p_target_bureau_code text,
  p_remarks text,
  p_actor_name text
)
returns setof public.complaints
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_case public.complaints;
  target_bureau public.bureaus;
  previous_bureau_code text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to transfer a case';
  end if;

  select * into target_bureau from public.bureaus where code = p_target_bureau_code;
  if not found then
    raise exception 'Target bureau does not exist';
  end if;

  select bureau_code into previous_bureau_code
  from public.complaints
  where id = p_case_id
  for update;
  if not found then
    raise exception 'Case was not found or cannot be transferred';
  end if;

  update public.complaints
  set bureau_id = target_bureau.id,
      bureau_code = target_bureau.code,
      status = 'transferred',
      last_action = 'Transferred from ' || previous_bureau_code || ' to ' || target_bureau.code || ': ' || p_remarks,
      last_action_date = now()
  where id = p_case_id
  returning * into updated_case;

  insert into public.case_actions (
    case_id, action_type, performed_by, performed_by_name, bureau_id, bureau_code,
    from_bureau_code, to_bureau_code, remarks, before_state, after_state
  ) values (
    updated_case.id, 'transferred', auth.uid()::text, coalesce(nullif(p_actor_name, ''), 'Official'),
    updated_case.bureau_id, updated_case.bureau_code,
    previous_bureau_code, target_bureau.code, p_remarks,
    jsonb_build_object('bureau_code', previous_bureau_code),
    jsonb_build_object('bureau_code', target_bureau.code, 'status', 'transferred')
  );

  return next updated_case;
end;
$$;

create or replace function public.resolve_institution_queue_item(
  p_queue_id text,
  p_institution_id text,
  p_reason text,
  p_actor_name text
)
returns setof public.institution_resolution_queue
language plpgsql
security invoker
set search_path = ''
as $$
declare
  queue_item public.institution_resolution_queue;
  target_institution public.institutions;
  related_case public.complaints;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to resolve an institution';
  end if;

  select * into queue_item
  from public.institution_resolution_queue
  where id = p_queue_id
  for update;
  if not found then
    raise exception 'Resolution queue item was not found or cannot be updated';
  end if;

  select * into target_institution from public.institutions where id = p_institution_id;
  if not found then
    raise exception 'Selected institution does not exist';
  end if;

  update public.complaints
  set institution_id = target_institution.id,
      institution_name_raw = target_institution.name,
      permanent_id_raw = target_institution.aicte_permanent_id,
      match_method = 'manual',
      last_action = 'Institution manually matched to ' || target_institution.name || ': ' || p_reason,
      last_action_date = now()
  where id = queue_item.case_id
  returning * into related_case;
  if not found then
    raise exception 'Case was not found or cannot be updated';
  end if;

  update public.institution_resolution_queue
  set status = 'resolved'
  where id = queue_item.id
  returning * into queue_item;

  insert into public.case_actions (
    case_id, action_type, performed_by, performed_by_name,
    bureau_id, bureau_code, remarks, after_state
  ) values (
    related_case.id, 'institution_resolved', auth.uid()::text,
    coalesce(nullif(p_actor_name, ''), 'Official'), related_case.bureau_id,
    related_case.bureau_code, 'Institution resolved by official: ' || p_reason,
    jsonb_build_object('institution_id', target_institution.id, 'match_method', 'manual')
  );

  return next queue_item;
end;
$$;

create or replace function public.record_overlap_review(
  p_flag_id text,
  p_action text,
  p_notes text,
  p_actor_name text
)
returns setof public.overlap_review_events
language plpgsql
security invoker
set search_path = ''
as $$
declare
  review_event public.overlap_review_events;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to review overlap flags';
  end if;

  if p_action in ('coordinated', 'dismissed') then
    update public.overlap_flags
    set status = p_action, updated_at = now()
    where id = p_flag_id;
    if not found then
      raise exception 'Overlap flag was not found or cannot be updated';
    end if;
  elsif p_action <> 'remark' then
    raise exception 'Invalid overlap review action';
  end if;

  insert into public.overlap_review_events (
    id, flag_id, action, notes, reviewed_by, reviewed_by_name, is_seed
  ) values (
    gen_random_uuid()::text, p_flag_id, p_action, p_notes, auth.uid()::text,
    coalesce(nullif(p_actor_name, ''), 'Official'), false
  )
  returning * into review_event;

  return next review_event;
end;
$$;

create or replace function public.record_duplicate_review(
  p_flag_id text,
  p_action text,
  p_notes text,
  p_actor_name text
)
returns setof public.duplicate_review_events
language plpgsql
security invoker
set search_path = ''
as $$
declare
  review_event public.duplicate_review_events;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required to review duplicate flags';
  end if;

  if p_action in ('confirmed_duplicate', 'dismissed') then
    update public.duplicate_flags
    set status = p_action
    where id = p_flag_id;
    if not found then
      raise exception 'Duplicate flag was not found or cannot be updated';
    end if;
  elsif p_action <> 'remark' then
    raise exception 'Invalid duplicate review action';
  end if;

  insert into public.duplicate_review_events (
    id, flag_id, action, notes, reviewed_by, reviewed_by_name, is_seed
  ) values (
    gen_random_uuid()::text, p_flag_id, p_action, p_notes, auth.uid()::text,
    coalesce(nullif(p_actor_name, ''), 'Official'), false
  )
  returning * into review_event;

  return next review_event;
end;
$$;

revoke all on function public.update_case_status(text, text, text, text) from public, anon;
revoke all on function public.transfer_case(text, text, text, text) from public, anon;
revoke all on function public.resolve_institution_queue_item(text, text, text, text) from public, anon;
revoke all on function public.record_overlap_review(text, text, text, text) from public, anon;
revoke all on function public.record_duplicate_review(text, text, text, text) from public, anon;
grant execute on function public.update_case_status(text, text, text, text) to authenticated;
grant execute on function public.transfer_case(text, text, text, text) to authenticated;
grant execute on function public.resolve_institution_queue_item(text, text, text, text) to authenticated;
grant execute on function public.record_overlap_review(text, text, text, text) to authenticated;
grant execute on function public.record_duplicate_review(text, text, text, text) to authenticated;