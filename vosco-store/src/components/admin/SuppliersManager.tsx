'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react'
import { Supplier } from '@/types'
import { createClient } from '@/lib/supabase/client'

const emptyForm = {
  name: '',
  country: '',
  contact_name: '',
  phone: '',
  email: '',
  wechat: '',
  payment_terms: '',
  notes: '',
  active: true,
}

export default function SuppliersManager({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const supabase = createClient()
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      (s.country || '').toLowerCase().includes(q) ||
      (s.contact_name || '').toLowerCase().includes(q)
    )
  })

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }

  const openEdit = (s: Supplier) => {
    setForm({
      name: s.name,
      country: s.country || '',
      contact_name: s.contact_name || '',
      phone: s.phone || '',
      email: s.email || '',
      wechat: s.wechat || '',
      payment_terms: s.payment_terms || '',
      notes: s.notes || '',
      active: s.active,
    })
    setEditingId(s.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      name: form.name,
      country: form.country || null,
      contact_name: form.contact_name || null,
      phone: form.phone || null,
      email: form.email || null,
      wechat: form.wechat || null,
      payment_terms: form.payment_terms || null,
      notes: form.notes || null,
      active: form.active,
    }
    if (editingId) {
      const { data } = await supabase.from('suppliers').update(payload).eq('id', editingId).select().single()
      if (data) setSuppliers(ss => ss.map(s => s.id === editingId ? data as Supplier : s))
    } else {
      const { data } = await supabase.from('suppliers').insert(payload).select().single()
      if (data) setSuppliers(ss => [data as Supplier, ...ss])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await supabase.from('suppliers').delete().eq('id', id)
    setSuppliers(ss => ss.filter(s => s.id !== id))
  }

  const toggleActive = async (s: Supplier) => {
    await supabase.from('suppliers').update({ active: !s.active }).eq('id', s.id)
    setSuppliers(ss => ss.map(x => x.id === s.id ? { ...x, active: !x.active } : x))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">PROVEEDORES</h1>
          <p className="text-[#6B7680] text-sm mt-1">{suppliers.length} proveedores registrados</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nuevo proveedor
        </button>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, país o contacto..."
          className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-[#6B7680] text-center py-12">No hay proveedores todavía.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Proveedor</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">País</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Contacto</th>
                <th className="text-left text-[#6B7680] text-xs tracking-widest uppercase px-6 py-4">Estado</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(s => (
                  <motion.tr key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-[#1E1E1E] last:border-0">
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      {s.payment_terms && <p className="text-[#6B7680] text-xs">{s.payment_terms}</p>}
                    </td>
                    <td className="px-6 py-4 text-[#B0B8C1] text-sm">{s.country || '—'}</td>
                    <td className="px-6 py-4">
                      <p className="text-[#B0B8C1] text-sm">{s.contact_name || '—'}</p>
                      <p className="text-[#6B7680] text-xs">{[s.phone, s.email, s.wechat].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive(s)} className={`text-xs font-bold ${s.active ? 'text-green-400' : 'text-[#6B7680]'}`}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(s)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors"><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(s.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR PROVEEDOR' : 'NUEVO PROVEEDOR'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">País</label>
                      <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="China" className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Persona de contacto</label>
                      <input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Teléfono</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">WeChat</label>
                      <input value={form.wechat} onChange={e => setForm(f => ({ ...f, wechat: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Email</label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Condiciones de pago</label>
                    <input value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} placeholder="Ej. 30% adelanto, 70% contra BL" className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Notas</label>
                    <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none" />
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
