-- ================================================
-- VOSCO Ecommerce — Migration v8
-- Embarques en tránsito (Fase 2 del módulo de Abastecimiento)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

-- items: [{ product_id?, description, quantity, purchase_order_id? }]
create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  code text,
  status text not null default 'en_almacen_china'
    check (status in ('en_almacen_china', 'embarcado', 'en_transito', 'en_aduana', 'recibido', 'cancelado')),
  items jsonb not null default '[]',

  -- Costos (USD)
  flete_almacen_china numeric(12,2),
  flete_maritimo numeric(12,2),
  seguro numeric(12,2),
  aduana numeric(12,2),

  -- Fechas
  fecha_llegada_almacen_china date,
  fecha_embarque date,
  dias_transito_estimado int not null default 90,
  fecha_llegada_estimada date,
  fecha_llegada_real date,

  cbm_total numeric(12,6),
  stock_applied boolean not null default false,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table shipments enable row level security;
create policy "auth_all_shipments" on shipments for all to authenticated using (true) with check (true);

-- RPC para sumar stock al recibir un embarque (espejo de decrement_stock)
create or replace function increment_stock(product_id uuid, qty int)
returns void
language sql
security definer
as $$
  update products
  set stock = stock + qty
  where id = product_id;
$$;

grant execute on function increment_stock(uuid, int) to authenticated;
