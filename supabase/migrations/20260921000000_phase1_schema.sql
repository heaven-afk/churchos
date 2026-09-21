-- Veyrin Phase 1 Schema Migration — Phase 1 §7 & §8
-- Core Entities: organizations, profiles, services, service_items, songs, song_sections

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Organizations ─────────────────────────────────────────────────────────────
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  email text not null,
  display_name text not null,
  role text not null default 'OPERATOR' check (role in ('OWNER', 'ADMIN', 'OPERATOR')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Services ──────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  scheduled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index on organization_id for fast organization filtering
create index if not exists idx_services_org_id on public.services(organization_id);
create index if not exists idx_services_scheduled_at on public.services(scheduled_at desc);

-- ─── Service Items ─────────────────────────────────────────────────────────────
create table if not exists public.service_items (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references public.services(id) on delete cascade,
  type text not null check (type in ('song', 'scripture', 'text', 'image', 'video', 'announcement', 'custom')),
  "order" integer not null,
  title text not null,
  content_id text not null,
  content jsonb default '{}'::jsonb,
  notes text,
  is_removed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for deterministic item ordering within services
create index if not exists idx_service_items_service_id on public.service_items(service_id);
create index if not exists idx_service_items_service_order on public.service_items(service_id, "order");

-- ─── Songs ─────────────────────────────────────────────────────────────────────
create table if not exists public.songs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  artist text,
  author text,
  ccli_number text,
  arrangement jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_songs_org_id on public.songs(organization_id);

-- ─── Song Sections ─────────────────────────────────────────────────────────────
create table if not exists public.song_sections (
  id uuid primary key default uuid_generate_v4(),
  song_id uuid not null references public.songs(id) on delete cascade,
  type text not null check (type in ('verse', 'chorus', 'bridge', 'intro', 'outro', 'pre-chorus', 'interlude', 'tag', 'custom')),
  label text not null,
  body text not null,
  "order" integer not null default 0,
  slides jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_song_sections_song_id on public.song_sections(song_id, "order");

-- ─── Row Level Security (RLS) ──────────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_items enable row level security;
alter table public.songs enable row level security;
alter table public.song_sections enable row level security;

-- Profiles: users can read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Services: members of the organization can view and edit services
create policy "Organization members can view services"
  on public.services for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Organization members can insert services"
  on public.services for insert
  with check (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Organization members can update services"
  on public.services for update
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "Organization members can delete services"
  on public.services for delete
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Service Items: members can view/manage items belonging to their services
create policy "Organization members can view service items"
  on public.service_items for select
  using (
    service_id in (
      select id from public.services where organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );

create policy "Organization members can insert service items"
  on public.service_items for insert
  with check (
    service_id in (
      select id from public.services where organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );

create policy "Organization members can update service items"
  on public.service_items for update
  using (
    service_id in (
      select id from public.services where organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );

create policy "Organization members can delete service items"
  on public.service_items for delete
  using (
    service_id in (
      select id from public.services where organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );
