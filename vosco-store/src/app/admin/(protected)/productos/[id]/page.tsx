import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductEditor from '@/components/admin/ProductEditor'
import { Product, ProductOption } from '@/types'

export const metadata = { title: 'Editar Producto — Admin VOSCO' }

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: product }, { data: options }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('product_options').select('*').eq('active', true).order('sort_order'),
  ])

  if (!product) notFound()

  return <ProductEditor product={product as Product} options={(options as ProductOption[]) || []} />
}
