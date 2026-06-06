import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import Catalog from '@/components/store/Catalog'
import { Product } from '@/types'

export const metadata = {
  title: 'Repuestos para Camiones — VOSCO',
  description: 'Repuestos, componentes y accesorios para camiones de trabajo en Venezuela. Para flotas, transportistas y talleres.',
}

async function getRepuestos(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('line', 'repuestos')
      .eq('active', true)
      .order('created_at', { ascending: false })
    return (data as Product[]) || []
  } catch {
    return []
  }
}

export default async function RepuestosPage() {
  const products = await getRepuestos()

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
            <p className="text-[#6B7680] max-w-xl italic">
              "Sin vueltas, con la pieza que necesitas."
            </p>
          </div>
        </div>
        <Catalog products={products} />
      </main>
      <Footer />
    </>
  )
}
