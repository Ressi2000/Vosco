export type ProductLine = 'luces' | 'repuestos'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  price_bs?: number
  line: ProductLine
  category: string
  images: string[]
  stock: number
  featured: boolean
  specs?: Record<string, string>
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  avatar_url?: string
  rating: number
}

export interface CartItem {
  product: Product
  quantity: number
}
