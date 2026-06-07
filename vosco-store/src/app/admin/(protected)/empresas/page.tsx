import { createClient } from '@/lib/supabase/server'
import CompaniesManager from '@/components/admin/CompaniesManager'

export const metadata = { title: 'Empresas — Admin VOSCO' }

export default async function EmpresasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('companies').select('*').order('sort_order')
  return <CompaniesManager initialCompanies={data || []} />
}
