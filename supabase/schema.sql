-- =============================================================
-- Envora — Supabase schema. Run this in your Supabase SQL editor.
-- Then, in Storage, create a PUBLIC bucket named `product-images`
-- and run the policies at the bottom of this file.
-- =============================================================

create type app_role as enum ('buyer','supplier','admin');
create type order_status as enum ('pending','confirmed','delivering','delivered','canceled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  phone text,
  location text,
  created_at timestamptz default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  unit text not null default 'unit',
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  location text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  total numeric(12,2) not null,
  delivery_address text not null,
  phone text not null,
  notes text,
  status order_status not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  supplier_id uuid not null references public.profiles(id),
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null,
  name text not null
);

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, email, name, phone, location)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location'
  );
  insert into public.user_roles(user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::app_role, 'buyer'));
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Grants
grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant all on all tables in schema public to service_role;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
create policy "profiles_insert" on public.profiles for insert
  with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id or public.has_role(auth.uid(),'admin'));

create policy "user_roles_select" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "user_roles_admin_all" on public.user_roles for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));
create policy "user_roles_self_insert" on public.user_roles for insert
  with check (auth.uid() = user_id);

create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

create policy "products_public_read" on public.products for select
  using (is_active = true or supplier_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "products_supplier_insert" on public.products for insert
  with check (supplier_id = auth.uid());
create policy "products_supplier_update" on public.products for update
  using (supplier_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "products_supplier_delete" on public.products for delete
  using (supplier_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create policy "orders_select" on public.orders for select
  using (
    buyer_id = auth.uid()
    or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.order_items oi where oi.order_id = orders.id and oi.supplier_id = auth.uid())
  );
create policy "orders_buyer_insert" on public.orders for insert
  with check (buyer_id = auth.uid());
create policy "orders_update" on public.orders for update
  using (
    buyer_id = auth.uid()
    or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.order_items oi where oi.order_id = orders.id and oi.supplier_id = auth.uid())
  );

create policy "order_items_select" on public.order_items for select
  using (
    supplier_id = auth.uid()
    or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );
create policy "order_items_insert" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));

-- Seed categories
insert into public.categories(name, description) values
  ('Cement','Bags of cement'),
  ('Sand','Building sand'),
  ('Blocks','Concrete blocks & bricks'),
  ('Gravel','Aggregate & gravel'),
  ('Iron Rods','Steel reinforcement'),
  ('Tiles','Floor & wall tiles'),
  ('Transport','Material delivery & haulage')
on conflict (name) do nothing;

-- ===== Storage policies (run AFTER creating PUBLIC bucket "product-images") =====
-- create policy "product_images_public_read" on storage.objects for select using (bucket_id = 'product-images');
-- create policy "product_images_auth_insert" on storage.objects for insert with check (bucket_id = 'product-images' and auth.uid() is not null);
-- create policy "product_images_owner_update" on storage.objects for update using (bucket_id = 'product-images' and owner = auth.uid());
-- create policy "product_images_owner_delete" on storage.objects for delete using (bucket_id = 'product-images' and owner = auth.uid());