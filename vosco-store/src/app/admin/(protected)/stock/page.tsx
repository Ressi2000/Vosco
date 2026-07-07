import { createClient } from '@/lib/supabase/server'
import StockMovementsManager from '@/components/admin/StockMovementsManager'
import { StockMovement, Product } from '@/types'

export const metadata = { title: 'Movimientos de Stock — Admin VOSCO' }

export default async function StockPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams
  const supabase = await createClient()
  const [{ data: movements }, { data: products }] = await Promise.all([
    supabase.from('stock_movements').select('*, product:products(name, codigo_vosco)').order('created_at', { ascending: false }).limit(300),
    supabase.from('products').select('*').order('name'),
  ])

  return (
    <StockMovementsManager
      initialMovements={(movements as StockMovement[]) || []}
      products={(products as Product[]) || []}
      preselectProductId={product}
    />
  )
}
