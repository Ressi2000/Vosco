-- v5: add id_type / id_number to customers (unique), decrement_stock RPC

alter table customers
  add column if not exists id_type text check (id_type in ('V','E','J')),
  add column if not exists id_number text;

-- Unique constraint: same type+number cannot appear twice (nulls allowed)
create unique index if not exists customers_id_unique
  on customers (id_type, id_number)
  where id_number is not null;

-- RPC to safely decrement stock (floor at 0)
create or replace function decrement_stock(product_id uuid, qty int)
returns void
language sql
security definer
as $$
  update products
  set stock = greatest(stock - qty, 0)
  where id = product_id;
$$;

grant execute on function decrement_stock(uuid, int) to authenticated;
