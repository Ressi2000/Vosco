import { createClient } from '@/lib/supabase/server'
import LinesManager from '@/components/admin/LinesManager'

export const metadata = { title: 'Líneas de Producto — Admin VOSCO' }

export default async function LineasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('product_lines').select('*').order('sort_order')
  return <LinesManager initialLines={data || []} />
}
