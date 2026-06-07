import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }))
        } else {
          set(s => ({ items: [...s.items, { product, quantity: 1 }] }))
        }
        set({ isOpen: true })
      },
      removeItem: (productId) =>
        set(s => ({ items: s.items.filter(i => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set(s => ({
          items: quantity === 0
            ? s.items.filter(i => i.product.id !== productId)
            : s.items.map(i => i.product.id === productId ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'vosco-cart' }
  )
)
