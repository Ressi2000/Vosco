-- ================================================
-- VOSCO Ecommerce — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

-- Products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10,2) not null,
  price_bs numeric(12,2),
  line text not null check (line in ('luces', 'repuestos')),
  category text not null default '',
  images text[] not null default '{}',
  stock integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  specs jsonb default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Testimonials table
create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  text text not null,
  avatar_url text,
  rating integer not null default 5 check (rating between 1 and 5),
  active boolean default true,
  created_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute function update_updated_at();

-- RLS Policies
alter table public.products enable row level security;
alter table public.testimonials enable row level security;

-- Public can read active products
create policy "Public read products"
  on public.products for select
  using (active = true);

-- Authenticated (admin) can do everything
create policy "Admin full access products"
  on public.products for all
  using (auth.role() = 'authenticated');

create policy "Public read testimonials"
  on public.testimonials for select
  using (active = true);

create policy "Admin full access testimonials"
  on public.testimonials for all
  using (auth.role() = 'authenticated');

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Sample data
insert into public.products (name, slug, description, price, price_bs, line, category, images, stock, featured) values
  ('Kit LED H7 3000K Golden', 'kit-led-h7-3000k-golden', 'Kit de luces LED H7 color golden 3000K. Instalación en 15 minutos, 3x más lumens que halógeno estándar. Compatible con la mayoría de vehículos venezolanos.', 25.00, 900000, 'luces', 'Kits LED', '{}', 15, true),
  ('Barra LED 4x4 52 pulgadas', 'barra-led-4x4-52', 'Barra de luces LED para 4x4, SUV y pickup. 52 pulgadas, 300W, haz combo (spot + flood). Aluminio de aviación. IP68.', 85.00, 3060000, 'luces', 'Barras LED', '{}', 8, true),
  ('Kit Luces de Cortesía LED', 'kit-luces-cortesia-led', 'Kit de luces de cortesía LED para puertas. Luz azul/blanca. Universal, incluye conector. Pack x4.', 12.00, 432000, 'luces', 'Cortesía', '{}', 25, false),
  ('Filtro de Aceite Scania Serie R', 'filtro-aceite-scania-r', 'Filtro de aceite de alta calidad compatible con camiones Scania serie R. Sellado OEM. Duración comprobada en ruta venezolana.', 18.00, 648000, 'repuestos', 'Filtros', '{}', 30, true),
  ('Pastillas de Freno Mercedes Actros', 'pastillas-freno-mercedes-actros', 'Pastillas de freno delanteras para Mercedes-Benz Actros. Material premium, alta resistencia al calor. Par completo.', 45.00, 1620000, 'repuestos', 'Frenos', '{}', 12, true),
  ('Correa de Distribución Iveco Stralis', 'correa-distribucion-iveco-stralis', 'Kit de correa de distribución completo para Iveco Stralis. Incluye tensor y rodillo. OEM compatible.', 65.00, 2340000, 'repuestos', 'Motor', '{}', 6, false);
