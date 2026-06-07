-- v4: customers, sales, sale_items, delivery_notes

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  customer_name text,
  items jsonb not null default '[]',
  total_usd numeric(12,2) not null default 0,
  total_bs numeric(14,2) not null default 0,
  bcv_rate numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

create table if not exists delivery_notes (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','delivered')),
  notes text,
  created_at timestamptz default now(),
  delivered_at timestamptz
);

-- Enable RLS
alter table customers enable row level security;
alter table sales enable row level security;
alter table delivery_notes enable row level security;

-- Allow authenticated users full access (admin only)
create policy "auth_all_customers" on customers for all to authenticated using (true) with check (true);
create policy "auth_all_sales" on sales for all to authenticated using (true) with check (true);
create policy "auth_all_delivery_notes" on delivery_notes for all to authenticated using (true) with check (true);
