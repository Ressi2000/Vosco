import { createClient } from '@/lib/supabase/server'
import SuppliersManager from '@/components/admin/SuppliersManager'
import { Supplier } from '@/types'

export const metadata = { title: 'Proveedores — Admin VOSCO' }

export default async function ProveedoresPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('suppliers').select('*').order('name')
  return <SuppliersManager initialSuppliers={(data as Supplier[]) || []} />
}
