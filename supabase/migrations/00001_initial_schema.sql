-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMs
-- ============================================================
create type public.user_role as enum ('socio', 'admin');

-- ============================================================
-- USERS table (linked to auth.users via id)
-- ============================================================
create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  nombre_apellido text not null default '',
  dni             text,
  numero_socio    text unique,
  telefono        text,
  fecha_ingreso   date,
  estado          text not null default 'pendiente',
  activo          boolean not null default true,
  role            public.user_role not null default 'socio',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- USERS_ADMIN_DATA table (admin-only metadata)
-- ============================================================
create table public.users_admin_data (
  id                          uuid primary key default uuid_generate_v4(),
  user_id                     uuid unique not null references public.users(id) on delete cascade,
  notas                       text,
  numero_tramite              text,
  diagnostico                 text,
  codigo_vinculacion          text,
  fecha_vinculacion           date,
  medico                      text,
  cuerpo_mail                 text,
  envio_mail_baja             boolean not null default false,
  envio_mail_aprobacion       boolean not null default false,
  envio_documentacion_amparo  boolean not null default false,
  ddjj_cib                    boolean not null default false,
  observaciones               text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ============================================================
-- POSTS table
-- ============================================================
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  titulo      text not null,
  contenido   text not null,
  fotos       text[] default '{}',
  video_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- POST_READS table (tracks "Nuevo" label per user)
-- ============================================================
create table public.post_reads (
  user_id   uuid not null references public.users(id) on delete cascade,
  post_id   uuid not null references public.posts(id) on delete cascade,
  read_at   timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- ============================================================
-- CATEGORIES table
-- ============================================================
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  nombre      text not null,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS table
-- ============================================================
create table public.products (
  id            uuid primary key default uuid_generate_v4(),
  nombre        text not null,
  descripcion   text,
  fotos         text[] default '{}',
  category_id   uuid not null references public.categories(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_users_activo on public.users(activo);
create index idx_users_role on public.users(role);
create index idx_users_numero_socio on public.users(numero_socio);
create index idx_users_admin_data_user_id on public.users_admin_data(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_post_reads_user_id on public.post_reads(user_id);
create index idx_products_category_id on public.products(category_id);
create index idx_categories_orden on public.categories(orden);

-- ============================================================
-- UPDATED_AT trigger function
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.users_admin_data
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.posts
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.users_admin_data enable row level security;
alter table public.posts enable row level security;
alter table public.post_reads enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- USERS policies
create policy "Users can read their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can read all users"
  on public.users for select
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "Admins can insert users"
  on public.users for insert
  with check (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "Admins can update users"
  on public.users for update
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- USERS_ADMIN_DATA policies (admin only)
create policy "Admins can manage admin data"
  on public.users_admin_data for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- POSTS policies
create policy "Authenticated users can read posts"
  on public.posts for select
  using (auth.uid() is not null);

create policy "Admins can manage posts"
  on public.posts for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- POST_READS policies
create policy "Users can read their own post_reads"
  on public.post_reads for select
  using (auth.uid() = user_id);

create policy "Users can insert their own post_reads"
  on public.post_reads for insert
  with check (auth.uid() = user_id);

-- CATEGORIES policies
create policy "Authenticated users can read categories"
  on public.categories for select
  using (auth.uid() is not null);

create policy "Admins can manage categories"
  on public.categories for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- PRODUCTS policies
create policy "Authenticated users can read products"
  on public.products for select
  using (auth.uid() is not null);

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- ============================================================
-- Auto-create user profile on auth signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nombre_apellido)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre_apellido', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
