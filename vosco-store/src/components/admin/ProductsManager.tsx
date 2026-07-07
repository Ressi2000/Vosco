'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Zap, Wrench, X, Check, Upload, FileSpreadsheet, LayoutGrid, List } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Product, ProductLineName } from '@/types'
import { createClient } from '@/lib/supabase/client'

type ViewMode = 'cards' | 'table'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface BulkRow {
  name: string
  line: string
  price: string
  stock: string
  description: string
  category: string
  error?: string
}

function parseCSV(raw: string): BulkRow[] {
  const lines = raw.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const header = lines[0].split(',').map(h => h.trim().toLowerCase())
  const nameIdx = header.indexOf('name')
  const lineIdx = header.indexOf('line')
  const priceIdx = header.indexOf('price')
  const stockIdx = header.indexOf('stock')
  const descIdx = header.indexOf('description')
  const catIdx = header.indexOf('category')

  return lines.slice(1).map(line => {
    // simple CSV split (no quoted-comma support needed for basic use)
    const cols = line.split(',').map(c => c.trim())
    const row: BulkRow = {
      name: nameIdx >= 0 ? cols[nameIdx] || '' : '',
      line: lineIdx >= 0 ? cols[lineIdx] || '' : '',
      price: priceIdx >= 0 ? cols[priceIdx] || '' : '',
      stock: stockIdx >= 0 ? cols[stockIdx] || '' : '',
      description: descIdx >= 0 ? cols[descIdx] || '' : '',
      category: catIdx >= 0 ? cols[catIdx] || '' : '',
    }

    const missing: string[] = []
    if (!row.name) missing.push('name')
    if (!row.line) missing.push('line')
    if (!row.price || isNaN(parseFloat(row.price))) missing.push('price')
    if (missing.length) row.error = `Faltan campos requeridos: ${missing.join(', ')}`

    return row
  })
}

export default function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('cards')

  // Bulk import state
  const [showBulk, setShowBulk] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([])
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkRowErrors, setBulkRowErrors] = useState<Record<number, string>>({})
  const [bulkDone, setBulkDone] = useState(false)

  const supabase = createClient()

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    setProducts(ps => ps.filter(p => p.id !== id))
    setDeleting(null)
  }

  // Bulk import handlers
  const openBulk = () => {
    setCsvText('')
    setBulkRows([])
    setBulkRowErrors({})
    setBulkDone(false)
    setShowBulk(true)
  }

  const handleCsvChange = (value: string) => {
    setCsvText(value)
    setBulkRows(parseCSV(value))
    setBulkRowErrors({})
    setBulkDone(false)
  }

  const validRows = bulkRows.filter(r => !r.error)

  const handleBulkImport = async () => {
    if (validRows.length === 0) return
    setBulkImporting(true)
    const errors: Record<number, string> = {}
    const inserted: Product[] = []

    for (let i = 0; i < bulkRows.length; i++) {
      const row = bulkRows[i]
      if (row.error) continue

      const payload = {
        name: row.name,
        slug: slugify(row.name),
        description: row.description,
        price: parseFloat(row.price),
        line: row.line as ProductLineName,
        category: row.category,
        stock: parseInt(row.stock) || 0,
        featured: false,
        active: true,
        images: [],
        specs: {},
      }

      const { data, error } = await supabase.from('products').insert(payload).select().single()
      if (error) {
        errors[i] = error.message
      } else if (data) {
        inserted.push(data as Product)
      }
    }

    setBulkRowErrors(errors)
    if (inserted.length > 0) {
      setProducts(ps => [...inserted, ...ps])
    }
    setBulkImporting(false)
    setBulkDone(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">PRODUCTOS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{products.length} productos en total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[#1E1E1E] overflow-hidden">
            <button
              onClick={() => setView('cards')}
              title="Vista de tarjetas"
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                view === 'cards' ? 'bg-[#C9A84C] text-black' : 'text-[#6B7680] hover:text-white'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('table')}
              title="Vista de tabla"
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${
                view === 'table' ? 'bg-[#C9A84C] text-black' : 'text-[#6B7680] hover:text-white'
              }`}
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={openBulk}
            className="flex items-center gap-2 border border-[#C9A84C] text-[#C9A84C] px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#C9A84C]/10 transition-colors"
          >
            <FileSpreadsheet size={16} /> Importar lote
          </button>
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors"
          >
            <Plus size={16} /> Nuevo producto
          </Link>
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden mb-8">
          {products.length === 0 ? (
            <p className="text-[#6B7680] text-center py-12">No hay productos todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E1E1E]">
                    <th className="px-6 py-4" />
                    <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-4 py-4">Nombre</th>
                    <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-4 py-4">Línea</th>
                    <th className="text-right text-[#6B7680] text-xs tracking-widest uppercase px-4 py-4">Precio</th>
                    <th className="text-right text-[#6B7680] text-xs tracking-widest uppercase px-4 py-4">Stock</th>
                    <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-4 py-4">Estado</th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {products.map(p => (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-[#1E1E1E] last:border-0"
                      >
                        <td className="pl-6 py-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#0A0A0A] border border-[#1E1E1E] shrink-0">
                            {p.images[0] ? (
                              <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[#2E2E2E]">
                                <Upload size={16} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white text-sm font-medium line-clamp-1">{p.name}</p>
                          {p.codigo_vosco && <p className="text-[#6B7680] text-xs">{p.codigo_vosco}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase"
                            style={{
                              backgroundColor: p.line === 'luces' ? '#C9A84C20' : '#B0B8C120',
                              color: p.line === 'luces' ? '#C9A84C' : '#B0B8C1',
                            }}
                          >
                            {p.line === 'luces' ? <Zap size={10} /> : <Wrench size={10} />}
                            {p.line}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.on_sale && p.sale_price ? (
                            <>
                              <p className="text-[#6B7680] text-xs line-through">${p.price.toFixed(2)}</p>
                              <p className="text-orange-400 text-sm font-bold">${p.sale_price.toFixed(2)}</p>
                            </>
                          ) : (
                            <p className="text-[#C9A84C] text-sm font-bold">${p.price.toFixed(2)}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-[#B0B8C1] text-sm">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${p.active ? 'text-green-400' : 'text-[#6B7680]'}`}>
                            {p.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/admin/productos/${p.id}`} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors">
                              <Pencil size={12} />
                            </Link>
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={deleting === p.id}
                              className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors disabled:opacity-40"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product grid */}
      {view === 'cards' && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {products.map(p => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden"
            >
              <div className="relative aspect-video bg-[#0A0A0A]">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#2E2E2E]">
                    <Upload size={32} />
                  </div>
                )}
                <div
                  className="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase"
                  style={{
                    backgroundColor: p.line === 'luces' ? '#C9A84C20' : '#B0B8C120',
                    color: p.line === 'luces' ? '#C9A84C' : '#B0B8C1',
                    border: `1px solid ${p.line === 'luces' ? '#C9A84C40' : '#B0B8C140'}`,
                  }}
                >
                  {p.line === 'luces' ? <Zap size={10} className="inline mr-1" /> : <Wrench size={10} className="inline mr-1" />}
                  {p.line}
                </div>
                {p.on_sale && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">
                    OFERTA
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-white font-semibold text-sm mb-1 line-clamp-1">{p.name}</p>
                <div className="flex items-center gap-2">
                  {p.on_sale && p.sale_price ? (
                    <>
                      <p className="text-[#6B7680] text-xs line-through">${p.price.toFixed(2)}</p>
                      <p className="text-orange-400 font-display text-lg">${p.sale_price.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="text-[#C9A84C] font-display text-lg">${p.price.toFixed(2)}</p>
                  )}
                </div>
                <p className="text-[#6B7680] text-xs mt-1">Stock: {p.stock} · {p.active ? 'Activo' : 'Inactivo'}</p>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="flex-1 flex items-center justify-center gap-1 border border-[#1E1E1E] text-[#B0B8C1] py-2 rounded-lg text-xs font-medium hover:border-[#B0B8C1] transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="flex items-center justify-center gap-1 border border-[#1E1E1E] text-red-400 py-2 px-3 rounded-lg text-xs font-medium hover:border-red-400 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulk && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulk(false)}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={20} className="text-[#C9A84C]" />
                    <h2 className="font-display text-2xl text-white tracking-wider">IMPORTAR LOTE</h2>
                  </div>
                  <button onClick={() => setShowBulk(false)} className="text-[#6B7680] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* CSV format hint */}
                  <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg p-4">
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2">Formato esperado (CSV con encabezado)</p>
                    <code className="text-[#6B7680] text-xs font-mono">name,line,price,stock,description,category</code>
                    <p className="text-[#6B7680] text-xs mt-2">Campos requeridos: <span className="text-white">name, line, price</span></p>
                  </div>

                  {/* CSV textarea */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Datos CSV</label>
                    <textarea
                      rows={7}
                      value={csvText}
                      onChange={e => handleCsvChange(e.target.value)}
                      placeholder={'name,line,price,stock,description,category\nFaro LED H4,luces,25.99,10,Faro de alta intensidad,Faros'}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none font-mono"
                    />
                  </div>

                  {/* Preview table */}
                  {bulkRows.length > 0 && (
                    <div>
                      <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">
                        Vista previa — {validRows.length} válidos / {bulkRows.length} total
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-[#1E1E1E]">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[#1E1E1E] bg-[#0A0A0A]">
                              {['Nombre', 'Línea', 'Precio', 'Stock', 'Categoría', 'Estado'].map(h => (
                                <th key={h} className="text-left text-[#C9A84C] tracking-widest uppercase px-3 py-2 font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {bulkRows.map((row, i) => {
                              const importError = bulkRowErrors[i]
                              const hasError = !!row.error || !!importError
                              return (
                                <tr key={i} className={`border-b border-[#1E1E1E] last:border-0 ${hasError ? 'bg-red-500/5' : ''}`}>
                                  <td className="px-3 py-2 text-white">{row.name || <span className="text-red-400">—</span>}</td>
                                  <td className="px-3 py-2 text-[#B0B8C1]">{row.line || <span className="text-red-400">—</span>}</td>
                                  <td className="px-3 py-2 text-[#B0B8C1]">{row.price ? `$${row.price}` : <span className="text-red-400">—</span>}</td>
                                  <td className="px-3 py-2 text-[#B0B8C1]">{row.stock || '0'}</td>
                                  <td className="px-3 py-2 text-[#B0B8C1]">{row.category || '—'}</td>
                                  <td className="px-3 py-2">
                                    {importError ? (
                                      <span className="text-red-400">{importError}</span>
                                    ) : row.error ? (
                                      <span className="text-red-400">{row.error}</span>
                                    ) : bulkDone ? (
                                      <span className="text-green-400 flex items-center gap-1"><Check size={10} /> Importado</span>
                                    ) : (
                                      <span className="text-[#6B7680]">OK</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {bulkDone && Object.keys(bulkRowErrors).length === 0 && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-green-400 text-sm flex items-center gap-2">
                      <Check size={14} /> Importación completada exitosamente.
                    </div>
                  )}
                </div>

                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button
                    onClick={() => setShowBulk(false)}
                    className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-[#2E2E2E] hover:text-white transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={bulkImporting || validRows.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
                  >
                    <FileSpreadsheet size={16} />
                    {bulkImporting ? 'Importando...' : `Importar ${validRows.length} producto${validRows.length !== 1 ? 's' : ''}`}
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
