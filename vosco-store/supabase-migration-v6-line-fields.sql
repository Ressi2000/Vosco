-- ================================================
-- VOSCO Ecommerce — Migration v6
-- Campos específicos por línea de producto (luces / repuestos)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

-- Campos comunes a ambas líneas
ALTER TABLE products ADD COLUMN IF NOT EXISTS codigo_vosco text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS codigo_oem text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS largo_cm numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS ancho_cm numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS alto_cm numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS peso_kg numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cbm numeric(12,6);

-- Campos exclusivos de "repuestos"
ALTER TABLE products ADD COLUMN IF NOT EXISTS codigo_original_mitsubishi text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS precio_fabrica numeric(10,2);

-- Campos exclusivos de "luces"
ALTER TABLE products ADD COLUMN IF NOT EXISTS nombre_ingles text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tipo text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bases text;

-- Opciones administrables para los selectores "Marca" (repuestos) y "Tipo" (luces).
-- Reemplaza el rol de "categorías" para estas dos líneas, sin tocar la tabla categories existente.
CREATE TABLE IF NOT EXISTS product_options (
  id uuid default gen_random_uuid() primary key,
  line text not null check (line in ('luces', 'repuestos')),
  field text not null check (field in ('marca', 'tipo')),
  value text not null,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (active = true);
CREATE POLICY "Admin manage product_options" ON product_options FOR ALL USING (auth.role() = 'authenticated');

-- Semilla inicial de marcas de camión (repuestos) y tipos de luces
INSERT INTO product_options (line, field, value, sort_order) VALUES
  ('repuestos', 'marca', 'Mitsubishi Fuso', 1),
  ('repuestos', 'marca', 'Hino', 2),
  ('repuestos', 'marca', 'Isuzu', 3),
  ('repuestos', 'marca', 'Volvo', 4),
  ('repuestos', 'marca', 'Iveco', 5),
  ('repuestos', 'marca', 'Scania', 6),
  ('repuestos', 'marca', 'Freightliner', 7),
  ('repuestos', 'marca', 'International', 8),
  ('luces', 'tipo', 'Kit LED', 1),
  ('luces', 'tipo', 'Barra LED', 2),
  ('luces', 'tipo', 'Faro', 3),
  ('luces', 'tipo', 'Luces de Cortesía', 4),
  ('luces', 'tipo', 'Reflector', 5),
  ('luces', 'tipo', 'Panel', 6),
  ('luces', 'tipo', 'Foco', 7)
ON CONFLICT DO NOTHING;
