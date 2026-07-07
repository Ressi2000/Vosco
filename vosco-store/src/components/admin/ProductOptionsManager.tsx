'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { ProductOption, ProductOptionField } from '@/types'
import { createClient } from '@/lib/supabase/client'

const sections: { field: ProductOptionField; line: 'repuestos' | 'luces'; title: string; hint: string }[] = [
  { field: 'marca', line: 'repuestos', title: 'Marcas (Repuestos)', hint: 'Marcas de camión disponibles en el selector de compatibilidad vehicular.' },
  { field: 'tipo', line: 'luces', title: 'Tipos (Luces)', hint: 'Tipos de producto disponibles en el selector "Tipo" de luces.' },
]

const emptyForm = { value: '', sort_order: 0, active: true }

export default function ProductOptionsManager({ initialOptions }: { initialOptions: ProductOption[] }) {
  const supabase = createClient()
  const [options, setOptions] = useState(initialOptions)
  const [showForm, setShowForm] = useState<ProductOptionField | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const openNew = (field: ProductOptionField) => { setForm(emptyForm); setEditingId(null); setShowForm(field) }
  const openEdit = (opt: ProductOption) => {
    setForm({ value: opt.value, sort_order: opt.sort_order, active: opt.active })
    setEditingId(opt.id)
    setShowForm(opt.field)
  }

  const handleSave = async () => {
    if (!showForm) return
    setSaving(true)
    const section = sections.find(s => s.field === showForm)!
    const payload = { field: showForm, line: section.line, value: form.value, sort_order: form.sort_order, active: form.active }
    if (editingId) {
      const { data } = await supabase.from('product_options').update(payload).eq('id', editingId).select().single()
      if (data) setOptions(os => os.map(o => o.id === editingId ? data as ProductOption : o))
    } else {
      const { data } = await supabase.from('product_options').insert(payload).select().single()
      if (data) setOptions(os => [...os, data as ProductOption])
    }
    setSaving(false)
    setShowForm(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta opción?')) return
    await supabase.from('product_options').delete().eq('id', id)
    setOptions(os => os.filter(o => o.id !== id))
  }

  const toggleActive = async (opt: ProductOption) => {
    await supabase.from('product_options').update({ active: !opt.active }).eq('id', opt.id)
    setOptions(os => os.map(o => o.id === opt.id ? { ...o, active: !o.active } : o))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white tracking-wider">OPCIONES DE PRODUCTO</h1>
        <p className="text-[#6B7680] text-sm mt-1">Marcas y tipos disponibles en los formularios de producto</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map(section => {
          const items = options
            .filter(o => o.field === section.field)
            .sort((a, b) => a.sort_order - b.sort_order)
          return (
            <div key={section.field} className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                <div>
                  <p className="text-white font-semibold">{section.title}</p>
                  <p className="text-[#6B7680] text-xs mt-1">{section.hint}</p>
                </div>
                <button
                  onClick={() => openNew(section.field)}
                  className="flex items-center gap-2 bg-[#C9A84C] text-black px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors shrink-0"
                >
                  <Plus size={14} /> Agregar
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-[#6B7680] text-center py-10 text-sm">No hay opciones todavía.</p>
              ) : (
                <div className="divide-y divide-[#1E1E1E]">
                  <AnimatePresence>
                    {items.map(opt => (
                      <motion.div
                        key={opt.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between px-6 py-3"
                      >
                        <div>
                          <p className="text-white text-sm">{opt.value}</p>
                          <button onClick={() => toggleActive(opt)} className={`text-xs font-bold ${opt.active ? 'text-green-400' : 'text-[#6B7680]'}`}>
                            {opt.active ? 'Activo' : 'Inactivo'}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(opt)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDelete(opt.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(null)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">
                    {editingId ? 'EDITAR OPCIÓN' : 'NUEVA OPCIÓN'}
                  </h2>
                  <button onClick={() => setShowForm(null)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Valor</label>
                    <input
                      value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Orden</label>
                    <input
                      type="number" value={form.sort_order}
                      onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm(f => ({ ...f, active: !f.active }))} className={`w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-[#C9A84C]' : 'bg-[#1E1E1E]'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-[#B0B8C1] text-sm">Activo</span>
                  </label>
                </div>
                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button onClick={() => setShowForm(null)} className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold uppercase hover:border-[#2E2E2E] hover:text-white transition-colors">Cancelar</button>
                  <button onClick={handleSave} disabled={saving || !form.value} className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40">
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
