import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Catalog from '@/components/store/Catalog'
import { Product, Category, ProductLine } from '@/types'

export const metadata = {
  title: 'Repuestos para Camiones — VOSCO',
  description: 'Repuestos, componentes y accesorios para camiones de trabajo en Venezuela. Para flotas, transportistas y talleres.',
}

async function getData() {
  try {
    const supabase = await createClient()
    const [{ data: products }, { data: categories }, { data: lines }] = await Promise.all([
      supabase.from('products').select('*').eq('line', 'repuestos').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('line_slug', 'repuestos').eq('active', true).order('sort_order'),
      supabase.from('product_lines').select('*').eq('slug', 'repuestos').single(),
    ])
    return {
      products: (products as Product[]) || [],
      categories: (categories as Category[]) || [],
      slogan: (lines as ProductLine | null)?.slogan || 'La pieza que no puede fallar cuando el trabajo lo exige',
    }
  } catch {
    return { products: [], categories: [], slogan: 'La pieza que no puede fallar cuando el trabajo lo exige' }
  }
}

export default async function RepuestosPage() {
  const { products, categories, slogan } = await getData()

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="bg-[#0A0A0A] py-20 px-6 border-b border-[#1E1E1E]">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-[#B0B8C1] text-xs tracking-[0.4em] uppercase mb-4">Línea 02</p>
            <h1 className="font-display text-6xl md:text-7xl text-white tracking-wider mb-4">
              REPUESTOS PARA<br />CAMIONES
            </h1>
            <p className="text-[#6B7680] max-w-xl italic mb-8">"{slogan}"</p>
            {/* Line switcher */}
            <div className="flex gap-3">
              <Link
                href="/luces"
                className="border border-[#1E1E1E] text-[#C9A84C] px-5 py-2 text-xs font-bold tracking-widest uppercase rounded hover:border-[#C9A84C] transition-colors duration-200"
              >
                ← Ver Luces
              </Link>
              <span className="bg-[#B0B8C1] text-black px-5 py-2 text-xs font-bold tracking-widest uppercase rounded">
                Repuestos
              </span>
            </div>
          </div>
        </div>
        <Catalog products={products} categories={categories} defaultLine="repuestos" hideLineFilter />
      </main>
      <Footer />
    </>
  )
}
