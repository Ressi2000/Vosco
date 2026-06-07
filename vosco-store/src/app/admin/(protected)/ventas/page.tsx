import { createClient } from '@/lib/supabase/server'
import SalesManager from '@/components/admin/SalesManager'
import { Sale, Customer, Product } from '@/types'

export default async function VentasPage() {
  const supabase = await createClient()
  const [{ data: sales }, { data: customers }, { data: products }, { data: settings }] = await Promise.all([
    supabase.from('sales').select('*').order('created_at', { ascending: false }),
    supabase.from('customers').select('*').order('name'),
    supabase.from('products').select('*').eq('active', true).order('name'),
    supabase.from('settings').select('*').eq('key', 'bcv_rate').single(),
  ])

  const bcvRate = settings ? parseFloat((settings as any).value) : 36.5

  return (
    <SalesManager
      initialSales={(sales as Sale[]) || []}
      customers={(customers as Customer[]) || []}
      products={(products as Product[]) || []}
      bcvRate={bcvRate}
    />
  )
}
