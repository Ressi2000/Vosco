'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 2,
}))

export interface HeroConfig {
  logoUrl?: string
  slogan?: string
  badge?: string
  cta1Label?: string
  cta1Href?: string
  cta2Label?: string
  cta2Href?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
}

export default function Hero({
  logoUrl,
  slogan    = 'Ilumina tu camino y destaca tu estilo',
  badge     = 'Venezuela · Iluminación Vehicular',
  cta1Label = 'Ver Luces',
  cta1Href  = '/luces',
  cta2Label = 'Ver Repuestos',
  cta2Href  = '/repuestos',
  stat1Value = '500+',  stat1Label = 'Clientes',
  stat2Value = '2',     stat2Label = 'Líneas',
  stat3Value = '100%',  stat3Label = 'Confianza',
}: HeroConfig) {
  const stats = [
    { value: stat1Value, label: stat1Label },
    { value: stat2Value, label: stat2Label },
    { value: stat3Value, label: stat3Label },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#B0B8C1]/5 blur-[80px]" />
      </div>

      {/* Texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#C9A84C]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: 'backOut' }}
          className="flex justify-center mb-8"
        >
          <Image
            src={logoUrl || '/vosco.png'}
            alt="VOSCO"
            width={120}
            height={120}
            className="object-contain mix-blend-screen"
          />
        </motion.div>

        {/* Texts */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
          {badge && (
            <p className="text-[#C9A84C] text-sm tracking-[0.4em] uppercase font-medium mb-4">{badge}</p>
          )}
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white tracking-wider leading-none mb-4">
            VOSCO
          </h1>
          {slogan && (
            <p className="text-[#F5F5F0]/70 text-xl md:text-2xl font-light italic mb-10">"{slogan}"</p>
          )}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {cta1Label && (
            <Link
              href={cta1Href}
              className="bg-[#C9A84C] text-black px-8 py-4 font-bold tracking-widest uppercase text-sm rounded hover:bg-[#F0D98A] transition-colors duration-300"
            >
              {cta1Label}
            </Link>
          )}
          {cta2Label && (
            <Link
              href={cta2Href}
              className="border border-[#B0B8C1] text-[#B0B8C1] px-8 py-4 font-bold tracking-widest uppercase text-sm rounded hover:border-white hover:text-white transition-colors duration-300"
            >
              {cta2Label}
            </Link>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 flex justify-center gap-12 text-center"
        >
          {stats.filter(s => s.value && s.label).map(s => (
            <div key={s.label}>
              <p className="font-display text-3xl text-[#C9A84C] tracking-wider">{s.value}</p>
              <p className="text-[#6B7680] text-xs tracking-widest uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <ChevronDown className="text-[#C9A84C]/60" size={28} />
      </motion.div>
    </section>
  )
}
