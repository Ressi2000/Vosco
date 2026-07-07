import { createClient } from '@/lib/supabase/server'
import ProductEditor from '@/components/admin/ProductEditor'
import { ProductOption } from '@/types'

export const metadata = { title: 'Nuevo Producto — Admin VOSCO' }

export default async function NuevoProductoPage() {
  const supabase = await createClient()
  const { data: options } = await supabase.from('product_options').select('*').eq('active', true).order('sort_order')
  return <ProductEditor options={(options as ProductOption[]) || []} />
}
