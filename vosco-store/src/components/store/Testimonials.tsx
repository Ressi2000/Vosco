'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'
import { Testimonial } from '@/types'

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  if (testimonials.length === 0) return null

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
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Lo que dicen</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider">CONFIANZA</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => {
            const initials = t.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl p-7 flex gap-5"
              >
                <div className="w-12 h-12 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] font-bold text-sm flex-shrink-0">
                  {t.avatar_url
                    ? <img src={t.avatar_url} alt={t.name} className="w-full h-full rounded-full object-cover" />
                    : initials}
                </div>
                <div>
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={12} className="fill-[#C9A84C] text-[#C9A84C]" />
                    ))}
                  </div>
                  <p className="text-[#F5F5F0] text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-[#6B7680] text-xs">{t.role}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
