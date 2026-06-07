'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Search, User } from 'lucide-react'
import { Customer, IdType } from '@/types'
import { createClient } from '@/lib/supabase/client'

const emptyForm = {
  name: '',
  id_type: 'V' as IdType,
  id_number: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

function formatId(c: Customer) {
  if (!c.id_number) return '—'
  return `${c.id_type || 'V'}-${c.id_number}`
}

export default function CustomersManager({ initialCustomers }: { initialCustomers: Customer[] }) {
  const supabase = createClient()
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(search) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.id_number || '').includes(search)
    )
  })

  const openNew = () => {
    setForm(emptyForm)
    setEditingId(null)
    setSaveError('')
    setShowForm(true)
  }

  const openEdit = (c: Customer) => {
    setForm({
      name: c.name,
      id_type: c.id_type || 'V',
      id_number: c.id_number || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || '',
    })
    setEditingId(c.id)
    setSaveError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    const payload = {
      name: form.name,
      id_type: form.id_number ? form.id_type : null,
      id_number: form.id_number || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      notes: form.notes || null,
    }
    if (editingId) {
      const { data, error } = await supabase.from('customers').update(payload).eq('id', editingId).select().single()
      if (error) { setSaveError(error.message.includes('unique') ? 'Ya existe un cliente con esa cédula/RIF.' : error.message); setSaving(false); return }
      if (data) setCustomers(cs => cs.map(c => c.id === editingId ? data as Customer : c))
    } else {
      const { data, error } = await supabase.from('customers').insert(payload).select().single()
      if (error) { setSaveError(error.message.includes('unique') ? 'Ya existe un cliente con esa cédula/RIF.' : error.message); setSaving(false); return }
      if (data) setCustomers(cs => [data as Customer, ...cs])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    setDeleting(id)
    await supabase.from('customers').delete().eq('id', id)
    setCustomers(cs => cs.filter(c => c.id !== id))
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">CLIENTES</h1>
          <p className="text-[#6B7680] text-sm mt-1">{customers.length} clientes registrados</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors"
        >
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Nombre, cédula, RIF, teléfono..."
          className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors"
        />
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6B7680]">
            <User size={32} className="mx-auto mb-3 opacity-30" />
            <p>No hay clientes{search ? ' que coincidan' : ''}.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E1E1E]">
                {['Nombre', 'Cédula / RIF', 'Teléfono', 'Email', 'Dirección', ''].map(h => (
                  <th key={h} className="text-left text-[#C9A84C] text-xs tracking-widest uppercase px-5 py-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(c => (
                  <motion.tr
                    key={c.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#1E1E1E] last:border-0 hover:bg-[#0A0A0A] transition-colors"
                  >
                    <td className="px-5 py-4 text-white text-sm font-medium">{c.name}</td>
                    <td className="px-5 py-4 text-[#B0B8C1] text-sm font-mono">{formatId(c)}</td>
                    <td className="px-5 py-4 text-[#B0B8C1] text-sm">{c.phone || '—'}</td>
                    <td className="px-5 py-4 text-[#B0B8C1] text-sm">{c.email || '—'}</td>
                    <td className="px-5 py-4 text-[#B0B8C1] text-sm max-w-[160px] truncate">{c.address || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(c)} className="p-2 text-[#6B7680] hover:text-white border border-[#1E1E1E] rounded-lg hover:border-[#B0B8C1] transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="p-2 text-[#6B7680] hover:text-red-400 border border-[#1E1E1E] rounded-lg hover:border-red-400 transition-colors disabled:opacity-40">
                          <Trash2 size={13} />
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

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR CLIENTE' : 'NUEVO CLIENTE'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nombre completo o razón social"
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                  </div>

                  {/* Cédula / RIF */}
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Cédula / RIF</label>
                    <div className="flex gap-2">
                      <div className="flex rounded-lg border border-[#1E1E1E] overflow-hidden flex-shrink-0">
                        {(['V', 'E', 'J'] as IdType[]).map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, id_type: t }))}
                            className={`px-4 py-3 text-sm font-bold tracking-wider transition-colors ${form.id_type === t ? 'bg-[#C9A84C] text-black' : 'text-[#6B7680] hover:text-white bg-[#0A0A0A]'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <input
                        value={form.id_number}
                        onChange={e => setForm(f => ({ ...f, id_number: e.target.value.replace(/\D/g, '') }))}
                        placeholder="12345678"
                        maxLength={10}
                        className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors font-mono tracking-wider"
                      />
                    </div>
                    <p className="text-[#6B7680] text-xs mt-1.5">V = venezolano · E = extranjero · J = jurídico (empresa)</p>
                  </div>

                  {[
                    { key: 'phone', label: 'Teléfono', placeholder: '04141234567' },
                    { key: 'email', label: 'Email', placeholder: 'correo@ejemplo.com' },
                    { key: 'address', label: 'Dirección', placeholder: 'Ciudad, Estado' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">{f.label}</label>
                      <input
                        value={(form as any)[f.key]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Notas</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Observaciones..."
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none"
                    />
                  </div>

                  {saveError && (
                    <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{saveError}</p>
                  )}
                </div>
                <div className="flex gap-3 p-6 border-t border-[#1E1E1E]">
                  <button onClick={() => setShowForm(false)} className="flex-1 border border-[#1E1E1E] text-[#6B7680] py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-[#2E2E2E] hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
                  >
                    <Check size={16} />
                    {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear cliente'}
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
