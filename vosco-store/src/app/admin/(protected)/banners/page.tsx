import { createClient } from '@/lib/supabase/server'
import BannersManager from '@/components/admin/BannersManager'

export const metadata = { title: 'Banners — Admin VOSCO' }

export default async function BannersPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('banners').select('*').order('sort_order')
  return <BannersManager initialBanners={data || []} />
}
