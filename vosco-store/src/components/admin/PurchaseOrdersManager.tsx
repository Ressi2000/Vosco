'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Search, ChevronDown, ChevronUp, Trash2, Ship } from 'lucide-react'
import { Supplier, Product, PurchaseOrder, PurchaseOrderItem, PurchaseOrderPayment, PurchaseOrderStatus, Shipment } from '@/types'
import { createClient } from '@/lib/supabase/client'

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  cotizado: 'Cotizado',
  confirmado: 'Confirmado',
  en_produccion: 'En producción',
  listo_almacen_china: 'Listo en almacén China',
  cancelado: 'Cancelado',
}

const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  cotizado: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  confirmado: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  en_produccion: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  listo_almacen_china: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelado: 'text-red-400 bg-red-400/10 border-red-400/30',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS) as PurchaseOrderStatus[]

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
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

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  initialOrders: PurchaseOrder[]
  suppliers: Supplier[]
  products: Product[]
  shipments: Shipment[]
}

const emptyForm = {
  supplierId: '',
  newSupplierName: '',
  isNewSupplier: false,
  code: '',
  status: 'cotizado' as PurchaseOrderStatus,
  items: [] as PurchaseOrderItem[],
  payments: [] as PurchaseOrderPayment[],
  notes: '',
}

export default function PurchaseOrdersManager({ initialOrders, suppliers, products, shipments }: Props) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState(emptyForm)
  const [productQuery, setProductQuery] = useState('')
  const [freeDesc, setFreeDesc] = useState('')
  const [freeQty, setFreeQty] = useState('1')
  const [freePrice, setFreePrice] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState('')

  const productSuggestions = useMemo(() => {
    if (productQuery.length === 0) return []
    const q = productQuery.toLowerCase()
    return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [products, productQuery])

  const totalUsd = form.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const totalPaid = form.payments.reduce((sum, p) => sum + p.amount, 0)
  const saldo = totalUsd - totalPaid

  const addItemFromProduct = (p: Product) => {
    setForm(f => ({ ...f, items: [...f.items, { product_id: p.id, description: p.name, quantity: 1, unit_price: p.precio_fabrica ?? 0 }] }))
    setProductQuery('')
  }

  const addFreeItem = () => {
    if (!freeDesc.trim()) return
    setForm(f => ({ ...f, items: [...f.items, { description: freeDesc.trim(), quantity: parseInt(freeQty) || 1, unit_price: parseFloat(freePrice) || 0 }] }))
    setFreeDesc(''); setFreeQty('1'); setFreePrice('')
  }

  const updateItem = (i: number, field: 'quantity' | 'unit_price', value: number) => {
    setForm(f => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, [field]: value } : it) }))
  }

  const removeItem = (i: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  }

  const addPayment = () => {
    const amount = parseFloat(payAmount)
    if (!amount) return
    setForm(f => ({ ...f, payments: [...f.payments, { amount, paid_at: payDate, method: payMethod || undefined }] }))
    setPayAmount(''); setPayMethod('')
  }

  const removePayment = (i: number) => {
    setForm(f => ({ ...f, payments: f.payments.filter((_, idx) => idx !== i) }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setProductQuery(''); setFreeDesc(''); setFreeQty('1'); setFreePrice('')
    setPayAmount(''); setPayDate(new Date().toISOString().slice(0, 10)); setPayMethod('')
  }

  const openNew = () => { resetForm(); setEditingId(null); setShowForm(true) }

  const openEdit = (o: PurchaseOrder) => {
    setForm({
      supplierId: o.supplier_id || '',
      newSupplierName: '',
      isNewSupplier: false,
      code: o.code || '',
      status: o.status,
      items: o.items,
      payments: o.payments,
      notes: o.notes || '',
    })
    setEditingId(o.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    let supplierId: string | null = form.supplierId || null
    let supplierName = suppliers.find(s => s.id === form.supplierId)?.name || ''

    if (form.isNewSupplier && form.newSupplierName) {
      const { data } = await supabase.from('suppliers').insert({ name: form.newSupplierName }).select().single()
      if (data) { supplierId = (data as Supplier).id; supplierName = form.newSupplierName }
    }

    const existing = editingId ? orders.find(o => o.id === editingId) : null
    const statusHistory = existing
      ? (existing.status === form.status
          ? existing.status_history
          : [...existing.status_history, { status: form.status, at: new Date().toISOString() }])
      : [{ status: form.status, at: new Date().toISOString() }]

    const payload = {
      supplier_id: supplierId,
      supplier_name: supplierName || null,
      code: form.code || null,
      status: form.status,
      currency: 'USD',
      items: form.items,
      payments: form.payments,
      status_history: statusHistory,
      total_usd: totalUsd,
      notes: form.notes || null,
    }

    if (editingId) {
      const { data } = await supabase.from('purchase_orders').update(payload).eq('id', editingId).select().single()
      if (data) setOrders(os => os.map(o => o.id === editingId ? data as PurchaseOrder : o))
    } else {
      const { data } = await supabase.from('purchase_orders').insert(payload).select().single()
      if (data) setOrders(os => [data as PurchaseOrder, ...os])
    }
    setSaving(false)
    setShowForm(false)
    resetForm()
  }

  const updateStatus = async (order: PurchaseOrder, status: PurchaseOrderStatus) => {
    const statusHistory = [...order.status_history, { status, at: new Date().toISOString() }]
    await supabase.from('purchase_orders').update({ status, status_history: statusHistory }).eq('id', order.id)
    setOrders(os => os.map(o => o.id === order.id ? { ...o, status, status_history: statusHistory } : o))
  }

  const shipmentsForOrder = (order: PurchaseOrder) =>
    shipments.filter(s => s.items.some(i => i.purchase_order_id === order.id))

  const shippedQtyFor = (order: PurchaseOrder, item: PurchaseOrderItem) =>
    shipments.reduce((sum, s) => sum + s.items
      .filter(si => si.purchase_order_id === order.id && si.description === item.description)
      .reduce((s2, si) => s2 + si.quantity, 0), 0)

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta orden de compra?')) return
    await supabase.from('purchase_orders').delete().eq('id', id)
    setOrders(os => os.filter(o => o.id !== id))
  }

  const filteredOrders = orders.filter(o =>
    (o.supplier_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.code || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">ÓRDENES DE COMPRA</h1>
          <p className="text-[#6B7680] text-sm mt-1">{orders.length} órdenes registradas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nueva orden
        </button>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por proveedor o código..."
          className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <p className="text-center text-[#6B7680] py-16">No hay órdenes de compra registradas.</p>
        )}
        {filteredOrders.map(order => {
          const paid = order.payments.reduce((s, p) => s + p.amount, 0)
          const pending = order.total_usd - paid
          return (
            <div key={order.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div>
                  <p className="text-white text-sm font-medium">{order.supplier_name || 'Sin proveedor'}</p>
                  <p className="text-[#6B7680] text-xs">
                    {formatDate(order.created_at)} {order.code ? `· ${order.code}` : ''} · ID {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <div className="text-right">
                    <p className="text-[#C9A84C] font-display text-lg">${order.total_usd.toFixed(2)}</p>
                    {pending > 0.001 ? (
                      <p className="text-orange-400 text-xs">Saldo: ${pending.toFixed(2)}</p>
                    ) : (
                      <p className="text-green-400 text-xs">Pagado</p>
                    )}
                  </div>
                  {expanded === order.id ? <ChevronUp size={16} className="text-[#6B7680]" /> : <ChevronDown size={16} className="text-[#6B7680]" />}
                </div>
              </div>

              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-[#1E1E1E] px-5 py-4 space-y-4">
                      {order.items.length > 0 && (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-[#C9A84C] text-xs uppercase tracking-wider">
                              <th className="text-left pb-2">Producto</th>
                              <th className="text-right pb-2">Cant.</th>
                              <th className="text-right pb-2">P. Unit.</th>
                              <th className="text-right pb-2">Subtotal</th>
                              <th className="text-right pb-2">Embarcado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, i) => {
                              const shipped = shippedQtyFor(order, item)
                              const pendingQty = item.quantity - shipped
                              return (
                                <tr key={i} className="border-t border-[#1E1E1E]">
                                  <td className="py-2 text-white">{item.description}</td>
                                  <td className="py-2 text-right text-[#B0B8C1]">{item.quantity}</td>
                                  <td className="py-2 text-right text-[#B0B8C1]">${item.unit_price.toFixed(2)}</td>
                                  <td className="py-2 text-right text-[#C9A84C]">${(item.unit_price * item.quantity).toFixed(2)}</td>
                                  <td className="py-2 text-right text-xs">
                                    {shipped > 0
                                      ? <span className={pendingQty > 0 ? 'text-orange-400' : 'text-green-400'}>{shipped}/{item.quantity}</span>
                                      : <span className="text-[#6B7680]">0/{item.quantity}</span>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      )}

                      {shipmentsForOrder(order).length > 0 && (
                        <div>
                          <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-2 flex items-center gap-1"><Ship size={12} /> Embarques relacionados</p>
                          <div className="flex flex-wrap gap-2">
                            {shipmentsForOrder(order).map(s => (
                              <span key={s.id} className="text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-[#B0B8C1]">
                                {s.code || `Embarque ${s.id.slice(0, 8).toUpperCase()}`} · {SHIPMENT_STATUS_LABELS[s.status] || s.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.payments.length > 0 && (
                        <div>
                          <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-2">Pagos</p>
                          <div className="space-y-1">
                            {order.payments.map((p, i) => (
                              <div key={i} className="flex justify-between text-sm text-[#B0B8C1]">
                                <span>{formatDate(p.paid_at)} {p.method ? `· ${p.method}` : ''}</span>
                                <span className="text-white">${p.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7680]">Pagado: ${paid.toFixed(2)}</span>
                        <div className="text-right">
                          <p className="text-white font-bold">Total: ${order.total_usd.toFixed(2)}</p>
                          <p className={pending > 0.001 ? 'text-orange-400' : 'text-green-400'}>Saldo: ${pending.toFixed(2)}</p>
                        </div>
                      </div>

                      {order.notes && <p className="text-[#6B7680] text-xs">Notas: {order.notes}</p>}

                      {order.status_history.length > 0 && (
                        <div>
                          <p className="text-[#C9A84C] text-xs uppercase tracking-wider mb-2">Historial de estado</p>
                          <div className="space-y-1">
                            {order.status_history.map((h, i) => (
                              <div key={i} className="flex justify-between text-xs text-[#6B7680]">
                                <span>{STATUS_LABELS[h.status]}</span>
                                <span>{formatDateTime(h.at)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {ALL_STATUSES.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order, s)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-bold tracking-wider uppercase transition-colors ${order.status === s ? STATUS_COLORS[s] : 'border-[#1E1E1E] text-[#6B7680] hover:text-white'}`}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                        <button
                          onClick={() => openEdit(order)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-[#B0B8C1] hover:border-[#B0B8C1] transition-colors ml-auto"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-red-400 hover:border-red-400 transition-colors"
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
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
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR ORDEN' : 'NUEVA ORDEN DE COMPRA'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Supplier */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Proveedor</p>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setForm(f => ({ ...f, isNewSupplier: false }))}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-colors ${!form.isNewSupplier ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]' : 'border-[#1E1E1E] text-[#6B7680]'}`}
                      >
                        Existente
                      </button>
                      <button
                        onClick={() => setForm(f => ({ ...f, isNewSupplier: true, supplierId: '' }))}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-colors ${form.isNewSupplier ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]' : 'border-[#1E1E1E] text-[#6B7680]'}`}
                      >
                        Nuevo
                      </button>
                    </div>
                    {form.isNewSupplier ? (
                      <input
                        value={form.newSupplierName}
                        onChange={e => setForm(f => ({ ...f, newSupplierName: e.target.value }))}
                        placeholder="Nombre del proveedor"
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    ) : (
                      <select
                        value={form.supplierId}
                        onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      >
                        <option value="">Seleccionar proveedor</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Código / Referencia</label>
                      <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Estado</label>
                      <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PurchaseOrderStatus }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors">
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Productos</p>
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
                              <span className="text-[#6B7680] text-xs whitespace-nowrap">{p.codigo_vosco || ''}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Free-text item (product not yet in catalog) */}
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      <input value={freeDesc} onChange={e => setFreeDesc(e.target.value)} placeholder="Producto nuevo (aún no está en el catálogo)" className="col-span-3 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <input type="number" value={freeQty} onChange={e => setFreeQty(e.target.value)} placeholder="Cant." className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <input type="number" step="0.01" value={freePrice} onChange={e => setFreePrice(e.target.value)} placeholder="P. Unit." className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <button onClick={addFreeItem} className="bg-[#1E1E1E] text-white rounded-lg text-xs font-bold hover:bg-[#2E2E2E] transition-colors">Agregar</button>
                    </div>

                    {form.items.length > 0 && (
                      <div className="bg-[#0A0A0A] rounded-lg border border-[#1E1E1E] overflow-hidden">
                        {form.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] last:border-0">
                            <p className="flex-1 min-w-0 mr-3 text-white text-sm truncate">{item.description}</p>
                            <div className="flex items-center gap-2">
                              <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 0)} className="w-14 bg-[#111111] border border-[#1E1E1E] rounded px-2 py-1 text-white text-xs text-right outline-none focus:border-[#C9A84C]" />
                              <span className="text-[#6B7680] text-xs">×</span>
                              <input type="number" step="0.01" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', parseFloat(e.target.value) || 0)} className="w-20 bg-[#111111] border border-[#1E1E1E] rounded px-2 py-1 text-white text-xs text-right outline-none focus:border-[#C9A84C]" />
                              <p className="text-[#C9A84C] text-sm font-bold w-16 text-right">${(item.unit_price * item.quantity).toFixed(2)}</p>
                              <button onClick={() => removeItem(i)} className="text-[#6B7680] hover:text-red-400 transition-colors"><X size={14} /></button>
                            </div>
                          </div>
                        ))}
                        <div className="px-4 py-3 bg-[#111111] flex justify-end">
                          <p className="text-white font-bold">Total: ${totalUsd.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payments */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Pagos</p>
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      <input type="number" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="Monto USD" className="col-span-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="col-span-2 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <input value={payMethod} onChange={e => setPayMethod(e.target.value)} placeholder="Método" className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none" />
                      <button onClick={addPayment} className="bg-[#1E1E1E] text-white rounded-lg text-xs font-bold hover:bg-[#2E2E2E] transition-colors">Agregar</button>
                    </div>
                    {form.payments.length > 0 && (
                      <div className="bg-[#0A0A0A] rounded-lg border border-[#1E1E1E] overflow-hidden">
                        {form.payments.map((p, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] last:border-0">
                            <p className="text-[#B0B8C1] text-sm">{formatDate(p.paid_at)} {p.method ? `· ${p.method}` : ''}</p>
                            <div className="flex items-center gap-3">
                              <p className="text-white font-bold">${p.amount.toFixed(2)}</p>
                              <button onClick={() => removePayment(i)} className="text-[#6B7680] hover:text-red-400 transition-colors"><X size={14} /></button>
                            </div>
                          </div>
                        ))}
                        <div className="px-4 py-3 bg-[#111111] flex justify-between">
                          <p className="text-[#6B7680] text-sm">Pagado: ${totalPaid.toFixed(2)}</p>
                          <p className={saldo > 0.001 ? 'text-orange-400 font-bold' : 'text-green-400 font-bold'}>Saldo: ${saldo.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
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
                    disabled={saving || form.items.length === 0 || (!form.supplierId && !form.newSupplierName)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
                  >
                    <Check size={16} />
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : `Crear orden · $${totalUsd.toFixed(2)}`}
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
