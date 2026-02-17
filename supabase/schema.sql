-- =============================================================================
-- OnboardEasy – Full schema (single file)
-- Run once in Supabase SQL Editor. Covers: solo + workspace + owner/member visibility.
-- =============================================================================

create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  company_name text,
  phone text,
  gstin text,
  plan text default 'free' check (plan in ('free', 'basic', 'pro', 'agency')),
  client_limit int default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Organizations (workspaces for teams)
-- -----------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.organization_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- -----------------------------------------------------------------------------
-- Clients (solo: org_id null; workspace: org_id set, assigned_to for member)
-- -----------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid references public.organizations(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  company text,
  phone text,
  gstin text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index clients_personal_email on public.clients(owner_id, email) where org_id is null;
create unique index clients_org_email on public.clients(org_id, email) where org_id is not null;

-- -----------------------------------------------------------------------------
-- Projects, milestones, portal tokens, invoices, subscriptions
-- -----------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status text default 'active' check (status in ('active', 'completed', 'on_hold', 'cancelled')),
  value_inr decimal(12,2),
  currency text default 'INR',
  start_date date,
  end_date date,
  checklist jsonb default '[]',
  contract_signed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  due_date date,
  completed_at timestamptz,
  amount_inr decimal(12,2),
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.client_portal_tokens (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects(id) on delete cascade,
  razorpay_invoice_id text,
  amount_inr decimal(12,2) not null,
  status text default 'draft' check (status in ('draft', 'sent', 'paid', 'partially_paid', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  razorpay_subscription_id text,
  plan text not null,
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Organization invites
-- -----------------------------------------------------------------------------
create table public.organization_invites (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  token text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- RLS helpers (SECURITY DEFINER to avoid recursion when policies read org_members)
-- -----------------------------------------------------------------------------
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.organization_members om where om.org_id = p_org_id and om.user_id = p_user_id);
$$;

create or replace function public.is_org_admin(p_org_id uuid, p_user_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.organization_members om where om.org_id = p_org_id and om.user_id = p_user_id and om.role in ('owner', 'admin'));
$$;

create or replace function public.is_org_owner(p_org_id uuid, p_user_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.organization_members om where om.org_id = p_org_id and om.user_id = p_user_id and om.role = 'owner');
$$;

create or replace function public.org_has_members(p_org_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.organization_members om where om.org_id = p_org_id);
$$;

create or replace function public.shares_org_with(p_other_user_id uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.organization_members om1
    join public.organization_members om2 on om2.org_id = om1.org_id and om2.user_id = p_other_user_id
    where om1.user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.client_portal_tokens enable row level security;
alter table public.invoices enable row level security;
alter table public.subscriptions enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invites enable row level security;

-- Profiles
create policy "profiles_own" on public.profiles for all using (auth.uid() = id);
create policy "profiles_org_mates" on public.profiles for select using (public.shares_org_with(profiles.id));

-- Organizations
-- Creator can see org before adding themselves as member; then any member can see
create policy "orgs_visible_to_members" on public.organizations for select using (
  public.is_org_member(id, auth.uid()) or created_by = auth.uid()
);
create policy "orgs_insert_creator" on public.organizations for insert with check (true);
create policy "orgs_update_owner" on public.organizations for update using (public.is_org_admin(id, auth.uid()));

-- Organization members (use helpers to avoid infinite recursion)
create policy "org_members_select" on public.organization_members for select using (public.is_org_member(organization_members.org_id, auth.uid()));
create policy "org_members_insert" on public.organization_members for insert with check (
  public.is_org_admin(organization_members.org_id, auth.uid())
  or (user_id = auth.uid() and role = 'owner' and not public.org_has_members(organization_members.org_id))
);
create policy "org_members_delete" on public.organization_members for delete
  using (user_id = auth.uid() or public.is_org_owner(organization_members.org_id, auth.uid()));

-- Organization invites
create policy "invites_org_admins" on public.organization_invites for all using (public.is_org_admin(organization_invites.org_id, auth.uid()));

-- Clients: personal OR workspace (owner/admin see all, member sees only assigned_to = me)
create policy "clients_select" on public.clients for select using (
  (owner_id = auth.uid() and org_id is null)
  or (org_id is not null and (
    exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin'))
    or (clients.assigned_to = auth.uid() and exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid()))
  ))
);
create policy "clients_insert" on public.clients for insert with check (
  owner_id = auth.uid()
  and (org_id is null or exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid()))
  and (clients.org_id is null or clients.assigned_to is null or clients.assigned_to = auth.uid()
    or exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin')))
);
create policy "clients_update" on public.clients for update using (
  (owner_id = auth.uid() and org_id is null)
  or (org_id is not null and (
    exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin'))
    or (clients.assigned_to = auth.uid() and exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid()))
  ))
);
create policy "clients_delete" on public.clients for delete using (
  (owner_id = auth.uid() and org_id is null)
  or (org_id is not null and exists (select 1 from public.organization_members om where om.org_id = clients.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin')))
);

-- Projects (same visibility as client)
create policy "projects_via_clients" on public.projects for all using (
  exists (
    select 1 from public.clients c where c.id = projects.client_id
    and (
      (c.owner_id = auth.uid() and c.org_id is null)
      or (c.org_id is not null and (
        exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin'))
        or (c.assigned_to = auth.uid() and exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid()))
      ))
    )
  )
);

-- Milestones
create policy "milestones_via_projects" on public.milestones for all using (
  exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = milestones.project_id
    and (
      (c.owner_id = auth.uid() and c.org_id is null)
      or (c.org_id is not null and (
        exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin'))
        or (c.assigned_to = auth.uid() and exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid()))
      ))
    )
  )
);

-- Invoices
create policy "invoices_via_projects" on public.invoices for all using (
  exists (
    select 1 from public.projects p
    join public.clients c on c.id = p.client_id
    where p.id = invoices.project_id
    and (
      (c.owner_id = auth.uid() and c.org_id is null)
      or (c.org_id is not null and (
        exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin'))
        or (c.assigned_to = auth.uid() and exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid()))
      ))
    )
  )
);

-- Subscriptions
create policy "subscriptions_own" on public.subscriptions for all using (profile_id = auth.uid());

-- Client portal tokens
create policy "client_tokens_insert_own" on public.client_portal_tokens for insert with check (
  exists (
    select 1 from public.clients c where c.id = client_portal_tokens.client_id
    and (
      (c.owner_id = auth.uid() and c.org_id is null)
      or (c.org_id is not null and (
        exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid() and om.role in ('owner', 'admin'))
        or (c.assigned_to = auth.uid() and exists (select 1 from public.organization_members om where om.org_id = c.org_id and om.user_id = auth.uid()))
      ))
    )
  )
);

-- -----------------------------------------------------------------------------
-- Trigger: create profile on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index idx_clients_owner on public.clients(owner_id);
create index idx_clients_org on public.clients(org_id);
create index idx_projects_client on public.projects(client_id);
create index idx_milestones_project on public.milestones(project_id);
create index idx_client_portal_tokens_token on public.client_portal_tokens(token);
create index idx_invoices_project on public.invoices(project_id);
create index idx_org_members_org on public.organization_members(org_id);
create index idx_org_members_user on public.organization_members(user_id);
create index idx_org_invites_token on public.organization_invites(token);
