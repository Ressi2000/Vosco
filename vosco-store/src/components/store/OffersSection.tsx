'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Clock } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/store/cart'
import { useCurrency } from '@/store/currency'

function Countdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expirada'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  return (
    <span className="flex items-center gap-1 text-orange-400 text-xs font-mono">
      <Clock size={10} /> {timeLeft}
    </span>
  )
}

function OfferCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const format = useCurrency(s => s.format)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const img = product.images[0] || '/placeholder-product.jpg'
  const accent = product.line === 'luces' ? '#C9A84C' : '#B0B8C1'

  return (
    <div className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-xl overflow-hidden flex flex-col">
      <Link href={`/producto/${product.slug}`} className="relative aspect-video overflow-hidden bg-[#111111]">
        <Image src={img} alt={product.name} fill className="object-cover transition-transform duration-500 hover:scale-105" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded"
        >
          OFERTA
        </motion.div>
      </Link>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <p className="text-[#6B7680] text-xs tracking-widest uppercase">{product.category}</p>
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
        {product.sale_ends_at && <Countdown endsAt={product.sale_ends_at} />}
        <div className="mt-auto pt-3 border-t border-[#1E1E1E] flex items-center justify-between">
          <div>
            <p className="text-[#6B7680] text-xs line-through">{format(product.price)}</p>
            <p className="font-display text-2xl text-orange-400 tracking-wide">{format(product.sale_price!)}</p>
          </div>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.92 }}
            disabled={product.stock === 0}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors duration-200 disabled:opacity-40"
            style={added ? { backgroundColor: '#22c55e', color: 'white' } : { backgroundColor: accent, color: '#0A0A0A' }}
          >
            <ShoppingCart size={14} />
            {product.stock === 0 ? 'Agotado' : added ? 'Agregado' : 'Agregar'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default function OffersSection({ products }: { products: Product[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const onSale = products.filter(p => p.on_sale && p.sale_price != null)
  if (onSale.length === 0) return null

  return (
    <section className="bg-[#111111] py-24 px-6 border-t border-b border-[#C9A84C]/20">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-3">Tiempo limitado</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider">OFERTAS</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {onSale.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <OfferCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
