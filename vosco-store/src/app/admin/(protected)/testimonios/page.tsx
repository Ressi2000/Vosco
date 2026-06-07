import { createClient } from '@/lib/supabase/server'
import TestimonialsManager from '@/components/admin/TestimonialsManager'

export const metadata = { title: 'Testimonios — Admin VOSCO' }

export default async function TestimoniosPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
  return <TestimonialsManager initialTestimonials={data || []} />
}
