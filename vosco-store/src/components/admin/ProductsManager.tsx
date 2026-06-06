'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Zap, Wrench, X, Check, Upload } from 'lucide-react'
import Image from 'next/image'
import { Product, ProductLine } from '@/types'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  price_bs: '',
  line: 'luces' as ProductLine,
  category: '',
  stock: '',
  featured: false,
  images: [] as string[],
  specs: {} as Record<string, string>,
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
  const supabase = createClient()

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
      price_bs: String(p.price_bs || ''),
      line: p.line,
      category: p.category,
      stock: String(p.stock),
      featured: p.featured,
      images: p.images,
      specs: p.specs || {},
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

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description,
      price: parseFloat(form.price),
      price_bs: form.price_bs ? parseFloat(form.price_bs) : null,
      line: form.line,
      category: form.category,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      images: form.images,
      specs: form.specs,
      active: true,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">PRODUCTOS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{products.length} productos en total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors"
        >
          <Plus size={16} /> Nuevo producto
        </button>
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
              </div>
              <div className="p-4">
                <p className="text-white font-semibold text-sm mb-1 line-clamp-1">{p.name}</p>
                <p className="text-[#C9A84C] font-display text-lg">${p.price.toFixed(2)}</p>
                <p className="text-[#6B7680] text-xs mt-1">Stock: {p.stock}</p>
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
                      {(['luces', 'repuestos'] as ProductLine[]).map(line => (
                        <button
                          key={line}
                          onClick={() => setForm(f => ({ ...f, line }))}
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
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Precio (Bs)</label>
                      <input
                        type="number"
                        value={form.price_bs}
                        onChange={e => setForm(f => ({ ...f, price_bs: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Categoría</label>
                      <input
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="Ej: Kits LED, Faros, Repuestos..."
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Stock</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Descripción</label>
                    <textarea
                      rows={3}
                      value={form.description}
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
                      <button
                        onClick={addImageUrl}
                        className="px-4 py-2 bg-[#C9A84C] text-black rounded-lg text-sm font-bold hover:bg-[#F0D98A] transition-colors"
                      >
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

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                      className={`w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-[#C9A84C]' : 'bg-[#1E1E1E]'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-[#B0B8C1] text-sm">Producto destacado</span>
                  </label>
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
    </div>
  )
}
