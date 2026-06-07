-- ================================================
-- VOSCO Ecommerce — Migration
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

-- Nuevas columnas en products
ALTER TABLE products ADD COLUMN IF NOT EXISTS on_sale boolean default false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price numeric(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at timestamptz;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vehicle_compat jsonb default '[]';

-- Settings (BCV rate, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key text primary key,
  value text not null,
  label text,
  updated_at timestamptz default now()
);
INSERT INTO settings (key, value, label) VALUES
  ('bcv_rate', '36.50', 'Tasa BCV (Bs/$)'),
  ('bcv_date', '2025-06-06', 'Fecha tasa BCV')
ON CONFLICT DO NOTHING;

-- Product lines (administrable)
CREATE TABLE IF NOT EXISTS product_lines (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  slogan text,
  description text,
  color text default '#C9A84C',
  active boolean default true,
  sort_order int default 0
);
INSERT INTO product_lines (name, slug, slogan, description, color, sort_order) VALUES
  ('Luces para Vehículos', 'luces', 'Ilumina tu camino y destaca tu estilo', 'Kits LED, faros, barras y accesorios de iluminación vehicular.', '#C9A84C', 1),
  ('Repuestos para Camiones', 'repuestos', 'La pieza que no puede fallar cuando el trabajo lo exige', 'Repuestos y componentes para flotas y transportistas venezolanos.', '#B0B8C1', 2)
ON CONFLICT DO NOTHING;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  line_slug text not null,
  active boolean default true,
  sort_order int default 0
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_href text,
  line_slug text,
  bg_color text default '#111111',
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text,
  description text,
  active boolean default true,
  sort_order int default 0
);

-- RLS for new tables
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read product_lines" ON product_lines FOR SELECT USING (active = true);
CREATE POLICY "Admin manage product_lines" ON product_lines FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read banners" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Admin manage banners" ON banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (active = true);
CREATE POLICY "Admin manage companies" ON companies FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- MIGRATION v2: Settings adicionales (logo, slogans, redes)
-- =============================================
INSERT INTO settings (key, value, label) VALUES
  ('hero_slogan',    'Ilumina tu camino y destaca tu estilo',         'Eslogan del Hero'),
  ('footer_slogan',  'VOSCO — Fuerza en la ruta, estilo en la calle.','Eslogan del Footer'),
  ('logo_url',       '',                                               'URL del logo (vacío = logo por defecto)'),
  ('whatsapp_number','584141234567',                                   'Número de WhatsApp'),
  ('instagram_url',  'https://instagram.com/vosco',                   'Instagram URL'),
  ('tiktok_url',     '',                                               'TikTok URL'),
  ('facebook_url',   '',                                               'Facebook URL')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- MIGRATION v3: Settings del Hero completo
-- =============================================
INSERT INTO settings (key, value, label) VALUES
  ('hero_badge',       'Venezuela · Iluminación Vehicular',  'Hero — Etiqueta superior'),
  ('hero_cta1_label',  'Ver Luces',                          'Hero — Botón 1 texto'),
  ('hero_cta1_href',   '/luces',                             'Hero — Botón 1 enlace'),
  ('hero_cta2_label',  'Ver Repuestos',                      'Hero — Botón 2 texto'),
  ('hero_cta2_href',   '/repuestos',                         'Hero — Botón 2 enlace'),
  ('hero_stat1_value', '500+',                               'Hero — Stat 1 valor'),
  ('hero_stat1_label', 'Clientes',                           'Hero — Stat 1 etiqueta'),
  ('hero_stat2_value', '2',                                  'Hero — Stat 2 valor'),
  ('hero_stat2_label', 'Líneas',                             'Hero — Stat 2 etiqueta'),
  ('hero_stat3_value', '100%',                               'Hero — Stat 3 valor'),
  ('hero_stat3_label', 'Confianza',                          'Hero — Stat 3 etiqueta')
ON CONFLICT (key) DO NOTHING;
