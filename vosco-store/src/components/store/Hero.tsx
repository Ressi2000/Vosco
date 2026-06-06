'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
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

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A84C]/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#B0B8C1]/5 blur-[80px]" />
      </div>

      {/* Diagonal lines texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#C9A84C]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo animado */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: 'backOut' }}
          className="flex justify-center mb-8"
        >
          <svg width="80" height="80" viewBox="0 0 100 100">
            <motion.polygon
              points="50,5 95,95 50,70 5,95"
              fill="white"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
            />
            <polygon points="50,30 75,80 50,65 25,80" fill="#0A0A0A" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <p className="text-[#C9A84C] text-sm tracking-[0.4em] uppercase font-medium mb-4">
            Venezuela · Iluminación Vehicular
          </p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white tracking-wider leading-none mb-4">
            VOSCO
          </h1>
          <p className="text-[#F5F5F0]/70 text-xl md:text-2xl font-light italic mb-10">
            "Ilumina tu camino y destaca tu estilo"
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/luces"
            className="group relative bg-[#C9A84C] text-black px-8 py-4 font-bold tracking-widest uppercase text-sm rounded overflow-hidden hover:bg-[#F0D98A] transition-colors duration-300"
          >
            <span className="relative z-10">Ver Luces</span>
          </Link>
          <Link
            href="/repuestos"
            className="border border-[#B0B8C1] text-[#B0B8C1] px-8 py-4 font-bold tracking-widest uppercase text-sm rounded hover:border-white hover:text-white transition-colors duration-300"
          >
            Ver Repuestos
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 flex justify-center gap-12 text-center"
        >
          {[
            { value: '500+', label: 'Clientes' },
            { value: '2', label: 'Líneas' },
            { value: '100%', label: 'Confianza' },
          ].map(s => (
            <div key={s.label}>
              <p className="font-display text-3xl text-[#C9A84C] tracking-wider">{s.value}</p>
              <p className="text-[#6B7680] text-xs tracking-widest uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
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
