import { createClient } from '@/lib/supabase/server'
import PurchaseOrdersManager from '@/components/admin/PurchaseOrdersManager'
import { PurchaseOrder, Supplier, Product } from '@/types'

export const metadata = { title: 'Órdenes de Compra — Admin VOSCO' }

export default async function ComprasPage() {
  const supabase = await createClient()
  const [{ data: orders }, { data: suppliers }, { data: products }] = await Promise.all([
    supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
    supabase.from('suppliers').select('*').eq('active', true).order('name'),
    supabase.from('products').select('*').order('name'),
  ])

  return (
    <PurchaseOrdersManager
      initialOrders={(orders as PurchaseOrder[]) || []}
      suppliers={(suppliers as Supplier[]) || []}
      products={(products as Product[]) || []}
    />
  )
}
