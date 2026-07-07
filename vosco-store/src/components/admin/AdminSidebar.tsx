'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, LogOut, ExternalLink,
  Tag, ListChecks, Image, Building2, MessageSquare, Settings,
  Users, ShoppingBag, Factory, ClipboardList, Ship
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const topItem = { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' }

const navGroups = [
  {
    label: 'Negocio',
    items: [
      { href: '/admin/productos', icon: Package, label: 'Productos' },
      { href: '/admin/opciones', icon: ListChecks, label: 'Marcas y Tipos' },
      { href: '/admin/proveedores', icon: Factory, label: 'Proveedores' },
      { href: '/admin/compras', icon: ClipboardList, label: 'Órdenes de Compra' },
      { href: '/admin/embarques', icon: Ship, label: 'Embarques' },
      { href: '/admin/clientes', icon: Users, label: 'Clientes' },
      { href: '/admin/ventas', icon: ShoppingBag, label: 'Ventas' },
    ],
  },
  {
    label: 'Página pública',
    items: [
      { href: '/admin/banners', icon: Image, label: 'Banners' },
      { href: '/admin/categorias', icon: Tag, label: 'Categorías' },
      { href: '/admin/empresas', icon: Building2, label: 'Empresas' },
      { href: '/admin/testimonios', icon: MessageSquare, label: 'Testimonios' },
      { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="w-60 bg-[#111111] border-r border-[#1E1E1E] flex flex-col min-h-screen">
      <div className="p-6 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 100 100">
            <polygon points="50,5 95,95 50,70 5,95" fill="white" />
            <polygon points="50,30 75,80 50,65 25,80" fill="#111111" />
          </svg>
          <div>
            <p className="font-display text-lg tracking-widest text-white leading-none">VOSCO</p>
            <p className="text-[#6B7680] text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {(() => {
          const Icon = topItem.icon
          const active = pathname === topItem.href
          return (
            <Link
              href={topItem.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30'
                  : 'text-[#6B7680] hover:text-white hover:bg-[#1E1E1E]'
              }`}
            >
              <Icon size={16} />
              {topItem.label}
            </Link>
          )
        })()}

        {navGroups.map(group => (
          <div key={group.label} className="pt-4">
            <p className="px-4 pb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#3A3A3A]">{group.label}</p>
            {group.items.map(item => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30'
                      : 'text-[#6B7680] hover:text-white hover:bg-[#1E1E1E]'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1E1E1E] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#6B7680] hover:text-white hover:bg-[#1E1E1E] transition-colors"
        >
          <ExternalLink size={16} />
          Ver tienda
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#6B7680] hover:text-red-400 hover:bg-[#1E1E1E] transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
