'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/store/cart'

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const accent = product.line === 'luces' ? '#C9A84C' : '#B0B8C1'
  const img = product.images[0] || '/placeholder-product.jpg'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group bg-[#111111] border border-[#1E1E1E] hover:border-[#2E2E2E] rounded-xl overflow-hidden flex flex-col transition-colors duration-300"
    >
      <Link href={`/producto/${product.slug}`} className="relative aspect-square overflow-hidden bg-[#0A0A0A]">
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Line badge */}
        <div
          className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
        >
          {product.line === 'luces' ? 'LUCES' : 'REPUESTOS'}
        </div>
        {/* Overlay on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <span className="flex items-center gap-2 text-white text-sm font-medium">
            <Eye size={16} /> Ver producto
          </span>
        </motion.div>
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <p className="text-[#6B7680] text-xs tracking-widest uppercase">{product.category}</p>
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{product.name}</h3>
        <p className="text-[#6B7680] text-xs leading-relaxed line-clamp-2">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#1E1E1E]">
          <div>
            <p className="font-display text-xl tracking-wide" style={{ color: accent }}>
              ${product.price.toFixed(2)}
            </p>
            {product.price_bs && (
              <p className="text-[#6B7680] text-xs">Bs. {product.price_bs.toLocaleString()}</p>
            )}
          </div>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.92 }}
            disabled={product.stock === 0}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors duration-200 disabled:opacity-40"
            style={
              added
                ? { backgroundColor: '#22c55e', color: 'white' }
                : { backgroundColor: accent, color: '#0A0A0A' }
            }
          >
            <ShoppingCart size={14} />
            {product.stock === 0 ? 'Agotado' : added ? 'Agregado' : 'Agregar'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
