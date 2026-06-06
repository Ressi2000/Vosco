import Link from 'next/link'
import { ExternalLink, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1E1E1E] py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 100 100">
                <polygon points="50,5 95,95 50,70 5,95" fill="white" />
                <polygon points="50,30 75,80 50,65 25,80" fill="#0A0A0A" />
              </svg>
              <span className="font-display text-xl tracking-widest text-white">VOSCO</span>
            </div>
            <p className="text-[#6B7680] text-xs leading-relaxed">
              VOSCO — Fuerza en la ruta, estilo en la calle.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase mb-4">Navegación</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/luces', label: 'Luces' },
                { href: '/repuestos', label: 'Repuestos' },
                { href: '/#nosotros', label: 'Nosotros' },
                { href: '/#contacto', label: 'Contacto' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="text-[#6B7680] hover:text-[#C9A84C] text-sm transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase mb-4">Redes</p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/vosco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#6B7680] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors"
              >
                <ExternalLink size={16} />
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '584141234567'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#6B7680] hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E1E1E] pt-6 flex flex-col md:flex-row justify-between gap-2">
          <p className="text-[#6B7680] text-xs">© 2025 VOSCO. Venezuela. Todos los derechos reservados.</p>
          <Link href="/admin" className="text-[#1E1E1E] hover:text-[#6B7680] text-xs transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
