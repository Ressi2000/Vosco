import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import ProductActions from '@/components/store/ProductActions'
import { Product } from '@/types'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!data) notFound()
  const product = data as Product
  const accent = product.line === 'luces' ? '#C9A84C' : '#B0B8C1'

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Images */}
            <div className="aspect-square relative bg-[#111111] rounded-xl overflow-hidden border border-[#1E1E1E]">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#2E2E2E] font-display text-4xl tracking-widest">
                  VOSCO
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs tracking-[0.35em] uppercase mb-2" style={{ color: accent }}>
                  {product.line === 'luces' ? 'LÍNEA 01 · LUCES' : 'LÍNEA 02 · REPUESTOS'} · {product.category}
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide leading-tight mb-4">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl tracking-wide" style={{ color: accent }}>
                    ${product.price.toFixed(2)}
                  </span>
                  {product.price_bs && (
                    <span className="text-[#6B7680] text-sm">Bs. {product.price_bs.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <p className="text-[#B0B8C1] leading-relaxed text-sm border-l-2 pl-4" style={{ borderColor: accent }}>
                {product.description}
              </p>

              {product.stock > 0 ? (
                <p className="text-green-400 text-xs tracking-widest uppercase">
                  ✓ En stock ({product.stock} disponibles)
                </p>
              ) : (
                <p className="text-red-400 text-xs tracking-widest uppercase">✗ Agotado</p>
              )}

              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
                  <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Especificaciones</p>
                  <div className="space-y-2">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-[#6B7680]">{k}</span>
                        <span className="text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
