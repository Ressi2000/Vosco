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

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  created_at: string
}

export interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  price_usd: number
}

export type SaleStatus = 'pending' | 'completed' | 'cancelled'

export interface Sale {
  id: string
  customer_id?: string
  customer_name?: string
  items: SaleItem[]
  total_usd: number
  total_bs: number
  bcv_rate: number
  status: SaleStatus
  notes?: string
  created_at: string
  customer?: Customer
}

export type DeliveryStatus = 'pending' | 'delivered'

export interface DeliveryNote {
  id: string
  sale_id: string
  customer_id?: string
  status: DeliveryStatus
  notes?: string
  created_at: string
  delivered_at?: string
  sale?: Sale
  customer?: Customer
}
