'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Check, Upload } from 'lucide-react'
import Image from 'next/image'
import { Company } from '@/types'
import { createClient } from '@/lib/supabase/client'

const emptyForm = { name: '', logo_url: '', description: '', active: true, sort_order: 0 }

export default function CompaniesManager({ initialCompanies }: { initialCompanies: Company[] }) {
  const supabase = createClient()
  const [companies, setCompanies] = useState(initialCompanies)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true) }
  const openEdit = (c: Company) => {
    setForm({ name: c.name, logo_url: c.logo_url || '', description: c.description || '', active: c.active, sort_order: c.sort_order })
    setEditingId(c.id)
    setShowForm(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `companies/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('product-images').upload(path, file)
    if (data && !error) {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(data.path)
      setForm(f => ({ ...f, logo_url: url.publicUrl }))
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, logo_url: form.logo_url || null, description: form.description || null }
    if (editingId) {
      const { data } = await supabase.from('companies').update(payload).eq('id', editingId).select().single()
      if (data) setCompanies(cs => cs.map(c => c.id === editingId ? data as Company : c))
    } else {
      const { data } = await supabase.from('companies').insert(payload).select().single()
      if (data) setCompanies(cs => [...cs, data as Company])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta empresa?')) return
    await supabase.from('companies').delete().eq('id', id)
    setCompanies(cs => cs.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-white tracking-wider">EMPRESAS</h1>
          <p className="text-[#6B7680] text-sm mt-1">{companies.length} empresas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#C9A84C] text-black px-5 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
          <Plus size={16} /> Nueva empresa
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map(company => (
          <div key={company.id} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
            {company.logo_url ? (
              <div className="relative h-16 mb-3">
                <Image src={company.logo_url} alt={company.name} fill className="object-contain" />
              </div>
            ) : (
              <p className="font-display text-xl text-[#C9A84C] tracking-widest mb-3">{company.name.toUpperCase()}</p>
            )}
            {company.logo_url && <p className="text-white font-medium text-sm mb-1">{company.name}</p>}
            {company.description && <p className="text-[#6B7680] text-xs mb-3">{company.description}</p>}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${company.active ? 'text-green-400' : 'text-[#6B7680]'}`}>{company.active ? 'Activo' : 'Inactivo'}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(company)} className="border border-[#1E1E1E] text-[#B0B8C1] p-2 rounded-lg hover:border-[#B0B8C1] transition-colors"><Pencil size={12} /></button>
                <button onClick={() => handleDelete(company.id)} className="border border-[#1E1E1E] text-red-400 p-2 rounded-lg hover:border-red-400 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {companies.length === 0 && <p className="text-center text-[#6B7680] py-20">No hay empresas todavía.</p>}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-black/70 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
                  <h2 className="font-display text-2xl text-white tracking-wider">{editingId ? 'EDITAR EMPRESA' : 'NUEVA EMPRESA'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#6B7680] hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Logo</label>
                    {form.logo_url && (
                      <div className="relative h-16 mb-2 bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#1E1E1E]">
                        <Image src={form.logo_url} alt="" fill className="object-contain p-2" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="URL del logo" className="flex-1 bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-2 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors" />
                      <label className="flex items-center gap-2 cursor-pointer border border-[#1E1E1E] text-[#6B7680] hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <Upload size={14} /> {uploading ? '...' : 'Subir'}
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Descripción</label>
                    <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors resize-none" />
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
