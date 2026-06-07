'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Star } from 'lucide-react'
import { Testimonial } from '@/types'
import { createClient } from '@/lib/supabase/client'

const emptyForm = { name: '', role: '', text: '', rating: 5, avatar_url: '', active: true }

export default function TestimonialsManager({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const supabase = createClient()
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }
  const openEdit = (t: Testimonial) => {
    setForm({ name: t.name, role: t.role, text: t.text, rating: t.rating, avatar_url: t.avatar_url || '', active: (t as any).active ?? true })
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, avatar_url: form.avatar_url || null }
    if (editingId) {
      const { data } = await supabase.from('testimonials').update(payload).eq('id', editingId).select().single()
      if (data) setTestimonials(ts => ts.map(t => t.id === editingId ? data as Testimonial : t))
    } else {
      const { data } = await supabase.from('testimonials').insert(payload).select().single()
      if (data) setTestimonials(ts => [data as Testimonial, ...ts])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    setTestimonials(ts => ts.filter(t => t.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">TESTIMONIOS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{testimonials.length} testimonios</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nuevo testimonio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {testimonials.map(t => (
          <div key={t.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-medium">{t.name}</p>
                <p className="text-[#6B7680] text-xs">{t.role}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(t)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors"><Pencil size={12} /></button>
                <button onClick={() => handleDelete(t.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
            <div className="flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < t.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-[#2E2E2E]'} />
              ))}
            </div>
            <p className="text-[#6B7680] text-sm italic">"{t.text}"</p>
          </div>
        ))}
      </div>
      {testimonials.length === 0 && <p className="text-center text-[#6B7680] py-20">No hay testimonios todavía.</p>}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR TESTIMONIO' : 'NUEVO TESTIMONIO'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Rol / Empresa</label>
                    <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Testimonio</label>
                    <textarea rows={4} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Calificación</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setForm(f => ({ ...f, rating: star }))} className="transition-transform hover:scale-110">
                          <Star size={24} className={star <= form.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-[#2E2E2E]'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">URL de Avatar</label>
                    <input value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="https://..." className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
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
                  <button onClick={handleSave} disabled={saving || !form.name || !form.text} className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40">
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
