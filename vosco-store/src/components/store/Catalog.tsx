'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Search } from 'lucide-react'
import { Product, ProductLine } from '@/types'
import ProductCard from './ProductCard'

type Filter = 'all' | ProductLine

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'luces', label: 'Luces' },
  { value: 'repuestos', label: 'Repuestos' },
]

export default function Catalog({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const filtered = useMemo(() => {
    let list = products
    if (active !== 'all') list = list.filter(p => p.line === active)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [products, active, search])

  return (
    <section id="catalogo" className="bg-[#0A0A0A] py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Productos</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider mb-8">CATÁLOGO</h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex rounded-lg border border-[#1E1E1E] overflow-hidden">
              {filters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setActive(f.value)}
                  className={`px-5 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-200 ${
                    active === f.value
                      ? 'bg-[#C9A84C] text-black'
                      : 'text-[#6B7680] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors w-56"
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[#6B7680] py-20"
            >
              No se encontraron productos.
            </motion.p>
          ) : (
            <motion.div
              key={`${active}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
