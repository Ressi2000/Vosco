'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowUpDown, Plus, X, Check, Upload, Zap, Wrench, Trash2 } from 'lucide-react'
import { Product, ProductLineName, ProductOption } from '@/types'
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

function computeCbm(largo: string, ancho: string, alto: string): number | null {
  const l = parseFloat(largo), a = parseFloat(ancho), h = parseFloat(alto)
  if (!l || !a || !h) return null
  return (l * a * h) / 1_000_000
}

function emptyFormFor(p?: Product) {
  return {
    name: p?.name || '',
    description: p?.description || '',
    price: p ? String(p.price) : '',
    line: (p?.line || 'luces') as ProductLineName,
    stock: p ? String(p.stock) : '',
    featured: p?.featured || false,
    active: p?.active ?? true,
    images: p?.images || ([] as string[]),
    specs: p?.specs || ({} as Record<string, string>),
    on_sale: p?.on_sale || false,
    sale_price: String(p?.sale_price || ''),
    sale_ends_at: p?.sale_ends_at ? p.sale_ends_at.slice(0, 16) : '',
    vehicle_compat: p?.vehicle_compat || ([] as VehicleCompat[]),
    codigo_vosco: p?.codigo_vosco || '',
    codigo_oem: p?.codigo_oem || '',
    largo_cm: String(p?.largo_cm ?? ''),
    ancho_cm: String(p?.ancho_cm ?? ''),
    alto_cm: String(p?.alto_cm ?? ''),
    peso_kg: String(p?.peso_kg ?? ''),
    codigo_original_mitsubishi: p?.codigo_original_mitsubishi || '',
    precio_fabrica: String(p?.precio_fabrica ?? ''),
    nombre_ingles: p?.nombre_ingles || '',
    tipo: p?.tipo || '',
    bases: p?.bases || '',
  }
}

type Tab = 'general' | 'ficha' | 'compat' | 'imagenes' | 'oferta'

export default function ProductEditor({ product, options }: { product?: Product; options: ProductOption[] }) {
  const supabase = createClient()
  const router = useRouter()
  const editingId = product?.id || null

  const [form, setForm] = useState(() => emptyFormFor(product))
  const [tab, setTab] = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const marcaOptions = options.filter(o => o.field === 'marca')
  const tipoOptions = options.filter(o => o.field === 'tipo')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'ficha', label: 'Ficha técnica' },
    ...(form.line === 'repuestos' ? [{ key: 'compat' as Tab, label: 'Compatibilidad' }] : []),
    { key: 'imagenes', label: 'Imágenes' },
    { key: 'oferta', label: 'Oferta' },
  ]

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
      featured: form.featured,
      active: form.active,
      images: form.images,
      specs: form.specs,
      on_sale: form.on_sale,
      sale_price: form.on_sale && form.sale_price ? parseFloat(form.sale_price) : null,
      sale_ends_at: form.on_sale && form.sale_ends_at ? form.sale_ends_at : null,
      vehicle_compat: form.line === 'repuestos' ? form.vehicle_compat : [],
      codigo_vosco: form.codigo_vosco || null,
      codigo_oem: form.codigo_oem || null,
      largo_cm: form.largo_cm ? parseFloat(form.largo_cm) : null,
      ancho_cm: form.ancho_cm ? parseFloat(form.ancho_cm) : null,
      alto_cm: form.alto_cm ? parseFloat(form.alto_cm) : null,
      peso_kg: form.peso_kg ? parseFloat(form.peso_kg) : null,
      cbm: computeCbm(form.largo_cm, form.ancho_cm, form.alto_cm),
      codigo_original_mitsubishi: form.line === 'repuestos' ? (form.codigo_original_mitsubishi || null) : null,
      precio_fabrica: form.line === 'repuestos' && form.precio_fabrica ? parseFloat(form.precio_fabrica) : null,
      nombre_ingles: form.line === 'luces' ? (form.nombre_ingles || null) : null,
      tipo: form.line === 'luces' ? (form.tipo || null) : null,
      bases: form.line === 'luces' ? (form.bases || null) : null,
    }
    if (!editingId) payload.stock = parseInt(form.stock) || 0

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId)
    } else {
      await supabase.from('products').insert(payload)
    }
    setSaving(false)
    router.push('/admin/productos')
  }

  const handleDelete = async () => {
    if (!editingId || !confirm('¿Eliminar este producto?')) return
    setDeleting(true)
    await supabase.from('products').delete().eq('id', editingId)
    router.push('/admin/productos')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/productos" className="text-[#6B7680] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-4xl text-white tracking-wider">
              {editingId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
            </h1>
            {editingId && <p className="text-[#6B7680] text-sm mt-1">{product?.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editingId && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 border border-[#1E1E1E] text-red-400 px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-red-400 transition-colors disabled:opacity-40"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.price}
            className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
          >
            <Check size={16} />
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1E1E1E] mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-xs font-bold tracking-widest uppercase whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-[#C9A84C] text-[#C9A84C]' : 'border-transparent text-[#6B7680] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {tab === 'general' && (
              <div className="space-y-5">
                <div>
                  <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Línea</label>
                  <div className="flex gap-3">
                    {(['luces', 'repuestos'] as ProductLineName[]).map(line => (
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
                      type="number" step="0.01" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">
                      {editingId ? 'Stock' : 'Stock inicial'}
                    </label>
                    {editingId ? (
                      <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3">
                        <span className="text-white text-sm">{form.stock}</span>
                        <Link
                          href={`/admin/stock?product=${editingId}`}
                          className="flex items-center gap-1 text-[#C9A84C] text-xs font-bold uppercase tracking-wider hover:text-[#F0D98A] transition-colors"
                        >
                          <ArrowUpDown size={12} /> Ajustar
                        </Link>
                      </div>
                    ) : (
                      <input
                        type="number" value={form.stock}
                        onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Descripción</label>
                  <textarea
                    rows={4} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none"
                  />
                </div>

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
                </div>
              </div>
            )}

            {tab === 'ficha' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Código Vosco</label>
                    <input
                      value={form.codigo_vosco}
                      onChange={e => setForm(f => ({ ...f, codigo_vosco: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Código OEM</label>
                    <input
                      value={form.codigo_oem}
                      onChange={e => setForm(f => ({ ...f, codigo_oem: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                </div>

                {form.line === 'repuestos' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Código original Mitsubishi</label>
                      <input
                        value={form.codigo_original_mitsubishi}
                        onChange={e => setForm(f => ({ ...f, codigo_original_mitsubishi: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Precio de fábrica (USD)</label>
                      <input
                        type="number" step="0.01" value={form.precio_fabrica}
                        onChange={e => setForm(f => ({ ...f, precio_fabrica: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {form.line === 'luces' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre en inglés</label>
                      <input
                        value={form.nombre_ingles}
                        onChange={e => setForm(f => ({ ...f, nombre_ingles: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Tipo</label>
                      {tipoOptions.length > 0 ? (
                        <select
                          value={form.tipo}
                          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                          className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                        >
                          <option value="">Sin tipo</option>
                          {tipoOptions.map(o => (
                            <option key={o.id} value={o.value}>{o.value}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[#6B7680] text-xs py-2">No hay tipos creados. Agrega uno en Admin &gt; Marcas y Tipos.</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Bases</label>
                      <input
                        value={form.bases}
                        onChange={e => setForm(f => ({ ...f, bases: e.target.value }))}
                        placeholder="Ej. H4, H7, T10"
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Medidas y peso</label>
                  <div className="grid grid-cols-4 gap-3">
                    <input
                      type="number" step="0.01" value={form.largo_cm}
                      onChange={e => setForm(f => ({ ...f, largo_cm: e.target.value }))}
                      placeholder="Largo (cm)"
                      className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                    <input
                      type="number" step="0.01" value={form.ancho_cm}
                      onChange={e => setForm(f => ({ ...f, ancho_cm: e.target.value }))}
                      placeholder="Ancho (cm)"
                      className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                    <input
                      type="number" step="0.01" value={form.alto_cm}
                      onChange={e => setForm(f => ({ ...f, alto_cm: e.target.value }))}
                      placeholder="Alto (cm)"
                      className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                    <input
                      type="number" step="0.01" value={form.peso_kg}
                      onChange={e => setForm(f => ({ ...f, peso_kg: e.target.value }))}
                      placeholder="Peso (kg)"
                      className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[#6B7680] text-xs mt-2">
                    CBM calculado: <span className="text-white">{computeCbm(form.largo_cm, form.ancho_cm, form.alto_cm)?.toFixed(6) ?? '—'} m³</span>
                  </p>
                </div>
              </div>
            )}

            {tab === 'compat' && form.line === 'repuestos' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[#C9A84C] text-xs tracking-widest uppercase">Compatibilidad vehicular</label>
                  <button onClick={addVehicleCompat} className="flex items-center gap-1 text-xs text-[#C9A84C] hover:text-[#F0D98A] transition-colors">
                    <Plus size={12} /> Agregar
                  </button>
                </div>
                {form.vehicle_compat.map((vc, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <select value={vc.brand} onChange={e => updateVehicleCompat(i, 'brand', e.target.value)} className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none transition-colors">
                      <option value="">Marca</option>
                      {marcaOptions.map(o => <option key={o.id} value={o.value}>{o.value}</option>)}
                    </select>
                    <input value={vc.model} onChange={e => updateVehicleCompat(i, 'model', e.target.value)} placeholder="Modelo de aplicación" className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-xs focus:border-[#C9A84C] outline-none transition-colors" />
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

            {tab === 'imagenes' && (
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
                  <div className="flex flex-wrap gap-3 mt-4">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#0A0A0A] border border-[#1E1E1E]">
                        <Image src={img} alt="" fill className="object-cover" />
                        <button
                          onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                          className="absolute top-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'oferta' && (
              <div className="space-y-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(f => ({ ...f, on_sale: !f.on_sale }))} className={`w-10 h-5 rounded-full transition-colors ${form.on_sale ? 'bg-red-500' : 'bg-[#1E1E1E]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.on_sale ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-[#B0B8C1] text-sm">En oferta</span>
                </label>

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
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
