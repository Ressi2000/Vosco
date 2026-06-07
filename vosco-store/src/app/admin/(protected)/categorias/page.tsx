import { createClient } from '@/lib/supabase/server'
import CategoriesManager from '@/components/admin/CategoriesManager'

export const metadata = { title: 'Categorías — Admin VOSCO' }

export default async function CategoriasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return <CategoriesManager initialCategories={data || []} />
}
