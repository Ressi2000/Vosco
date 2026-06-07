import { createClient } from '@/lib/supabase/server'
import ConfiguracionManager from '@/components/admin/ConfiguracionManager'

export const metadata = { title: 'Configuración — Admin VOSCO' }

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('*')
  return <ConfiguracionManager initialSettings={data || []} />
}
