-- Core key/value state store used by the app
create table if not exists public.app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_state_set_updated_at on public.app_state;
create trigger app_state_set_updated_at
before update on public.app_state
for each row
execute function public.set_updated_at();

-- Optional: keep RLS enabled if you only access this table with service_role key.
alter table public.app_state enable row level security;

-- Storage bucket for invoice PDFs
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read invoices'
  ) then
    create policy "Public can read invoices"
      on storage.objects
      for select
      using (bucket_id = 'invoices');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Service role can manage invoices'
  ) then
    create policy "Service role can manage invoices"
      on storage.objects
      for all
      using (bucket_id = 'invoices' and auth.role() = 'service_role')
      with check (bucket_id = 'invoices' and auth.role() = 'service_role');
  end if;
end;
$$;