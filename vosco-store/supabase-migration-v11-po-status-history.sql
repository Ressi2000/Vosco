-- ================================================
-- VOSCO Ecommerce — Migration v11
-- Trazabilidad de órdenes de compra: historial de cambios de estado.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================

alter table purchase_orders add column if not exists status_history jsonb not null default '[]';
