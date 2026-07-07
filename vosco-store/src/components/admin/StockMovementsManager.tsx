'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowUpCircle, ArrowDownCircle, PackagePlus } from 'lucide-react'
import { Product, StockMovement, StockMovementReason } from '@/types'
import { createClient } from '@/lib/supabase/client'

const REASON_LABELS: Record<StockMovementReason, string> = {
  venta: 'Venta',
  embarque_recibido: 'Embarque recibido',
  ajuste_manual: 'Ajuste manual',
  devolucion: 'Devolución',
}

const REASON_COLORS: Record<StockMovementReason, string> = {
  venta: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  embarque_recibido: 'text-green-400 bg-green-400/10 border-green-400/30',
  ajuste_manual: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  devolucion: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

interface Props {
  initialMovements: StockMovement[]
  products: Product[]
  preselectProductId?: string
}

export default function StockMovementsManager({ initialMovements, products, preselectProductId }: Props) {
  const supabase = createClient()
  const [movements, setMovements] = useState(initialMovements)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const [productQuery, setProductQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    () => products.find(p => p.id === preselectProductId) || null
  )
  const [direction, setDirection] = useState<'entrada' | 'salida'>('entrada')
  const [qty, setQty] = useState('')
  const [reason, setReason] = useState<'ajuste_manual' | 'devolucion'>('ajuste_manual')
  const [notes, setNotes] = useState('')

  const productSuggestions = useMemo(() => {
    if (productQuery.length === 0) return []
    const q = productQuery.toLowerCase()
    return products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6)
  }, [products, productQuery])

  const filteredMovements = movements.filter(m =>
    (m.product?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAdjust = async () => {
    const amount = parseInt(qty)
    if (!selectedProduct || !amount || amount <= 0) return
    setSaving(true)

    if (direction === 'entrada') {
      await supabase.rpc('increment_stock', { product_id: selectedProduct.id, qty: amount, reason, notes: notes || null })
    } else {
      await supabase.rpc('decrement_stock', { product_id: selectedProduct.id, qty: amount, reason, notes: notes || null })
    }

    const { data: latest } = await supabase
      .from('stock_movements')
      .select('*, product:products(name, codigo_vosco)')
      .eq('product_id', selectedProduct.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (latest) setMovements(ms => [latest as StockMovement, ...ms])

    setSelectedProduct(sp => sp ? { ...sp, stock: direction === 'entrada' ? sp.stock + amount : Math.max(sp.stock - amount, 0) } : sp)
    setQty(''); setNotes('')
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white tracking-wider">MOVIMIENTOS DE STOCK</h1>
        <p className="text-[#6B7680] text-sm mt-1">Historial completo de entradas y salidas de inventario</p>
      </div>

      {/* Ajuste manual */}
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 mb-8">
        <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
          <PackagePlus size={14} /> Ajuste manual de stock
        </p>

        <div className="relative mb-3">
          {selectedProduct ? (
            <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#C9A84C]/40 rounded-lg px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">{selectedProduct.name}</p>
                <p className="text-[#6B7680] text-xs">Stock actual: {selectedProduct.stock}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-[#6B7680] hover:text-white"><X size={14} /></button>
            </div>
          ) : (
            <>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
              <input
                value={productQuery}
                onChange={e => setProductQuery(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none"
              />
              {productSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-[#111111] border border-[#1E1E1E] rounded-lg mt-1 z-10 overflow-hidden">
                  {productSuggestions.map(p => (
                    <button key={p.id} onClick={() => { setSelectedProduct(p); setProductQuery('') }} className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1E1E1E] transition-colors flex justify-between items-center gap-4">
                      <span className="flex-1">{p.name}</span>
                      <span className="text-[#6B7680] text-xs whitespace-nowrap">{p.stock} en stock</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
          <div className="flex rounded-lg border border-[#1E1E1E] overflow-hidden col-span-2 sm:col-span-1">
            <button
              onClick={() => setDirection('entrada')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-bold uppercase transition-colors ${direction === 'entrada' ? 'bg-green-400/20 text-green-400' : 'text-[#6B7680]'}`}
            >
              <ArrowUpCircle size={12} /> Entrada
            </button>
            <button
              onClick={() => setDirection('salida')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-bold uppercase transition-colors ${direction === 'salida' ? 'bg-red-400/20 text-red-400' : 'text-[#6B7680]'}`}
            >
              <ArrowDownCircle size={12} /> Salida
            </button>
          </div>
          <input type="number" min={1} value={qty} onChange={e => setQty(e.target.value)} placeholder="Cantidad" className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none" />
          <select value={reason} onChange={e => setReason(e.target.value as 'ajuste_manual' | 'devolucion')} className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none">
            <option value="ajuste_manual">Ajuste manual</option>
            <option value="devolucion">Devolución</option>
          </select>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Motivo / notas" className="col-span-2 sm:col-span-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none" />
          <button
            onClick={handleAdjust}
            disabled={saving || !selectedProduct || !qty}
            className="bg-[#C9A84C] text-black rounded-lg py-3 text-sm font-bold uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por producto..."
          className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {filteredMovements.length === 0 ? (
          <p className="text-[#6B7680] text-center py-12">No hay movimientos registrados.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Fecha</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Producto</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Motivo</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Notas</th>
                <th className="text-right text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredMovements.map(m => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-[#1E1E1E] last:border-0">
                    <td className="px-6 py-3 text-[#B0B8C1] text-sm">{formatDateTime(m.created_at)}</td>
                    <td className="px-6 py-3 text-white text-sm">{m.product?.name || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${REASON_COLORS[m.reason]}`}>{REASON_LABELS[m.reason]}</span>
                    </td>
                    <td className="px-6 py-3 text-[#6B7680] text-xs">{m.notes || '—'}</td>
                    <td className={`px-6 py-3 text-right font-bold text-sm ${m.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
