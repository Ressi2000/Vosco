'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { ProductLine } from '@/types'
import { createClient } from '@/lib/supabase/client'

const emptyForm = { name: '', slug: '', slogan: '', description: '', color: '#C9A84C', active: true, sort_order: 0 }

export default function LinesManager({ initialLines }: { initialLines: ProductLine[] }) {
  const supabase = createClient()
  const [lines, setLines] = useState(initialLines)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }
  const openEdit = (l: ProductLine) => {
    setForm({ name: l.name, slug: l.slug, slogan: l.slogan || '', description: l.description || '', color: l.color, active: l.active, sort_order: l.sort_order })
    setEditingId(l.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    if (editingId) {
      const { data } = await supabase.from('product_lines').update(form).eq('id', editingId).select().single()
      if (data) setLines(ls => ls.map(l => l.id === editingId ? data as ProductLine : l))
    } else {
      const { data } = await supabase.from('product_lines').insert(form).select().single()
      if (data) setLines(ls => [...ls, data as ProductLine])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta línea?')) return
    await supabase.from('product_lines').delete().eq('id', id)
    setLines(ls => ls.filter(l => l.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">LÍNEAS DE PRODUCTO</h1>
          <p className="text-[#6B7680] text-sm mt-1">{lines.length} líneas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nueva línea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lines.map(line => (
          <div key={line.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6" style={{ borderLeftColor: line.color, borderLeftWidth: 3 }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{line.name}</p>
                <p className="text-[#6B7680] text-xs">{line.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(line)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors"><Pencil size={12} /></button>
                <button onClick={() => handleDelete(line.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
            {line.slogan && <p className="text-[#6B7680] text-sm italic mb-2">"{line.slogan}"</p>}
            {line.description && <p className="text-[#6B7680] text-xs">{line.description}</p>}
            <div className="flex items-center gap-3 mt-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: line.color }} />
              <span className={`text-xs font-bold ${line.active ? 'text-green-400' : 'text-[#6B7680]'}`}>{line.active ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR LÍNEA' : 'NUEVA LÍNEA'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { key: 'name', label: 'Nombre' },
                    { key: 'slug', label: 'Slug' },
                    { key: 'slogan', label: 'Slogan' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">{label}</label>
                      <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Descripción</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded bg-[#0A0A0A] border border-[#1E1E1E] cursor-pointer" />
                        <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-3 py-2 text-white text-sm focus:border-[#C9A84C] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Orden</label>
                      <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
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
                  <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40">
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
