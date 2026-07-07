-- ================================================
-- VOSCO Ecommerce — Migration v9
-- Eliminar la sección "Líneas de Producto" del admin (solo eran 2 líneas
-- fijas, sin necesidad de tabla administrable). Sus eslóganes pasan a
-- vivir en "settings", junto al resto de textos editables de la web.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

INSERT INTO settings (key, value, label) VALUES
  ('luces_slogan', 'Ilumina tu camino y destaca tu estilo', 'Eslogan — página Luces'),
  ('repuestos_slogan', 'La pieza que no puede fallar cuando el trabajo lo exige', 'Eslogan — página Repuestos')
ON CONFLICT (key) DO NOTHING;

-- Si ya tenías eslóganes personalizados en product_lines, copialos a mano
-- a estos dos settings antes de continuar. Luego podés eliminar la tabla:
-- drop table if exists product_lines;
