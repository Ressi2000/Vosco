'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
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

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
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
