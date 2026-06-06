'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart } from '@/store/cart'
import { buildWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart()
  const count = itemCount()
  const totalAmount = total()

  const handleWhatsApp = () => {
    const message = buildWhatsAppMessage(items, totalAmount)
    window.open(getWhatsAppUrl(message), '_blank')
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/70 z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111111] border-l border-[#1E1E1E] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#C9A84C]" />
                <h2 className="font-display text-xl tracking-wider text-white">
                  CARRITO ({count})
                </h2>
              </div>
              <button onClick={closeCart} className="text-[#6B7680] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 text-center"
                  >
                    <ShoppingBag size={48} className="text-[#2E2E2E]" />
                    <p className="text-[#6B7680]">Tu carrito está vacío</p>
                  </motion.div>
                ) : (
                  items.map(({ product, quantity }) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 bg-[#0A0A0A] rounded-xl p-4 border border-[#1E1E1E]"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#1E1E1E] flex-shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium line-clamp-2">{product.name}</p>
                        <p className="text-[#C9A84C] font-display text-base mt-1">
                          ${(product.price * quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="w-6 h-6 rounded bg-[#1E1E1E] flex items-center justify-center text-white hover:bg-[#2E2E2E] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-white text-sm font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="w-6 h-6 rounded bg-[#1E1E1E] flex items-center justify-center text-white hover:bg-[#2E2E2E] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-[#6B7680] hover:text-red-400 transition-colors self-start"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#1E1E1E] space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7680] tracking-wider uppercase text-sm">Total</span>
                  <span className="font-display text-2xl text-[#C9A84C] tracking-wide">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-xl font-bold tracking-wider uppercase text-sm hover:bg-[#22bf5e] transition-colors"
                >
                  <MessageCircle size={18} />
                  Pedir por WhatsApp
                </button>
                <p className="text-[#6B7680] text-xs text-center">
                  Te redirigiremos a WhatsApp con tu pedido listo.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
