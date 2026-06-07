import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle, ExternalLink } from 'lucide-react'

interface Social { platform: string; url: string }
interface FooterProps {
  slogan?: string
  logoUrl?: string
  socials?: Social[]
  whatsapp?: string
}

export default function Footer({
  slogan = 'VOSCO — Fuerza en la ruta, estilo en la calle.',
  logoUrl,
  socials = [],
  whatsapp = '584141234567',
}: FooterProps) {
  const instagramUrl = socials.find(s => s.platform === 'instagram')?.url || 'https://instagram.com/vosco'
  const tiktokUrl = socials.find(s => s.platform === 'tiktok')?.url
  const facebookUrl = socials.find(s => s.platform === 'facebook')?.url

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1E1E1E] py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <Image src={logoUrl} alt="VOSCO" width={40} height={40} className="object-contain mix-blend-screen" />
              ) : (
                <Image src="/vosco.png" alt="VOSCO" width={40} height={40} className="object-contain mix-blend-screen" />
              )}
              <span className="font-display text-xl tracking-widest text-white">VOSCO</span>
            </div>
            <p className="text-[#6B7680] text-xs leading-relaxed">{slogan}</p>
          </div>

          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase mb-4">Navegación</p>
            <div className="flex flex-col gap-2">
              {[['/', 'Inicio'], ['/luces', 'Luces'], ['/repuestos', 'Repuestos'], ['/#nosotros', 'Nosotros'], ['/#contacto', 'Contacto']].map(([href, label]) => (
                <Link key={href} href={href} className="text-[#6B7680] hover:text-[#C9A84C] text-sm transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase mb-4">Redes</p>
            <div className="flex gap-3 flex-wrap">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#6B7680] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-colors" title="Instagram">
                <ExternalLink size={16} />
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#6B7680] hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors" title="WhatsApp">
                <MessageCircle size={16} />
              </a>
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#6B7680] hover:text-white hover:border-white/20 transition-colors" title="TikTok">
                  <ExternalLink size={16} />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#6B7680] hover:text-[#1877F2] hover:border-[#1877F2]/40 transition-colors" title="Facebook">
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E1E1E] pt-6 flex flex-col md:flex-row justify-between gap-2">
          <p className="text-[#6B7680] text-xs">© {new Date().getFullYear()} VOSCO. Venezuela. Todos los derechos reservados.</p>
          <Link href="/admin" className="text-[#1E1E1E] hover:text-[#6B7680] text-xs transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  )
}
