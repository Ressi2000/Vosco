'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { Company } from '@/types'

export default function CompaniesSection({ companies }: { companies: Company[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  if (companies.length === 0) return null

  return (
    <section className="bg-[#0A0A0A] py-20 px-6 border-t border-[#1E1E1E]">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-3">Clientes</p>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wider">
            EMPRESAS QUE CONFÍAN EN NOSOTROS
          </h2>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {companies.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex items-center justify-center bg-[#111111] border border-[#1E1E1E] rounded-xl px-8 py-5 min-w-[160px] hover:border-[#C9A84C]/30 transition-colors duration-300"
            >
              {company.logo_url ? (
                <div className="relative w-32 h-12">
                  <Image
                    src={company.logo_url}
                    alt={company.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ) : (
                <span className="font-display text-xl text-[#6B7680] tracking-widest hover:text-[#C9A84C] transition-colors duration-300">
                  {company.name.toUpperCase()}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
