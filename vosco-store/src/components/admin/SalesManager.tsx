'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Search, ChevronDown, ChevronUp, Printer, Trash2 } from 'lucide-react'
import { Customer, Product, Sale, SaleItem, SaleStatus } from '@/types'
import { createClient } from '@/lib/supabase/client'

const STATUS_LABELS: Record<SaleStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const STATUS_COLORS: Record<SaleStatus, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  completed: 'text-green-400 bg-green-400/10 border-green-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  initialSales: Sale[]
  customers: Customer[]
  products: Product[]
  bcvRate: number
}

function stockFor(products: Product[], productId: string, saleItems: SaleItem[]) {
  const p = products.find(p => p.id === productId)
  const inCart = saleItems.find(i => i.product_id === productId)?.quantity ?? 0
  return Math.max((p?.stock ?? 0) - inCart, 0)
}

export default function SalesManager({ initialSales, customers, products, bcvRate }: Props) {
  const supabase = createClient()
  const [sales, setSales] = useState(initialSales)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Form state
  const [customerQuery, setCustomerQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [productQuery, setProductQuery] = useState('')
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [notes, setNotes] = useState('')
  const [rate, setRate] = useState(String(bcvRate))
  const [saving, setSaving] = useState(false)

  const customerSuggestions = useMemo(() => {
    if (customerQuery.length === 0) return []
    const q = customerQuery.toLowerCase()
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(customerQuery) ||
      (c.id_number || '').includes(customerQuery)
    ).slice(0, 6)
  }, [customers, customerQuery])

  const productSuggestions = useMemo(() => {
    if (productQuery.length === 0) return []
    const q = productQuery.toLowerCase()
    return products
      .filter(p => p.name.toLowerCase().includes(q) && p.active !== false && p.stock > 0)
      .slice(0, 6)
  }, [products, productQuery])

  const totalUsd = saleItems.reduce((sum, i) => sum + i.price_usd * i.quantity, 0)
  const totalBs = totalUsd * parseFloat(rate || '0')

  const addItem = (product: Product) => {
    setSaleItems(items => {
      const existing = items.find(i => i.product_id === product.id)
      if (existing) {
        const newQty = existing.quantity + 1
        if (newQty > product.stock) return items // no superar stock
        return items.map(i => i.product_id === product.id ? { ...i, quantity: newQty } : i)
      }
      if (product.stock < 1) return items
      return [...items, { product_id: product.id, product_name: product.name, quantity: 1, price_usd: product.sale_price ?? product.price }]
    })
    setProductQuery('')
  }

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) { setSaleItems(items => items.filter(i => i.product_id !== id)); return }
    const maxStock = products.find(p => p.id === id)?.stock ?? qty
    setSaleItems(items => items.map(i => i.product_id === id ? { ...i, quantity: Math.min(qty, maxStock) } : i))
  }

  const resetForm = () => {
    setCustomerQuery('')
    setSelectedCustomer(null)
    setNewCustomerName('')
    setNewCustomerPhone('')
    setIsNewCustomer(false)
    setProductQuery('')
    setSaleItems([])
    setNotes('')
    setRate(String(bcvRate))
  }

  const handleSave = async () => {
    setSaving(true)
    let customerId: string | null = null
    let customerName = ''

    if (isNewCustomer && newCustomerName) {
      const { data } = await supabase.from('customers').insert({ name: newCustomerName, phone: newCustomerPhone || null }).select().single()
      if (data) { customerId = (data as Customer).id; customerName = newCustomerName }
    } else if (selectedCustomer) {
      customerId = selectedCustomer.id
      customerName = selectedCustomer.name
    }

    const rateNum = parseFloat(rate) || bcvRate
    const payload = {
      customer_id: customerId,
      customer_name: customerName || null,
      items: saleItems,
      total_usd: totalUsd,
      total_bs: totalUsd * rateNum,
      bcv_rate: rateNum,
      notes: notes || null,
      status: 'pending' as SaleStatus,
    }

    const { data: sale } = await supabase.from('sales').insert(payload).select().single()
    if (sale) {
      await supabase.from('delivery_notes').insert({ sale_id: (sale as Sale).id, customer_id: customerId })
      // Decrement stock and deactivate products that reach 0
      await Promise.all(
        saleItems.map(async item => {
          await supabase.rpc('decrement_stock', { product_id: item.product_id, qty: item.quantity })
          const product = products.find(p => p.id === item.product_id)
          if (product && product.stock - item.quantity <= 0) {
            await supabase.from('products').update({ active: false }).eq('id', item.product_id)
          }
        })
      )
      setSales(ss => [sale as Sale, ...ss])
    }
    setSaving(false)
    setShowForm(false)
    resetForm()
  }

  const updateStatus = async (id: string, status: SaleStatus) => {
    await supabase.from('sales').update({ status }).eq('id', id)
    setSales(ss => ss.map(s => s.id === id ? { ...s, status } : s))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return
    await supabase.from('sales').delete().eq('id', id)
    setSales(ss => ss.filter(s => s.id !== id))
  }

  const filteredSales = sales.filter(s =>
    (s.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search)
  )

  const printDelivery = (sale: Sale) => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Nota de Entrega — VOSCO</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #111; max-width: 600px; margin: 0 auto; }
        h1 { font-size: 28px; letter-spacing: 4px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 12px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { text-align: left; border-bottom: 2px solid #C9A84C; padding: 8px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        td { padding: 8px 4px; border-bottom: 1px solid #eee; font-size: 13px; }
        .total { font-size: 15px; font-weight: bold; margin-top: 16px; }
        .field { margin: 6px 0; font-size: 13px; }
        .label { font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <h1>VOSCO</h1>
      <div class="sub">Nota de Entrega — ${formatDate(sale.created_at)}</div>
      <div class="field"><span class="label">Venta ID:</span> ${sale.id.slice(0, 8).toUpperCase()}</div>
      <div class="field"><span class="label">Cliente:</span> ${sale.customer_name || 'Sin nombre'}</div>
      <table>
        <tr><th>Producto</th><th>Cant.</th><th>Precio USD</th><th>Subtotal</th></tr>
        ${sale.items.map(i => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>$${i.price_usd.toFixed(2)}</td><td>$${(i.price_usd * i.quantity).toFixed(2)}</td></tr>`).join('')}
      </table>
      <div class="total">Total USD: $${sale.total_usd.toFixed(2)}</div>
      <div class="total">Total Bs (${sale.bcv_rate}): Bs ${sale.total_bs.toFixed(2)}</div>
      ${sale.notes ? `<div class="field" style="margin-top:16px"><span class="label">Notas:</span> ${sale.notes}</div>` : ''}
      <div style="margin-top:40px; border-top:1px solid #eee; padding-top:16px; font-size:11px; color:#888;">
        Firma del cliente: _______________________________
      </div>
      <script>window.print()</script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">VENTAS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{sales.length} ventas registradas</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors"
        >
          <Plus size={16} /> Nueva venta
        </button>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente o ID..."
          className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div className="space-y-3">
        {filteredSales.length === 0 && (
          <p className="text-center text-[#6B7680] py-16">No hay ventas registradas.</p>
        )}
        {filteredSales.map(sale => (
          <div key={sale.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{sale.customer_name || 'Sin cliente'}</p>
                  <p className="text-[#6B7680] text-xs">{formatDate(sale.created_at)} · ID {sale.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[sale.status]}`}>
                  {STATUS_LABELS[sale.status]}
                </span>
                <p className="text-[#C9A84C] font-display text-lg">${sale.total_usd.toFixed(2)}</p>
                {expanded === sale.id ? <ChevronUp size={16} className="text-[#6B7680]" /> : <ChevronDown size={16} className="text-[#6B7680]" />}
              </div>
            </div>

            <AnimatePresence>
              {expanded === sale.id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#1E1E1E] px-5 py-4 space-y-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#C9A84C] text-xs uppercase tracking-wider">
                          <th className="text-left pb-2">Producto</th>
                          <th className="text-right pb-2">Cant.</th>
                          <th className="text-right pb-2">P. Unit.</th>
                          <th className="text-right pb-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.map((item, i) => (
                          <tr key={i} className="border-t border-[#1E1E1E]">
                            <td className="py-2 text-white">{item.product_name}</td>
                            <td className="py-2 text-right text-[#B0B8C1]">{item.quantity}</td>
                            <td className="py-2 text-right text-[#B0B8C1]">${item.price_usd.toFixed(2)}</td>
                            <td className="py-2 text-right text-[#C9A84C]">${(item.price_usd * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7680]">Tasa BCV: {sale.bcv_rate}</span>
                      <div className="text-right">
                        <p className="text-white font-bold">Total USD: ${sale.total_usd.toFixed(2)}</p>
                        <p className="text-[#6B7680]">Total Bs: {sale.total_bs.toFixed(2)}</p>
                      </div>
                    </div>
                    {sale.notes && <p className="text-[#6B7680] text-xs">Notas: {sale.notes}</p>}
                    <div className="flex gap-2 flex-wrap">
                      {(['pending', 'completed', 'cancelled'] as SaleStatus[]).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(sale.id, s)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-bold tracking-wider uppercase transition-colors ${sale.status === s ? STATUS_COLORS[s] : 'border-[#1E1E1E] text-[#6B7680] hover:text-white'}`}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                      <button
                        onClick={() => printDelivery(sale)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-[#6B7680] hover:text-white hover:border-[#B0B8C1] transition-colors"
                      >
                        <Printer size={12} /> Nota de entrega
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#1E1E1E] text-red-400 hover:border-red-400 transition-colors ml-auto"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* New sale modal */}
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
                  <h2 className="font-display text-2xl text-white tracking-wider">NUEVA VENTA</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Cliente</p>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setIsNewCustomer(false)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-colors ${!isNewCustomer ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]' : 'border-[#1E1E1E] text-[#6B7680]'}`}
                      >
                        Cliente existente
                      </button>
                      <button
                        onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null) }}
                        className={`flex-1 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-colors ${isNewCustomer ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]' : 'border-[#1E1E1E] text-[#6B7680]'}`}
                      >
                        Cliente nuevo
                      </button>
                    </div>

                    {isNewCustomer ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-1 block">Nombre *</label>
                          <input value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder="Nombre" className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-sm focus:border-[#C9A84C] outline-none" />
                        </div>
                        <div>
                          <label className="text-[#6B7680] text-xs uppercase tracking-wider mb-1 block">Teléfono</label>
                          <input value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} placeholder="04141234567" className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-sm focus:border-[#C9A84C] outline-none" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        {selectedCustomer ? (
                          <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#C9A84C]/40 rounded-lg px-4 py-3">
                            <div>
                              <p className="text-white text-sm font-medium">{selectedCustomer.name}</p>
                              <p className="text-[#6B7680] text-xs">
                                {selectedCustomer.id_number ? `${selectedCustomer.id_type}-${selectedCustomer.id_number}` : ''}
                                {selectedCustomer.id_number && selectedCustomer.phone ? ' · ' : ''}
                                {selectedCustomer.phone || ''}
                              </p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-[#6B7680] hover:text-white"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
                            <input
                              value={customerQuery}
                              onChange={e => setCustomerQuery(e.target.value)}
                              placeholder="Buscar por nombre, cédula, RIF o teléfono..."
                              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none"
                            />
                            {customerSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 right-0 bg-[#111111] border border-[#1E1E1E] rounded-lg mt-1 z-10 overflow-hidden">
                                {customerSuggestions.map(c => (
                                  <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerQuery('') }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1E1E1E] transition-colors">
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-[#6B7680] text-xs">
                                      {c.id_number ? `${c.id_type}-${c.id_number}` : ''}
                                      {c.id_number && c.phone ? ' · ' : ''}
                                      {c.phone || ''}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Productos</p>
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
                      <input
                        value={productQuery}
                        onChange={e => setProductQuery(e.target.value)}
                        placeholder="Buscar producto para agregar..."
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none"
                      />
                      {productSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-[#111111] border border-[#1E1E1E] rounded-lg mt-1 z-10 overflow-hidden">
                          {productSuggestions.map(p => (
                            <button key={p.id} onClick={() => addItem(p)} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1E1E1E] transition-colors flex justify-between items-center gap-4">
                              <span className="flex-1">{p.name}</span>
                              <span className="text-[#6B7680] text-xs whitespace-nowrap">{p.stock} disp.</span>
                              <span className="text-[#C9A84C] whitespace-nowrap">${(p.sale_price ?? p.price).toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {saleItems.length > 0 && (
                      <div className="bg-[#0A0A0A] rounded-lg border border-[#1E1E1E] overflow-hidden">
                        {saleItems.map(item => {
                          const maxStock = products.find(p => p.id === item.product_id)?.stock ?? item.quantity
                          const atMax = item.quantity >= maxStock
                          return (
                          <div key={item.product_id} className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E1E] last:border-0">
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-white text-sm">{item.product_name}</p>
                              <p className={`text-xs mt-0.5 ${atMax ? 'text-orange-400' : 'text-[#6B7680]'}`}>
                                {maxStock} en stock{atMax ? ' — límite alcanzado' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-[#6B7680] text-sm">${item.price_usd.toFixed(2)}</p>
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(item.product_id, item.quantity - 1)} className="w-6 h-6 rounded bg-[#1E1E1E] text-white flex items-center justify-center text-xs hover:bg-[#2E2E2E]">−</button>
                                <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQty(item.product_id, item.quantity + 1)} disabled={atMax} className="w-6 h-6 rounded bg-[#1E1E1E] text-white flex items-center justify-center text-xs hover:bg-[#2E2E2E] disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                              </div>
                              <p className="text-[#C9A84C] text-sm font-bold w-16 text-right">${(item.price_usd * item.quantity).toFixed(2)}</p>
                              <button onClick={() => setSaleItems(items => items.filter(i => i.product_id !== item.product_id))} className="text-[#6B7680] hover:text-red-400 transition-colors"><X size={14} /></button>
                            </div>
                          </div>
                          )
                        })}
                        <div className="px-4 py-3 bg-[#111111] flex justify-between items-center">
                          <div>
                            <label className="text-[#6B7680] text-xs uppercase tracking-wider">Tasa BCV</label>
                            <input type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} className="ml-2 w-24 bg-[#0A0A0A] border border-[#1E1E1E] rounded px-2 py-1 text-white text-xs outline-none focus:border-[#C9A84C]" />
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">Total: ${totalUsd.toFixed(2)}</p>
                            <p className="text-[#6B7680] text-xs">Bs {totalBs.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Notas</label>
                    <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones de la venta..." className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none" />
                  </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button onClick={() => setShowForm(false)} className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || saleItems.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
                  >
                    <Check size={16} />
                    {saving ? 'Registrando...' : `Registrar venta · $${totalUsd.toFixed(2)}`}
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
