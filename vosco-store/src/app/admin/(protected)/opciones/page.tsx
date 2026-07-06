import { createClient } from '@/lib/supabase/server'
import ProductOptionsManager from '@/components/admin/ProductOptionsManager'
import { ProductOption } from '@/types'

export const metadata = { title: 'Opciones de Producto — Admin VOSCO' }

export default async function OpcionesPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('product_options').select('*').order('sort_order')
  return <ProductOptionsManager initialOptions={(data as ProductOption[]) || []} />
}
