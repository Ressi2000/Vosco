-- ================================================
-- VOSCO Ecommerce — Migration v7
-- Proveedores y Órdenes de Compra (Fase 1 del módulo de Abastecimiento)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  contact_name text,
  phone text,
  email text,
  wechat text,
  payment_terms text,
  notes text,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- items: [{ product_id?, description, quantity, unit_price }]
-- payments: [{ amount, paid_at, method?, notes? }]
create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_name text,
  code text,
  status text not null default 'cotizado'
    check (status in ('cotizado', 'confirmado', 'en_produccion', 'listo_almacen_china', 'cancelado')),
  currency text not null default 'USD',
  items jsonb not null default '[]',
  payments jsonb not null default '[]',
  total_usd numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table suppliers enable row level security;
alter table purchase_orders enable row level security;

create policy "auth_all_suppliers" on suppliers for all to authenticated using (true) with check (true);
create policy "auth_all_purchase_orders" on purchase_orders for all to authenticated using (true) with check (true);
