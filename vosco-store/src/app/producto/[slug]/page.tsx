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
  const subtitle = product.line === 'luces'
    ? product.tipo || product.category
    : product.vehicle_compat?.map(v => v.brand).filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i).join(', ') || product.category

  const fichaTecnica: [string, string][] = []
  if (product.codigo_vosco) fichaTecnica.push(['Código Vosco', product.codigo_vosco])
  if (product.codigo_oem) fichaTecnica.push(['Código OEM', product.codigo_oem])
  if (product.line === 'repuestos' && product.codigo_original_mitsubishi) fichaTecnica.push(['Código original Mitsubishi', product.codigo_original_mitsubishi])
  if (product.line === 'luces' && product.nombre_ingles) fichaTecnica.push(['Nombre en inglés', product.nombre_ingles])
  if (product.line === 'luces' && product.bases) fichaTecnica.push(['Bases', product.bases])
  if (product.largo_cm && product.ancho_cm && product.alto_cm) {
    fichaTecnica.push(['Medidas (L x A x A, cm)', `${product.largo_cm} x ${product.ancho_cm} x ${product.alto_cm}`])
  }
  if (product.peso_kg) fichaTecnica.push(['Peso', `${product.peso_kg} kg`])
  if (product.cbm) fichaTecnica.push(['CBM', `${product.cbm.toFixed(6)} m³`])
  if (product.line === 'repuestos' && product.vehicle_compat && product.vehicle_compat.length > 0) {
    fichaTecnica.push(['Aplica a', product.vehicle_compat.map(v => `${v.brand} ${v.model}`.trim()).join(', ')])
  }

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
                  {product.line === 'luces' ? 'LÍNEA 01 · LUCES' : 'LÍNEA 02 · REPUESTOS'}{subtitle ? ` · ${subtitle}` : ''}
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

              {fichaTecnica.length > 0 && (
                <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-5">
                  <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Ficha técnica</p>
                  <div className="space-y-2">
                    {fichaTecnica.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 text-sm">
                        <span className="text-[#6B7680]">{k}</span>
                        <span className="text-white text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
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
