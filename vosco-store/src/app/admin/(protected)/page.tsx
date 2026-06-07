import { createClient } from '@/lib/supabase/server'
import { Package, Zap, Wrench, Tag, AlertTriangle, Building2, DollarSign } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: total },
    { count: luces },
    { count: repuestos },
    { count: onSale },
    { count: outOfStock },
    { count: companies },
    { data: settings },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('line', 'luces'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('line', 'repuestos'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('on_sale', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0),
    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('settings').select('*').in('key', ['bcv_rate', 'bcv_date']),
  ])

  const bcvRate = settings?.find((s: any) => s.key === 'bcv_rate')?.value || 'N/A'
  const bcvDate = settings?.find((s: any) => s.key === 'bcv_date')?.value || ''

  const stats = [
    { icon: Package, label: 'Total productos', value: total ?? 0, color: '#C9A84C' },
    { icon: Zap, label: 'Línea Luces', value: luces ?? 0, color: '#C9A84C' },
    { icon: Wrench, label: 'Línea Repuestos', value: repuestos ?? 0, color: '#B0B8C1' },
    { icon: Tag, label: 'Productos en oferta', value: onSale ?? 0, color: '#f97316' },
    { icon: AlertTriangle, label: 'Agotados (stock=0)', value: outOfStock ?? 0, color: '#ef4444' },
    { icon: Building2, label: 'Empresas', value: companies ?? 0, color: '#22c55e' },
  ]

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-4xl text-white tracking-wider">DASHBOARD</h1>
        <p className="text-[#6B7680] text-sm mt-1">Resumen general de VOSCO</p>
      </div>

      {/* BCV Rate banner */}
      {bcvRate !== 'N/A' && (
        <div className="bg-[#111111] border border-[#C9A84C]/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <DollarSign size={18} className="text-[#C9A84C]" />
          <div>
            <span className="text-white font-medium text-sm">Tasa BCV: </span>
            <span className="text-[#C9A84C] font-display text-lg">Bs. {bcvRate}/$</span>
            {bcvDate && <span className="text-[#6B7680] text-xs ml-2">({bcvDate})</span>}
          </div>
          <a href="/admin/configuracion" className="ml-auto text-xs text-[#6B7680] hover:text-[#C9A84C] transition-colors">Editar →</a>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${s.color}20`, border: `1px solid ${s.color}40` }}
              >
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <p className="font-display text-3xl tracking-wide" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-[#6B7680] text-xs mt-1">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6">
        <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-4">Accesos rápidos</p>
        <div className="flex gap-3 flex-wrap">
          <a href="/admin/productos" className="bg-[#C9A84C] text-black px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors">
            Gestionar productos
          </a>
          <a href="/admin/categorias" className="border border-[#1E1E1E] text-[#B0B8C1] px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-[#B0B8C1] transition-colors">
            Categorías
          </a>
          <a href="/admin/banners" className="border border-[#1E1E1E] text-[#B0B8C1] px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-[#B0B8C1] transition-colors">
            Banners
          </a>
          <a href="/admin/configuracion" className="border border-[#1E1E1E] text-[#B0B8C1] px-5 py-2 rounded-lg text-sm font-bold tracking-wider uppercase hover:border-[#B0B8C1] transition-colors">
            Configuración
          </a>
        </div>
      </div>
    </div>
  )
}
