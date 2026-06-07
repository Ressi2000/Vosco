'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Zap, Wrench, X, Check, Upload, FileSpreadsheet } from 'lucide-react'
import Image from 'next/image'
import { Product, ProductLineName, Category } from '@/types'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

interface VehicleCompat {
  brand: string
  model: string
  year_from?: number
  year_to?: number
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

const emptyForm = {
  name: '',
  description: '',
  price: '',
  line: 'luces' as ProductLineName,
  category: '',
  category_id: '',
  stock: '',
  featured: false,
  active: true,
  images: [] as string[],
  specs: {} as Record<string, string>,
  on_sale: false,
  sale_price: '',
  sale_ends_at: '',
  vehicle_compat: [] as VehicleCompat[],
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
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Bulk import state
  const [showBulk, setShowBulk] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([])
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkRowErrors, setBulkRowErrors] = useState<Record<number, string>>({})
  const [bulkDone, setBulkDone] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.from('categories').select('*').eq('active', true).order('sort_order')
      .then(({ data }) => { if (data) setCategories(data as Category[]) })
  }, [])

  const lineCategories = categories.filter(c => c.line_slug === form.line)

  const openNew = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      line: p.line,
      category: p.category,
      category_id: p.category_id || '',
      stock: String(p.stock),
      featured: p.featured,
      active: (p as any).active ?? true,
      images: p.images,
      specs: p.specs || {},
      on_sale: p.on_sale || false,
      sale_price: String(p.sale_price || ''),
      sale_ends_at: p.sale_ends_at ? p.sale_ends_at.slice(0, 16) : '',
      vehicle_compat: p.vehicle_compat || [],
    })
    setEditingId(p.id)
    setShowForm(true)
  }

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setForm(f => ({ ...f, images: [...f.images, imageUrl.trim()] }))
      setImageUrl('')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('product-images').upload(path, file)
    if (data && !error) {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(data.path)
      setForm(f => ({ ...f, images: [...f.images, url.publicUrl] }))
    }
    setUploading(false)
  }

  const addVehicleCompat = () => {
    setForm(f => ({ ...f, vehicle_compat: [...f.vehicle_compat, { brand: '', model: '' }] }))
  }

  const updateVehicleCompat = (i: number, field: keyof VehicleCompat, value: string | number) => {
    setForm(f => ({
      ...f,
      vehicle_compat: f.vehicle_compat.map((vc, idx) => idx === i ? { ...vc, [field]: value } : vc)
    }))
  }

  const removeVehicleCompat = (i: number) => {
    setForm(f => ({ ...f, vehicle_compat: f.vehicle_compat.filter((_, idx) => idx !== i) }))
  }

  const handleSave = async () => {
    setSaving(true)
    const payload: Record<string, unknown> = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description,
      price: parseFloat(form.price),
      line: form.line,
      category: form.category,
      category_id: form.category_id || null,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      active: form.active,
      images: form.images,
      specs: form.specs,
      on_sale: form.on_sale,
      sale_price: form.on_sale && form.sale_price ? parseFloat(form.sale_price) : null,
      sale_ends_at: form.on_sale && form.sale_ends_at ? form.sale_ends_at : null,
      vehicle_compat: form.line === 'repuestos' ? form.vehicle_compat : [],
    }

    if (editingId) {
      const { data } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
      if (data) setProducts(ps => ps.map(p => p.id === editingId ? data as Product : p))
    } else {
      const { data } = await supabase.from('products').insert(payload).select().single()
      if (data) setProducts(ps => [data as Product, ...ps])
    }
    setSaving(false)
    setShowForm(false)
  }

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
          <button
            onClick={openBulk}
            className="flex items-center gap-2 border border-[#C9A84C] text-[#C9A84C] px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#C9A84C]/10 transition-colors"
          >
            <FileSpreadsheet size={16} /> Importar lote
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors"
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Product grid */}
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
                <p className="text-[#6B7680] text-xs mt-1">Stock: {p.stock} · {(p as any).active ? 'Activo' : 'Inactivo'}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1 border border-[#1E1E1E] text-[#B0B8C1] py-2 rounded-lg text-xs font-medium hover:border-[#B0B8C1] transition-colors"
                  >
                    <Pencil size={12} /> Editar
                  </button>
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

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-black/70 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">
                    {editingId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Line selector */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Línea</label>
                    <div className="flex gap-3">
                      {(['luces', 'repuestos'] as ProductLineName[]).map(line => (
                        <button
                          key={line}
                          onClick={() => setForm(f => ({ ...f, line, category_id: '' }))}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-bold tracking-wider uppercase transition-colors ${
                            form.line === line
                              ? line === 'luces'
                                ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]'
                                : 'bg-[#B0B8C1]/20 border-[#B0B8C1] text-[#B0B8C1]'
                              : 'border-[#1E1E1E] text-[#6B7680] hover:border-[#2E2E2E]'
                          }`}
                        >
                          {line === 'luces' ? <Zap size={14} /> : <Wrench size={14} />}
                          {line}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre</label>
                      <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Precio (USD)</label>
                      <input
                        type="number" step="0.01" value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Stock</label>
                      <input
                        type="number" value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Category select */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Categoría</label>
                    {lineCategories.length > 0 ? (
                      <select
                        value={form.category_id}
                        onChange={e => {
                          const cat = categories.find(c => c.id === e.target.value)
                          setForm(f => ({ ...f, category_id: e.target.value, category: cat ? cat.name : '' }))
                        }}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      >
                        <option value="">Sin categoría</option>
                        {lineCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-[#6B7680] text-xs py-2">No hay categorías para esta línea. Crea una en el panel de Categorías.</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Descripción</label>
                    <textarea
                      rows={3} value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Imágenes</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="URL de imagen"
                        className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                      <button onClick={addImageUrl} className="px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-bold hover:bg-[#F0D98A] transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-[#6B7680] hover:text-white text-sm transition-colors">
                      <Upload size={14} />
                      {uploading ? 'Subiendo...' : 'Subir desde dispositivo'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {form.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#0A0A0A] border border-[#1E1E1E]">
                            <Image src={img} alt="" fill className="object-cover" />
                            <button
                              onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                              className="absolute top-0.5 right-0.5 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              <X size={10} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setForm(f => ({ ...f, featured: !f.featured }))} className={`w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-[#C9A84C]' : 'bg-[#1E1E1E]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-[#B0B8C1] text-sm">Producto destacado</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setForm(f => ({ ...f, active: !f.active }))} className={`w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-[#C9A84C]' : 'bg-[#1E1E1E]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-[#B0B8C1] text-sm">Activo</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => setForm(f => ({ ...f, on_sale: !f.on_sale }))} className={`w-10 h-5 rounded-full transition-colors ${form.on_sale ? 'bg-red-500' : 'bg-[#1E1E1E]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.on_sale ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className="text-[#B0B8C1] text-sm">En oferta</span>
                    </label>
                  </div>

                  {/* Sale fields */}
                  {form.on_sale && (
                    <div className="grid grid-cols-2 gap-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div>
                        <label className="text-red-400 text-xs tracking-widest uppercase mb-2 block">Precio de oferta (USD)</label>
                        <input
                          type="number" step="0.01" value={form.sale_price}
                          onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))}
                          className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-red-400 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-red-400 text-xs tracking-widest uppercase mb-2 block">Fecha fin oferta</label>
                        <input
                          type="datetime-local" value={form.sale_ends_at}
                          onChange={e => setForm(f => ({ ...f, sale_ends_at: e.target.value }))}
                          className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-red-400 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {/* Vehicle compatibility (repuestos only) */}
                  {form.line === 'repuestos' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[#C9A84C] text-xs tracking-widest uppercase">Compatibilidad vehicular</label>
                        <button onClick={addVehicleCompat} className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#F0D98A] transition-colors">
                          <Plus size={12} /> Agregar
                        </button>
                      </div>
                      {form.vehicle_compat.map((vc, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                          <input value={vc.brand} onChange={e => updateVehicleCompat(i, 'brand', e.target.value)} placeholder="Marca" className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none transition-colors" />
                          <input value={vc.model} onChange={e => updateVehicleCompat(i, 'model', e.target.value)} placeholder="Modelo" className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none transition-colors" />
                          <input type="number" value={vc.year_from || ''} onChange={e => updateVehicleCompat(i, 'year_from', parseInt(e.target.value) || 0)} placeholder="Desde" className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none transition-colors" />
                          <div className="flex gap-1">
                            <input type="number" value={vc.year_to || ''} onChange={e => updateVehicleCompat(i, 'year_to', parseInt(e.target.value) || 0)} placeholder="Hasta" className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none transition-colors" />
                            <button onClick={() => removeVehicleCompat(i)} className="text-red-400 hover:text-red-300 p-1">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {form.vehicle_compat.length === 0 && (
                        <p className="text-[#6B7680] text-xs">No hay compatibilidades agregadas.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-[#2E2E2E] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name || !form.price}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
                  >
                    <Check size={16} />
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
