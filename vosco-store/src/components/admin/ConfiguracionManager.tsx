'use client'

import { useState } from 'react'
import { Check, RefreshCw, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Setting } from '@/types'

const FIELDS = [
  { section: 'Tasa BCV', fields: [
    { key: 'bcv_rate', label: 'Tasa BCV (Bs/$)', type: 'number', placeholder: '36.50' },
    { key: 'bcv_date', label: 'Fecha de la tasa', type: 'date', placeholder: '' },
  ]},
  { section: 'Marca & Contenido', fields: [
    { key: 'logo_url', label: 'URL del Logo (deja vacío para logo por defecto)', type: 'text', placeholder: 'https://...' },
    { key: 'hero_slogan', label: 'Eslogan del Hero (portada)', type: 'text', placeholder: 'Ilumina tu camino y destaca tu estilo' },
    { key: 'footer_slogan', label: 'Eslogan del Footer', type: 'text', placeholder: 'VOSCO — Fuerza en la ruta, estilo en la calle.' },
  ]},
  { section: 'Hero — Portada', fields: [
    { key: 'hero_badge',     label: 'Etiqueta superior (texto dorado pequeño)', type: 'text', placeholder: 'Venezuela · Iluminación Vehicular' },
    { key: 'hero_cta1_label',label: 'Botón 1 — Texto', type: 'text', placeholder: 'Ver Luces' },
    { key: 'hero_cta1_href', label: 'Botón 1 — Enlace', type: 'text', placeholder: '/luces' },
    { key: 'hero_cta2_label',label: 'Botón 2 — Texto', type: 'text', placeholder: 'Ver Repuestos' },
    { key: 'hero_cta2_href', label: 'Botón 2 — Enlace', type: 'text', placeholder: '/repuestos' },
    { key: 'hero_stat1_value',label: 'Estadística 1 — Valor', type: 'text', placeholder: '500+' },
    { key: 'hero_stat1_label',label: 'Estadística 1 — Etiqueta', type: 'text', placeholder: 'Clientes' },
    { key: 'hero_stat2_value',label: 'Estadística 2 — Valor', type: 'text', placeholder: '2' },
    { key: 'hero_stat2_label',label: 'Estadística 2 — Etiqueta', type: 'text', placeholder: 'Líneas' },
    { key: 'hero_stat3_value',label: 'Estadística 3 — Valor', type: 'text', placeholder: '100%' },
    { key: 'hero_stat3_label',label: 'Estadística 3 — Etiqueta', type: 'text', placeholder: 'Confianza' },
  ]},
  { section: 'Contacto & Redes', fields: [
    { key: 'whatsapp_number', label: 'Número de WhatsApp (sin +)', type: 'text', placeholder: '584141234567' },
    { key: 'instagram_url', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/vosco' },
    { key: 'tiktok_url', label: 'TikTok URL', type: 'text', placeholder: 'https://tiktok.com/@vosco' },
    { key: 'facebook_url', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/vosco' },
  ]},
]

export default function ConfiguracionManager({ initialSettings }: { initialSettings: Setting[] }) {
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>(
    Object.fromEntries(initialSettings.map(s => [s.key, s.value]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }))
    await supabase.from('settings').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const { data, error } = await supabase.storage.from('product-images').upload(`logo/vosco-logo.${ext}`, file, { upsert: true })
    if (data && !error) {
      const { data: url } = supabase.storage.from('product-images').getPublicUrl(data.path)
      setSettings(s => ({ ...s, logo_url: url.publicUrl }))
    }
    setUploading(false)
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl text-white tracking-wider">CONFIGURACIÓN</h1>
        <p className="text-[#6B7680] text-sm mt-1">Ajustes generales de la tienda VOSCO</p>
      </div>

      <div className="space-y-8 max-w-2xl">
        {FIELDS.map(section => (
          <div key={section.section} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 space-y-5">
            <p className="text-[#C9A84C] text-xs tracking-widest uppercase border-b border-[#1E1E1E] pb-3">{section.section}</p>
            {section.fields.map(field => (
              <div key={field.key}>
                <label className="text-[#B0B8C1] text-xs tracking-wider uppercase mb-2 block">{field.label}</label>
                {field.key === 'logo_url' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={settings[field.key] || ''}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-[#6B7680] hover:text-[#C9A84C] text-xs transition-colors w-fit">
                      <Upload size={13} />
                      {uploading ? 'Subiendo...' : 'O subir logo desde tu dispositivo'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {settings.logo_url && (
                      <img src={settings.logo_url} alt="Logo preview" className="h-16 object-contain mt-2 mix-blend-screen" />
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    step={field.type === 'number' ? '0.01' : undefined}
                    value={settings[field.key] || ''}
                    onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#C9A84C] text-black px-6 py-3 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors disabled:opacity-40"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
          {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
