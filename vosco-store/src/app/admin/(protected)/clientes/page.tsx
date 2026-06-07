import { createClient } from '@/lib/supabase/server'
import CustomersManager from '@/components/admin/CustomersManager'
import { Customer } from '@/types'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false })
  return <CustomersManager initialCustomers={(data as Customer[]) || []} />
}
