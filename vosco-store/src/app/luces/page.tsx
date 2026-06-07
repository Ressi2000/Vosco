import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Catalog from '@/components/store/Catalog'
import { Product, Category, ProductLine } from '@/types'

export const metadata = {
  title: 'Luces para Vehículos — VOSCO',
  description: 'Kits LED, faros, barras de luz y accesorios de iluminación para autos, SUVs, camionetas y motos en Venezuela.',
}

async function getData() {
  try {
    const supabase = await createClient()
    const [{ data: products }, { data: categories }, { data: lines }] = await Promise.all([
      supabase.from('products').select('*').eq('line', 'luces').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('line_slug', 'luces').eq('active', true).order('sort_order'),
      supabase.from('product_lines').select('*').eq('slug', 'luces').single(),
    ])
    return {
      products: (products as Product[]) || [],
      categories: (categories as Category[]) || [],
      slogan: (lines as ProductLine | null)?.slogan || 'Ilumina tu camino y destaca tu estilo',
    }
  } catch {
    return { products: [], categories: [], slogan: 'Ilumina tu camino y destaca tu estilo' }
  }
}

export default async function LucesPage() {
  const { products, categories, slogan } = await getData()

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="bg-[#0A0A0A] py-20 px-6 border-b border-[#1E1E1E]">
          <div className="max-w-[1200px] mx-auto">
            <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Línea 01</p>
            <h1 className="font-display text-6xl md:text-7xl text-white tracking-wider mb-4">
              LUCES PARA<br />VEHÍCULOS
            </h1>
            <p className="text-[#6B7680] max-w-xl italic mb-8">"{slogan}"</p>
            {/* Line switcher */}
            <div className="flex gap-3">
              <span className="bg-[#C9A84C] text-black px-5 py-2 text-xs font-bold tracking-widest uppercase rounded">
                Luces
              </span>
              <Link
                href="/repuestos"
                className="border border-[#1E1E1E] text-[#B0B8C1] px-5 py-2 text-xs font-bold tracking-widest uppercase rounded hover:border-[#B0B8C1] transition-colors duration-200"
              >
                Ver Repuestos →
              </Link>
            </div>
          </div>
        </div>
        <Catalog products={products} categories={categories} defaultLine="luces" hideLineFilter />
      </main>
      <Footer />
    </>
  )
}
