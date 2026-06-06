import { createClient } from '@/lib/supabase/server'
import ProductsManager from '@/components/admin/ProductsManager'
import { Product } from '@/types'

export default async function AdminProductos() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return <ProductsManager initialProducts={(data as Product[]) || []} />
}
