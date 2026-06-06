'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, MessageCircle } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/store/cart'
import { buildWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp'

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const accent = product.line === 'luces' ? '#C9A84C' : '#B0B8C1'

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    const message = buildWhatsAppMessage([{ product, quantity: 1 }], product.price)
    window.open(getWhatsAppUrl(message), '_blank')
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleAdd}
        disabled={product.stock === 0}
        className="flex items-center justify-center gap-3 py-4 rounded-xl font-bold tracking-wider uppercase text-sm transition-colors disabled:opacity-40"
        style={{ backgroundColor: added ? '#22c55e' : accent, color: '#0A0A0A' }}
      >
        <ShoppingCart size={18} />
        {product.stock === 0 ? 'Agotado' : added ? '¡Agregado al carrito!' : 'Agregar al carrito'}
      </motion.button>
      <button
        onClick={handleBuyNow}
        disabled={product.stock === 0}
        className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-xl font-bold tracking-wider uppercase text-sm hover:bg-[#22bf5e] transition-colors disabled:opacity-40"
      >
        <MessageCircle size={18} />
        Comprar por WhatsApp
      </button>
    </div>
  )
}
