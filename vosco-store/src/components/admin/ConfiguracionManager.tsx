'use client'

import { useState } from 'react'
import { Check, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Setting } from '@/types'

export default function ConfiguracionManager({ initialSettings }: { initialSettings: Setting[] }) {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>(
    Object.fromEntries(initialSettings.map(s => [s.key, s.value]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))
    await supabase.from('settings').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl text-white tracking-wider">CONFIGURACIÓN</h1>
        <p className="text-[#6B7680] text-sm mt-1">Ajustes generales del sistema</p>
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 max-w-lg space-y-6">
        <div>
          <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-4">Tasa BCV</p>
          <div className="space-y-4">
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Tasa BCV (Bs/$)</label>
              <input
                type="number"
                step="0.01"
                value={settings.bcv_rate || ''}
                onChange={e => setSettings(s => ({ ...s, bcv_rate: e.target.value }))}
                placeholder="36.50"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Fecha de la tasa</label>
              <input
                type="date"
                value={settings.bcv_date || ''}
                onChange={e => setSettings(s => ({ ...s, bcv_date: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#C9A84C] text-black px-6 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
          {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
