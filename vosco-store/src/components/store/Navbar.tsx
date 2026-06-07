'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/store/cart'
import CurrencySwitcher from './CurrencySwitcher'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/luces', label: 'Luces' },
  { href: '/repuestos', label: 'Repuestos' },
  { href: '/#nosotros', label: 'Nosotros' },
  { href: '/#contacto', label: 'Contacto' },
]

export default function Navbar({ logoUrl, whatsapp: _whatsapp }: { logoUrl?: string; whatsapp?: string } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { openCart, itemCount } = useCart()
  const count = itemCount()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1E1E1E]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src={logoUrl || '/vosco.png'}
              alt="VOSCO"
              width={80}
              height={32}
              className="mix-blend-screen object-contain"
              style={{ height: 'auto' }}
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[#B0B8C1] hover:text-[#C9A84C] transition-colors duration-200 text-sm tracking-wider font-medium uppercase"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <CurrencySwitcher />
              <Link
                href="/#catalogo"
                className="bg-[#C9A84C] text-black px-5 py-2 text-sm font-bold tracking-wider uppercase hover:bg-[#F0D98A] transition-colors duration-200 rounded"
              >
                Ver Catálogo
              </Link>
            </div>
            <button
              onClick={openCart}
              className="relative p-2 text-white hover:text-[#C9A84C] transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart size={22} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-[#C9A84C] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden text-white"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col pt-20 px-8 gap-6 md:hidden"
          >
            <div className="mb-2">
              <CurrencySwitcher />
            </div>
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-display tracking-widest text-white hover:text-[#C9A84C] transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/#catalogo"
              onClick={() => setMobileOpen(false)}
              className="mt-4 bg-[#C9A84C] text-black px-6 py-3 text-center font-bold tracking-wider uppercase rounded"
            >
              Ver Catálogo
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
