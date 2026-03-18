-- ============================================================
-- Fix: infinite recursion in RLS policies
-- All admin checks that query public.users inside a policy
-- caused recursion because users itself has RLS enabled.
-- Solution: security definer function that bypasses RLS.
-- ============================================================

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- USERS policies
drop policy if exists "Admins can read all users" on public.users;
drop policy if exists "Admins can insert users" on public.users;
drop policy if exists "Admins can update users" on public.users;

create policy "Admins can read all users"
  on public.users for select
  using (public.is_admin());

create policy "Admins can insert users"
  on public.users for insert
  with check (public.is_admin());

create policy "Admins can update users"
  on public.users for update
  using (public.is_admin());

-- USERS_ADMIN_DATA policies
drop policy if exists "Admins can manage admin data" on public.users_admin_data;

create policy "Admins can manage admin data"
  on public.users_admin_data for all
  using (public.is_admin());

-- POSTS policies
drop policy if exists "Admins can manage posts" on public.posts;

create policy "Admins can manage posts"
  on public.posts for all
  using (public.is_admin());

-- CATEGORIES policies
drop policy if exists "Admins can manage categories" on public.categories;

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- PRODUCTS policies
drop policy if exists "Admins can manage products" on public.products;

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());
