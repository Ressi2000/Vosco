'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Search, ChevronDown, ChevronUp, Trash2, PackageCheck } from 'lucide-react'
import { Product, PurchaseOrder, Shipment, ShipmentItem, ShipmentStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  en_almacen_china: 'En almacén China',
  embarcado: 'Embarcado',
  en_transito: 'En tránsito',
  en_aduana: 'En aduana',
  recibido: 'Recibido en almacén Vosco',
  cancelado: 'Cancelado',
}

const STATUS_COLORS: Record<ShipmentStatus, string> = {
  en_almacen_china: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  embarcado: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  en_transito: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  en_aduana: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  recibido: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelado: 'text-red-400 bg-red-400/10 border-red-400/30',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS) as ShipmentStatus[]

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

interface Props {
  initialShipments: Shipment[]
  purchaseOrders: PurchaseOrder[] // solo las que están 'listo_almacen_china'
  products: Product[]
}

const emptyForm = {
  code: '',
  status: 'en_almacen_china' as ShipmentStatus,
  items: [] as ShipmentItem[],
  flete_almacen_china: '',
  flete_maritimo: '',
  seguro: '',
  aduana: '',
  fecha_llegada_almacen_china: '',
  fecha_embarque: '',
  dias_transito_estimado: '90',
  fecha_llegada_real: '',
  cbm_total: '',
  notes: '',
}

export default function ShipmentsManager({ initialShipments, purchaseOrders, products }: Props) {
  const supabase = createClient()
  const [shipments, setShipments] = useState(initialShipments)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [cbmTouched, setCbmTouched] = useState(false)

  const [form, setForm] = useState(emptyForm)
  const [productQuery, setProductQuery] = useState('')
  const [freeDesc, setFreeDesc] = useState('')
  const [freeQty, setFreeQty] = useState('1')
  const [todayMs] = useState(() => Date.now())

  const productSuggestions = useMemo(() => {
    if (productQuery.length === 0) return []
    const q = productQuery.toLowerCase()
    return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [products, productQuery])

  const autoCbm = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const p = item.product_id ? products.find(pr => pr.id === item.product_id) : undefined
      return sum + (p?.cbm ? p.cbm * item.quantity : 0)
    }, 0)
  }, [form.items, products])

  const fechaEstimada = form.fecha_embarque && form.dias_transito_estimado
    ? addDays(form.fecha_embarque, parseInt(form.dias_transito_estimado) || 90)
    : ''

  const totalCostos = (parseFloat(form.flete_almacen_china) || 0)
    + (parseFloat(form.flete_maritimo) || 0)
    + (parseFloat(form.seguro) || 0)
    + (parseFloat(form.aduana) || 0)

  const addItemFromProduct = (p: Product) => {
    setForm(f => ({ ...f, items: [...f.items, { product_id: p.id, description: p.name, quantity: 1 }] }))
    setProductQuery('')
  }

  const addItemsFromOrder = (po: PurchaseOrder) => {
    setForm(f => ({
      ...f,
      items: [
        ...f.items,
        ...po.items.map(i => ({ product_id: i.product_id, description: i.description, quantity: i.quantity, purchase_order_id: po.id })),
      ],
    }))
  }

  const addFreeItem = () => {
    if (!freeDesc.trim()) return
    setForm(f => ({ ...f, items: [...f.items, { description: freeDesc.trim(), quantity: parseInt(freeQty) || 1 }] }))
    setFreeDesc(''); setFreeQty('1')
  }

  const updateItemQty = (i: number, qty: number) => {
    setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, quantity: qty } : it) }))
  }

  const removeItem = (i: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setProductQuery(''); setFreeDesc(''); setFreeQty('1')
    setCbmTouched(false)
  }

  const openNew = () => { resetForm(); setEditingId(null); setShowForm(true) }

  const openEdit = (s: Shipment) => {
    setForm({
      code: s.code || '',
      status: s.status,
      items: s.items,
      flete_almacen_china: String(s.flete_almacen_china ?? ''),
      flete_maritimo: String(s.flete_maritimo ?? ''),
      seguro: String(s.seguro ?? ''),
      aduana: String(s.aduana ?? ''),
      fecha_llegada_almacen_china: s.fecha_llegada_almacen_china || '',
      fecha_embarque: s.fecha_embarque || '',
      dias_transito_estimado: String(s.dias_transito_estimado ?? 90),
      fecha_llegada_real: s.fecha_llegada_real || '',
      cbm_total: String(s.cbm_total ?? ''),
      notes: s.notes || '',
    })
    setCbmTouched(true) // respetar el valor guardado en vez de recalcular
    setEditingId(s.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      code: form.code || null,
      status: form.status,
      items: form.items,
      flete_almacen_china: form.flete_almacen_china ? parseFloat(form.flete_almacen_china) : null,
      flete_maritimo: form.flete_maritimo ? parseFloat(form.flete_maritimo) : null,
      seguro: form.seguro ? parseFloat(form.seguro) : null,
      aduana: form.aduana ? parseFloat(form.aduana) : null,
      fecha_llegada_almacen_china: form.fecha_llegada_almacen_china || null,
      fecha_embarque: form.fecha_embarque || null,
      dias_transito_estimado: parseInt(form.dias_transito_estimado) || 90,
      fecha_llegada_estimada: fechaEstimada || null,
      fecha_llegada_real: form.fecha_llegada_real || null,
      cbm_total: cbmTouched ? (parseFloat(form.cbm_total) || null) : (autoCbm || null),
      notes: form.notes || null,
    }

    if (editingId) {
      const { data } = await supabase.from('shipments').update(payload).eq('id', editingId).select().single()
      if (data) setShipments(ss => ss.map(s => s.id === editingId ? data as Shipment : s))
    } else {
      const { data } = await supabase.from('shipments').insert(payload).select().single()
      if (data) setShipments(ss => [data as Shipment, ...ss])
    }
    setSaving(false)
    setShowForm(false)
    resetForm()
  }

  const updateStatus = async (shipment: Shipment, status: ShipmentStatus) => {
    const patch: Record<string, unknown> = { status }
    if (status === 'recibido' && !shipment.stock_applied) {
      await Promise.all(
        shipment.items
          .filter((i): i is ShipmentItem & { product_id: string } => !!i.product_id)
          .map(i => supabase.rpc('increment_stock', { product_id: i.product_id, qty: i.quantity }))
      )
      patch.stock_applied = true
      if (!shipment.fecha_llegada_real) patch.fecha_llegada_real = new Date().toISOString().slice(0, 10)
    }
    await supabase.from('shipments').update(patch).eq('id', shipment.id)
    setShipments(ss => ss.map(s => s.id === shipment.id ? { ...s, ...patch } as Shipment : s))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este embarque?')) return
    await supabase.from('shipments').delete().eq('id', id)
    setShipments(ss => ss.filter(s => s.id !== id))
  }

  const filteredShipments = shipments.filter(s =>
    (s.code || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">EMBARQUES</h1>
          <p className="text-[#6B7680] text-sm mt-1">{shipments.length} embarques registrados</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nuevo embarque
        </button>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por código..."
          className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div className="space-y-3">
        {filteredShipments.length === 0 && (
          <p className="text-center text-[#6B7680] py-16">No hay embarques registrados.</p>
        )}
        {filteredShipments.map(shipment => {
          const itemCount = shipment.items.reduce((s, i) => s + i.quantity, 0)
          const daysToArrival = shipment.fecha_llegada_estimada
            ? Math.ceil((new Date(shipment.fecha_llegada_estimada + 'T00:00:00').getTime() - todayMs) / 86400000)
            : null
          return (
            <div key={shipment.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === shipment.id ? null : shipment.id)}
              >
                <div>
                  <p className="text-white text-sm font-medium">{shipment.code || `Embarque ${shipment.id.slice(0, 8).toUpperCase()}`}</p>
                  <p className="text-[#6B7680] text-xs">
                    {itemCount} unidades{shipment.cbm_total ? ` · ${shipment.cbm_total.toFixed(3)} m³` : ''}
                    {shipment.fecha_llegada_estimada && shipment.status !== 'recibido' && shipment.status !== 'cancelado'
                      ? ` · Llega ${formatDate(shipment.fecha_llegada_estimada)}${daysToArrival !== null ? ` (${daysToArrival >= 0 ? `en ${daysToArrival}d` : `${Math.abs(daysToArrival)}d de retraso`})` : ''}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[shipment.status]}`}>
                    {STATUS_LABELS[shipment.status]}
                  </span>
                  {expanded === shipment.id ? <ChevronUp size={16} className="text-[#6B7680]" /> : <ChevronDown size={16} className="text-[#6B7680]" />}
                </div>
              </div>

              <AnimatePresence>
                {expanded === shipment.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-[#1E1E1E] px-5 py-4 space-y-4">
                      {shipment.items.length > 0 && (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-[#C9A84C] text-xs uppercase tracking-wider">
                              <th className="text-left pb-2">Producto</th>
                              <th className="text-right pb-2">Cant.</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shipment.items.map((item, i) => (
                              <tr key={i} className="border-t border-[#1E1E1E]">
                                <td className="py-2 text-white">{item.description}</td>
                                <td className="py-2 text-right text-[#B0B8C1]">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div><span className="text-[#6B7680]">Llegada almacén China:</span> <span className="text-white">{formatDate(shipment.fecha_llegada_almacen_china)}</span></div>
                        <div><span className="text-[#6B7680]">Salida embarque:</span> <span className="text-white">{formatDate(shipment.fecha_embarque)}</span></div>
                        <div><span className="text-[#6B7680]">Llegada estimada:</span> <span className="text-white">{formatDate(shipment.fecha_llegada_estimada)}</span></div>
                        <div><span className="text-[#6B7680]">Llegada real:</span> <span className="text-white">{formatDate(shipment.fecha_llegada_real)}</span></div>
                        <div><span className="text-[#6B7680]">CBM total:</span> <span className="text-white">{shipment.cbm_total?.toFixed(3) ?? '—'} m³</span></div>
                        <div><span className="text-[#6B7680]">Costo total:</span> <span className="text-white">${((shipment.flete_almacen_china || 0) + (shipment.flete_maritimo || 0) + (shipment.seguro || 0) + (shipment.aduana || 0)).toFixed(2)}</span></div>
                      </div>

                      {shipment.notes && <p className="text-[#6B7680] text-xs">Notas: {shipment.notes}</p>}

                      <div className="flex gap-2 flex-wrap">
                        {ALL_STATUSES.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(shipment, s)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-bold tracking-wider uppercase transition-colors ${shipment.status === s ? STATUS_COLORS[s] : 'border-[#1E1E1E] text-[#6B7680] hover:text-white'}`}
                          >
                            {s === 'recibido' && <PackageCheck size={12} className="inline mr-1 -mt-0.5" />}
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                        <button
                          onClick={() => openEdit(shipment)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-[#B0B8C1] hover:border-[#B0B8C1] transition-colors ml-auto"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(shipment.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-red-400 hover:border-red-400 transition-colors"
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                      {shipment.status === 'recibido' && shipment.stock_applied && (
                        <p className="text-green-400 text-xs flex items-center gap-1"><PackageCheck size={12} /> Stock actualizado automáticamente al recibir este embarque.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR EMBARQUE' : 'NUEVO EMBARQUE'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Código / Contenedor / BL</label>
                      <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Estado</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ShipmentStatus }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors">
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Import from purchase orders */}
                  {purchaseOrders.length > 0 && (
                    <div>
                      <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Órdenes de compra listas en almacén China</p>
                      <div className="flex flex-wrap gap-2">
                        {purchaseOrders.map(po => (
                          <button
                            key={po.id}
                            onClick={() => addItemsFromOrder(po)}
                            className="text-xs px-3 py-2 rounded-lg border border-[#1E1E1E] text-[#B0B8C1] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                          >
                            + {po.supplier_name || 'Proveedor'} {po.code ? `(${po.code})` : ''} · {po.items.length} ítems
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Productos en el embarque</p>
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
                      <input
                        value={productQuery}
                        onChange={e => setProductQuery(e.target.value)}
                        placeholder="Buscar producto del catálogo para agregar..."
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none"
                      />
                      {productSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-[#111111] border border-[#1E1E1E] rounded-lg mt-1 z-10 overflow-hidden">
                          {productSuggestions.map(p => (
                            <button key={p.id} onClick={() => addItemFromProduct(p)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1E1E1E] transition-colors flex justify-between items-center gap-4">
                              <span className="flex-1">{p.name}</span>
                              <span className="text-[#6B7680] text-xs whitespace-nowrap">{p.cbm ? `${p.cbm.toFixed(4)} m³/u` : 'sin CBM'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-3">
                      <input value={freeDesc} onChange={e => setFreeDesc(e.target.value)} placeholder="Producto nuevo (aún no está en el catálogo)" className="col-span-4 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <input type="number" value={freeQty} onChange={e => setFreeQty(e.target.value)} placeholder="Cant." className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <button onClick={addFreeItem} className="bg-[#1E1E1E] text-white rounded-lg text-xs font-bold hover:bg-[#2E2E2E] transition-colors">Agregar</button>
                    </div>

                    {form.items.length > 0 && (
                      <div className="bg-[#0A0A0A] rounded-lg border border-[#1E1E1E] overflow-hidden">
                        {form.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] last:border-0">
                            <p className="flex-1 min-w-0 mr-3 text-white text-sm truncate">{item.description}</p>
                            <div className="flex items-center gap-2">
                              <input type="number" value={item.quantity} onChange={e => updateItemQty(i, parseInt(e.target.value) || 0)} className="w-16 bg-[#111111] border border-[#1E1E1E] rounded px-2 py-1 text-white text-xs text-right outline-none focus:border-[#C9A84C]" />
                              <button onClick={() => removeItem(i)} className="text-[#6B7680] hover:text-red-400 transition-colors"><X size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fechas */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Fechas</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Llegada a almacén China</label>
                        <input type="date" value={form.fecha_llegada_almacen_china} onChange={e => setForm(f => ({ ...f, fecha_llegada_almacen_china: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Salida del embarque</label>
                        <input type="date" value={form.fecha_embarque} onChange={e => setForm(f => ({ ...f, fecha_embarque: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Días de tránsito estimados</label>
                        <input type="number" value={form.dias_transito_estimado} onChange={e => setForm(f => ({ ...f, dias_transito_estimado: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Llegada real</label>
                        <input type="date" value={form.fecha_llegada_real} onChange={e => setForm(f => ({ ...f, fecha_llegada_real: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                    </div>
                    <p className="text-[#6B7680] text-xs mt-2">
                      Llegada estimada calculada: <span className="text-white">{fechaEstimada ? formatDate(fechaEstimada) : '—'}</span>
                    </p>
                  </div>

                  {/* Costos */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Costos (USD)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Flete hasta almacén China</label>
                        <input type="number" step="0.01" value={form.flete_almacen_china} onChange={e => setForm(f => ({ ...f, flete_almacen_china: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Flete marítimo</label>
                        <input type="number" step="0.01" value={form.flete_maritimo} onChange={e => setForm(f => ({ ...f, flete_maritimo: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Seguro</label>
                        <input type="number" step="0.01" value={form.seguro} onChange={e => setForm(f => ({ ...f, seguro: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-2 block">Aduana / nacionalización</label>
                        <input type="number" step="0.01" value={form.aduana} onChange={e => setForm(f => ({ ...f, aduana: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      </div>
                    </div>
                    <p className="text-[#6B7680] text-xs mt-2">Costo total: <span className="text-white">${totalCostos.toFixed(2)}</span></p>
                  </div>

                  {/* CBM */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">CBM total (m³)</label>
                    <input
                      type="number" step="0.001"
                      value={cbmTouched ? form.cbm_total : autoCbm.toFixed(3)}
                      onChange={e => { setCbmTouched(true); setForm(f => ({ ...f, cbm_total: e.target.value })) }}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                    <p className="text-[#6B7680] text-xs mt-1">Sugerido según CBM cargado por producto: {autoCbm.toFixed(3)} m³. Editable si hay productos sin CBM o el dato real difiere.</p>
                  </div>

                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Notas</label>
                    <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none" />
                  </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button onClick={() => setShowForm(false)} className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || form.items.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
                  >
                    <Check size={16} />
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear embarque'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
