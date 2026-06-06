import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Catalog from '@/components/store/Catalog'
import { Product } from '@/types'

export const metadata = {
  title: 'Luces para Vehículos — VOSCO',
  description: 'Kits LED, faros, barras de luz y accesorios de iluminación para autos, SUVs, camionetas y motos en Venezuela.',
}

async function getLuces(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('line', 'luces')
      .eq('active', true)
      .order('created_at', { ascending: false })
    return (data as Product[]) || []
  } catch {
    return []
  }
}

export default async function LucesPage() {
  const products = await getLuces()

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
            <p className="text-[#6B7680] max-w-xl italic">
              "Haz que te vean antes de que llegues."
            </p>
          </div>
        </div>
        <Catalog products={products} />
      </main>
      <Footer />
    </>
  )
}
