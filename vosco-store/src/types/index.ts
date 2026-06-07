export type ProductLineName = 'luces' | 'repuestos'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  price_bs?: number
  line: ProductLineName
  category: string
  images: string[]
  stock: number
  featured: boolean
  specs?: Record<string, string>
  created_at: string
  on_sale?: boolean
  sale_price?: number
  sale_ends_at?: string
  category_id?: string
  vehicle_compat?: Array<{ brand: string; model: string; year_from?: number; year_to?: number }>
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

export interface Category {
  id: string
  name: string
  slug: string
  line_slug: string
  active: boolean
  sort_order: number
}

export interface ProductLine {
  id: string
  name: string
  slug: string
  slogan: string
  description: string
  color: string
  active: boolean
  sort_order: number
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url?: string
  cta_label?: string
  cta_href?: string
  line_slug?: string
  bg_color: string
  active: boolean
  sort_order: number
}

export interface Company {
  id: string
  name: string
  logo_url?: string
  description?: string
  active: boolean
  sort_order: number
}

export interface Setting {
  key: string
  value: string
  label?: string
  updated_at: string
}
