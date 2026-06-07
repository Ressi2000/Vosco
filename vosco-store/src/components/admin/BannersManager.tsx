'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Upload } from 'lucide-react'
import Image from 'next/image'
import { Banner } from '@/types'
import { createClient } from '@/lib/supabase/client'

const emptyForm = {
  title: '', subtitle: '', image_url: '', cta_label: '', cta_href: '',
  line_slug: '', bg_color: '#111111', active: true, sort_order: 0
}

export default function BannersManager({ initialBanners }: { initialBanners: Banner[] }) {
  const supabase = createClient()
  const [banners, setBanners] = useState(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }
  const openEdit = (b: Banner) => {
    setForm({
      title: b.title, subtitle: b.subtitle || '', image_url: b.image_url || '',
      cta_label: b.cta_label || '', cta_href: b.cta_href || '',
      line_slug: b.line_slug || '', bg_color: b.bg_color, active: b.active, sort_order: b.sort_order
    })
    setEditingId(b.id)
    setShowForm(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `banners/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('product-images').upload(path, file)
    if (data && !error) {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(data.path)
      setForm(f => ({ ...f, image_url: url.publicUrl }))
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, subtitle: form.subtitle || null, image_url: form.image_url || null, cta_label: form.cta_label || null, cta_href: form.cta_href || null, line_slug: form.line_slug || null }
    if (editingId) {
      const { data } = await supabase.from('banners').update(payload).eq('id', editingId).select().single()
      if (data) setBanners(bs => bs.map(b => b.id === editingId ? data as Banner : b))
    } else {
      const { data } = await supabase.from('banners').insert(payload).select().single()
      if (data) setBanners(bs => [...bs, data as Banner])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return
    await supabase.from('banners').delete().eq('id', id)
    setBanners(bs => bs.filter(b => b.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">BANNERS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{banners.length} banners</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nuevo banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {banners.map(banner => (
          <div key={banner.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
            {/* Preview */}
            <div className="relative h-32 flex items-center justify-center" style={{ backgroundColor: banner.bg_color }}>
              {banner.image_url && <Image src={banner.image_url} alt={banner.title} fill className="object-cover opacity-40" />}
              <div className="relative z-10 text-center px-4">
                <p className="font-display text-xl text-white tracking-wider">{banner.title}</p>
                {banner.subtitle && <p className="text-white/70 text-xs mt-1">{banner.subtitle}</p>}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  {banner.cta_label && <p className="text-[#6B7680] text-xs">CTA: {banner.cta_label}</p>}
                  <span className={`text-xs font-bold ${banner.active ? 'text-green-400' : 'text-[#6B7680]'}`}>{banner.active ? 'Activo' : 'Inactivo'}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(banner)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors"><Pencil size={12} /></button>
                  <button onClick={() => handleDelete(banner.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && <p className="text-center text-[#6B7680] py-20">No hay banners todavía.</p>}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR BANNER' : 'NUEVO BANNER'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'title', label: 'Título' },
                    { key: 'subtitle', label: 'Subtítulo' },
                    { key: 'cta_label', label: 'Texto del botón (CTA)' },
                    { key: 'cta_href', label: 'Enlace del botón' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">{label}</label>
                      <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Imagen</label>
                    {form.image_url && (
                      <div className="relative h-24 mb-2 rounded-lg overflow-hidden">
                        <Image src={form.image_url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="URL de imagen" className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      <label className="flex items-center gap-2 cursor-pointer border border-[#1E1E1E] text-[#6B7680] hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <Upload size={14} /> {uploading ? '...' : 'Subir'}
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Color de fondo</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="w-10 h-10 rounded bg-[#0A0A0A] border border-[#1E1E1E] cursor-pointer" />
                        <input value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-sm focus:border-[#C9A84C] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Línea</label>
                      <select value={form.line_slug} onChange={e => setForm(f => ({ ...f, line_slug: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors">
                        <option value="">Todas</option>
                        <option value="luces">Luces</option>
                        <option value="repuestos">Repuestos</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Orden</label>
                    <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm(f => ({ ...f, active: !f.active }))} className={`w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-[#C9A84C]' : 'bg-[#1E1E1E]'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-[#B0B8C1] text-sm">Activo</span>
                  </label>
                </div>
                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button onClick={() => setShowForm(false)} className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold uppercase hover:border-[#2E2E2E] hover:text-white transition-colors">Cancelar</button>
                  <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40">
                    <Check size={16} />{saving ? 'Guardando...' : 'Guardar'}
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
