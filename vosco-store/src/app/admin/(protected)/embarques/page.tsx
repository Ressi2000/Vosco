import { createClient } from '@/lib/supabase/server'
import ShipmentsManager from '@/components/admin/ShipmentsManager'
import { Shipment, PurchaseOrder, Product } from '@/types'

export const metadata = { title: 'Embarques — Admin VOSCO' }

export default async function EmbarquesPage() {
  const supabase = await createClient()
  const [{ data: shipments }, { data: purchaseOrders }, { data: products }] = await Promise.all([
    supabase.from('shipments').select('*').order('created_at', { ascending: false }),
    supabase.from('purchase_orders').select('*').eq('status', 'listo_almacen_china').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('name'),
  ])

  return (
    <ShipmentsManager
      initialShipments={(shipments as Shipment[]) || []}
      purchaseOrders={(purchaseOrders as PurchaseOrder[]) || []}
      products={(products as Product[]) || []}
    />
  )
}
