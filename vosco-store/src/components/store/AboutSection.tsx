'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Shield, Zap, Star, Settings, Truck, Award } from 'lucide-react'

const values = [
  { icon: Zap, label: 'Rendimiento', desc: 'Productos que cumplen lo que prometen, sin excusas.' },
  { icon: Shield, label: 'Confianza', desc: 'El cliente vuelve porque sabe que no fallamos.' },
  { icon: Star, label: 'Estilo', desc: 'Lo funcional puede ser bello. El detalle hace la diferencia.' },
  { icon: Settings, label: 'Precisión', desc: 'Cada pieza encaja. Cero improvisación, máxima compatibilidad.' },
  { icon: Truck, label: 'Trabajo Real', desc: 'Conocemos la ruta. Productos para el trabajo de verdad.' },
  { icon: Award, label: 'Destaque', desc: 'Ayudamos a que cada vehículo y su dueño sobresalga donde va.' },
]

const stats = [
  { value: '500+', label: 'Clientes atendidos' },
  { value: '5+', label: 'Años en el rubro' },
  { value: '2', label: 'Líneas de producto' },
  { value: '100%', label: 'Satisfacción garantizada' },
]

export default function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="nosotros" className="bg-[#0A0A0A] py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Quiénes somos</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider mb-6">NOSOTROS</h2>
          <p className="text-[#6B7680] max-w-2xl mx-auto italic text-lg">
            "VOSCO no solo vende piezas — vende confianza."
          </p>
        </motion.div>

        {/* Mission / Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              tag: 'MISIÓN',
              title: '¿Para qué existimos?',
              text: 'Proveer soluciones de iluminación y repuestos de alta calidad para vehículos y camiones, ayudando a conductores y empresas del transporte venezolano a destacar, rendir y circular con seguridad en cada ruta.',
            },
            {
              tag: 'VISIÓN',
              title: '¿Hacia dónde vamos?',
              text: 'Convertirnos en la marca de referencia en personalización vehicular e insumos para el transporte en Venezuela, reconocida por la calidad de sus productos y por entender de verdad las necesidades de quienes viven en la ruta.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.tag}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-8"
            >
              <p className="text-[#C9A84C] text-xs tracking-[0.35em] uppercase mb-3">{item.tag}</p>
              <h3 className="text-white font-bold text-xl mb-4">{item.title}</h3>
              <p className="text-[#6B7680] leading-relaxed text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {values.map((v, i) => {
            const Icon = v.icon
            return (
              <motion.div
                key={v.label}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                className="group bg-[#111111] border border-[#1E1E1E] hover:border-[#C9A84C]/40 rounded-xl p-6 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mb-4 group-hover:bg-[#C9A84C]/20 transition-colors">
                  <Icon size={18} className="text-[#C9A84C]" />
                </div>
                <p className="text-white font-bold text-sm mb-2">{v.label}</p>
                <p className="text-[#6B7680] text-xs leading-relaxed">{v.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-4xl text-[#C9A84C] tracking-wide">{s.value}</p>
              <p className="text-[#6B7680] text-xs tracking-widest uppercase mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
