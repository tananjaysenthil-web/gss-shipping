-- GSS client portal / internal tool schema (Supabase backend).
-- Paste this whole file into the Supabase SQL editor (Project → SQL Editor →
-- New query) and run it once against a fresh project.

create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One row per auth.users row, created automatically by the trigger below.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null check (role in ('client', 'staff')),
  company_id uuid references companies (id),
  created_at timestamptz not null default now()
);

create sequence if not exists shipment_ref_seq start 1;

create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id),
  reference_code text unique not null default (
    'GSS-' || extract(year from now()) || '-' || lpad(nextval('shipment_ref_seq')::text, 4, '0')
  ),
  vessel_name text not null,
  port text not null,
  operation_type text not null check (operation_type in ('port_captain', 'survey_inspection', 'logistics')),
  cargo_description text not null,
  status text not null check (status in ('scheduled', 'in_progress', 'completed', 'on_hold')),
  operation_date date not null,
  notes text not null default '',
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_company_id_idx on shipments (company_id);

-- New auth.users row -> brand-new company (never joins an existing one by
-- name) + a 'client' profile. Mirrors the custom backend's signup behaviour.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_company_id uuid;
begin
  insert into public.companies (name)
  values (coalesce(new.raw_user_meta_data ->> 'company_name', 'Unnamed company'))
  returning id into new_company_id;

  insert into public.profiles (id, email, role, company_id)
  values (new.id, new.email, 'client', new_company_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at current on shipment edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipments_set_updated_at on shipments;
create trigger shipments_set_updated_at
  before update on shipments
  for each row execute function public.set_updated_at();

-- Row Level Security: enforced in Postgres, not in the frontend.
alter table companies enable row level security;
alter table profiles enable row level security;
alter table shipments enable row level security;

create policy "read own profile" on profiles for select
  using (id = auth.uid());

create policy "staff update any profile" on profiles for update
  using ((select role from profiles where id = auth.uid()) = 'staff');

create policy "staff read companies" on companies for select
  using ((select role from profiles where id = auth.uid()) = 'staff');

create policy "clients read own shipments" on shipments for select
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "staff read all shipments" on shipments for select
  using ((select role from profiles where id = auth.uid()) = 'staff');

create policy "staff insert shipments" on shipments for insert
  with check ((select role from profiles where id = auth.uid()) = 'staff');

create policy "staff update shipments" on shipments for update
  using ((select role from profiles where id = auth.uid()) = 'staff');
