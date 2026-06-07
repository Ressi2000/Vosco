'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Zap, Wrench, ArrowRight } from 'lucide-react'

const lines = [
  {
    id: 'luces',
    icon: Zap,
    tag: 'LÍNEA 01',
    title: 'Luces para Vehículos',
    slogan: 'Ilumina tu camino y destaca tu estilo',
    description:
      'Kits de luces LED, faros, barras de luz, luces de cortesía y accesorios de iluminación para autos, SUVs, camionetas y motos.',
    cta: 'Ver Luces',
    href: '/luces',
    accent: '#C9A84C',
    accentLight: '#F0D98A',
    border: 'border-[#C9A84C]/30',
    hover: 'hover:border-[#C9A84C]',
    tagColor: 'text-[#C9A84C]',
  },
  {
    id: 'repuestos',
    icon: Wrench,
    tag: 'LÍNEA 02',
    title: 'Repuestos para Camiones',
    slogan: 'La pieza que no puede fallar',
    description:
      'Repuestos, componentes y accesorios para camiones de trabajo. Calidad probada, disponibilidad rápida, asesoría directa.',
    cta: 'Ver Repuestos',
    href: '/repuestos',
    accent: '#B0B8C1',
    accentLight: '#DCE3E9',
    border: 'border-[#B0B8C1]/30',
    hover: 'hover:border-[#B0B8C1]',
    tagColor: 'text-[#B0B8C1]',
  },
]

function LineCard({ line, index }: { line: typeof lines[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const Icon = line.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      className={`group relative bg-[#111111] border ${line.border} ${line.hover} rounded-xl p-8 flex flex-col gap-6 transition-all duration-300 cursor-default`}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${line.accent}15 0%, transparent 60%)` }}
      />

      <div className="relative">
        <p className={`text-xs tracking-[0.35em] uppercase font-medium mb-4 ${line.tagColor}`}>
          {line.tag}
        </p>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-5"
          style={{ backgroundColor: `${line.accent}20`, border: `1px solid ${line.accent}40` }}
        >
          <Icon size={22} style={{ color: line.accent }} />
        </div>
        <h3 className="font-display text-3xl text-white tracking-wide mb-2">{line.title}</h3>
        <p className="italic text-sm mb-4" style={{ color: line.accent }}>
          "{line.slogan}"
        </p>
        <p className="text-[#6B7680] text-sm leading-relaxed">{line.description}</p>
      </div>

      <Link
        href={line.href}
        className="inline-flex items-center gap-2 font-bold text-sm tracking-wider uppercase transition-colors duration-200 group/link"
        style={{ color: line.accent }}
      >
        {line.cta}
        <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform duration-200" />
      </Link>
    </motion.div>
  )
}

export default function ProductLines() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="bg-[#111111] py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Una sola marca, dos voces</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider">
            LÍNEAS DE NEGOCIO
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {lines.map((l, i) => <LineCard key={l.id} line={l} index={i} />)}
        </div>
      </div>
    </section>
  )
}
