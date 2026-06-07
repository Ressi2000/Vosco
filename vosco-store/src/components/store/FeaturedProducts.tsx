'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Product } from '@/types'
import ProductCard from './ProductCard'

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  if (products.length === 0) return null

  return (
    <section className="bg-[#111111] py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-3">Selección especial</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider">
            PRODUCTOS DESTACADOS
          </h2>
        </motion.div>

        {/* Mobile: horizontal scroll, Desktop: 4-col grid */}
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 scrollbar-hide">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="min-w-[280px] snap-start md:min-w-0"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
