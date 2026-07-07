import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Supplier, PurchaseOrder, Shipment, PurchaseOrderStatus, ShipmentStatus } from '@/types'

export const metadata = { title: 'Proveedor — Admin VOSCO' }

const PO_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  cotizado: 'Cotizado',
  confirmado: 'Confirmado',
  en_produccion: 'En producción',
  listo_almacen_china: 'Listo en almacén China',
  cancelado: 'Cancelado',
}

const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  en_almacen_china: 'En almacén China',
  embarcado: 'Embarcado',
  en_transito: 'En tránsito',
  en_aduana: 'En aduana',
  recibido: 'Recibido',
  cancelado: 'Cancelado',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: supplier }, { data: orders }, { data: shipments }] = await Promise.all([
    supabase.from('suppliers').select('*').eq('id', id).single(),
    supabase.from('purchase_orders').select('*').eq('supplier_id', id).order('created_at', { ascending: false }),
    supabase.from('shipments').select('*'),
  ])

  if (!supplier) notFound()

  const s = supplier as Supplier
  const po = (orders as PurchaseOrder[]) || []
  const allShipments = (shipments as Shipment[]) || []

  const orderIds = new Set(po.map(o => o.id))
  const relatedShipments = allShipments
    .filter(sh => sh.items.some(i => i.purchase_order_id && orderIds.has(i.purchase_order_id)))
    .filter(sh => sh.status !== 'recibido' && sh.status !== 'cancelado')

  const totalOrdered = po.reduce((sum, o) => sum + o.total_usd, 0)
  const totalPaid = po.reduce((sum, o) => sum + o.payments.reduce((s2, p) => s2 + p.amount, 0), 0)
  const totalPending = totalOrdered - totalPaid

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/proveedores" className="text-[#6B7680] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">{s.name}</h1>
          <p className="text-[#6B7680] text-sm mt-1">
            {[s.country, s.contact_name, s.phone, s.email, s.wechat].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
          <p className="text-[#6B7680] text-xs uppercase tracking-wider mb-1">Órdenes</p>
          <p className="text-white font-display text-2xl">{po.length}</p>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
          <p className="text-[#6B7680] text-xs uppercase tracking-wider mb-1">Total comprado</p>
          <p className="text-[#C9A84C] font-display text-2xl">${totalOrdered.toFixed(2)}</p>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
          <p className="text-[#6B7680] text-xs uppercase tracking-wider mb-1">Pagado</p>
          <p className="text-green-400 font-display text-2xl">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
          <p className="text-[#6B7680] text-xs uppercase tracking-wider mb-1">Saldo pendiente</p>
          <p className={`font-display text-2xl ${totalPending > 0.001 ? 'text-orange-400' : 'text-green-400'}`}>${totalPending.toFixed(2)}</p>
        </div>
      </div>

      {s.payment_terms && (
        <p className="text-[#6B7680] text-sm mb-8">Condiciones de pago: <span className="text-white">{s.payment_terms}</span></p>
      )}

      {/* Active shipments */}
      {relatedShipments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Embarques activos de este proveedor</h2>
          <div className="flex flex-wrap gap-2">
            {relatedShipments.map(sh => (
              <Link
                key={sh.id}
                href="/admin/embarques"
                className="text-xs px-3 py-2 rounded-lg border border-[#1E1E1E] text-[#B0B8C1] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
              >
                {sh.code || `Embarque ${sh.id.slice(0, 8).toUpperCase()}`} · {SHIPMENT_STATUS_LABELS[sh.status]}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      <div>
        <h2 className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Órdenes de compra</h2>
        {po.length === 0 ? (
          <p className="text-[#6B7680] text-sm py-8 text-center bg-[#111111] border border-[#1E1E1E] rounded-xl">
            Este proveedor todavía no tiene órdenes de compra.
          </p>
        ) : (
          <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E1E1E]">
                  <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Orden</th>
                  <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Estado</th>
                  <th className="text-right text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Total</th>
                  <th className="text-right text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Pagado</th>
                  <th className="text-right text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {po.map(o => {
                  const paid = o.payments.reduce((s2, p) => s2 + p.amount, 0)
                  const pending = o.total_usd - paid
                  return (
                    <tr key={o.id} className="border-b border-[#1E1E1E] last:border-0">
                      <td className="px-6 py-4">
                        <p className="text-white text-sm">{o.code || `Orden ${o.id.slice(0, 8).toUpperCase()}`}</p>
                        <p className="text-[#6B7680] text-xs">{formatDate(o.created_at)}</p>
                      </td>
                      <td className="px-6 py-4 text-[#B0B8C1] text-sm">{PO_STATUS_LABELS[o.status]}</td>
                      <td className="px-6 py-4 text-right text-[#C9A84C] text-sm">${o.total_usd.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-green-400 text-sm">${paid.toFixed(2)}</td>
                      <td className={`px-6 py-4 text-right text-sm ${pending > 0.001 ? 'text-orange-400' : 'text-[#6B7680]'}`}>${pending.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Link href="/admin/compras" className="inline-block mt-4 text-[#C9A84C] text-xs font-bold uppercase tracking-wider hover:text-[#F0D98A] transition-colors">
          Ver / editar en Órdenes de Compra →
        </Link>
      </div>
    </div>
  )
}
