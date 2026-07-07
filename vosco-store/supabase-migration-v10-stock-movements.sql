-- ================================================
-- VOSCO Ecommerce — Migration v10
-- Bitácora de stock: cada cambio de inventario queda registrado con
-- motivo y referencia, en vez de ser solo un número que se sobreescribe.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  delta integer not null, -- positivo = entrada, negativo = salida
  reason text not null check (reason in ('venta', 'embarque_recibido', 'ajuste_manual', 'devolucion')),
  reference_id uuid, -- sale_id o shipment_id, según el motivo
  notes text,
  created_at timestamptz default now()
);

alter table stock_movements enable row level security;
create policy "auth_all_stock_movements" on stock_movements for all to authenticated using (true) with check (true);

create index if not exists stock_movements_product_idx on stock_movements (product_id, created_at desc);

-- Reemplaza las funciones v5/v8: ahora además registran el movimiento.
-- Se elimina la firma anterior (2 parámetros) para evitar ambigüedad de
-- sobrecarga con la nueva firma (parámetros con default).
drop function if exists decrement_stock(uuid, int);
drop function if exists increment_stock(uuid, int);

create or replace function decrement_stock(
  product_id uuid, qty int,
  reason text default 'venta', reference_id uuid default null, notes text default null
)
returns void
language plpgsql
security definer
as $$
begin
  update products set stock = greatest(stock - qty, 0) where id = decrement_stock.product_id;
  insert into stock_movements (product_id, delta, reason, reference_id, notes)
  values (decrement_stock.product_id, -qty, decrement_stock.reason, decrement_stock.reference_id, decrement_stock.notes);
end;
$$;

create or replace function increment_stock(
  product_id uuid, qty int,
  reason text default 'embarque_recibido', reference_id uuid default null, notes text default null
)
returns void
language plpgsql
security definer
as $$
begin
  update products set stock = stock + qty where id = increment_stock.product_id;
  insert into stock_movements (product_id, delta, reason, reference_id, notes)
  values (increment_stock.product_id, qty, increment_stock.reason, increment_stock.reference_id, increment_stock.notes);
end;
$$;

grant execute on function decrement_stock(uuid, int, text, uuid, text) to authenticated;
grant execute on function increment_stock(uuid, int, text, uuid, text) to authenticated;
