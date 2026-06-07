'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { Category } from '@/types'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const emptyForm = { name: '', slug: '', line_slug: 'luces' as 'luces' | 'repuestos', active: true, sort_order: 0 }

export default function CategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const supabase = createClient()
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }

  const openEdit = (c: Category) => {
    setForm({ name: c.name, slug: c.slug, line_slug: c.line_slug as 'luces' | 'repuestos', active: c.active, sort_order: c.sort_order })
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, slug: form.slug || slugify(form.name) }
    if (editingId) {
      const { data } = await supabase.from('categories').update(payload).eq('id', editingId).select().single()
      if (data) setCategories(cs => cs.map(c => c.id === editingId ? data as Category : c))
    } else {
      const { data } = await supabase.from('categories').insert(payload).select().single()
      if (data) setCategories(cs => [...cs, data as Category])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await supabase.from('categories').delete().eq('id', id)
    setCategories(cs => cs.filter(c => c.id !== id))
  }

  const toggleActive = async (cat: Category) => {
    await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id)
    setCategories(cs => cs.map(c => c.id === cat.id ? { ...c, active: !c.active } : c))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">CATEGORÍAS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{categories.length} categorías</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors"
        >
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-[#6B7680] text-center py-12">No hay categorías todavía.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Nombre</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Línea</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Orden</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {categories.map(cat => (
                  <motion.tr
                    key={cat.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#1E1E1E] last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{cat.name}</p>
                      <p className="text-[#6B7680] text-xs">{cat.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-xs font-bold tracking-widest uppercase px-2 py-1 rounded"
                        style={{
                          backgroundColor: cat.line_slug === 'luces' ? '#C9A84C20' : '#B0B8C120',
                          color: cat.line_slug === 'luces' ? '#C9A84C' : '#B0B8C1',
                        }}
                      >
                        {cat.line_slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6B7680] text-sm">{cat.sort_order}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive(cat)} className={`text-xs font-bold ${cat.active ? 'text-green-400' : 'text-[#6B7680]'}`}>
                        {cat.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(cat)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Slug</label>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Línea</label>
                    <div className="flex gap-3">
                      {(['luces', 'repuestos'] as const).map(line => (
                        <button key={line} onClick={() => setForm(f => ({ ...f, line_slug: line }))}
                          className={`flex-1 py-2 rounded-lg border text-xs font-bold tracking-widest uppercase transition-colors ${form.line_slug === line ? (line === 'luces' ? 'bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]' : 'bg-[#B0B8C1]/20 border-[#B0B8C1] text-[#B0B8C1]') : 'border-[#1E1E1E] text-[#6B7680]'}`}
                        >{line}</button>
                      ))}
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
