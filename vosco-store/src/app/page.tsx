import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Hero from '@/components/store/Hero'
import ProductLines from '@/components/store/ProductLines'
import Catalog from '@/components/store/Catalog'
import AboutSection from '@/components/store/AboutSection'
import Testimonials from '@/components/store/Testimonials'
import ContactSection from '@/components/store/ContactSection'
import Footer from '@/components/store/Footer'
import { Product } from '@/types'

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    return (data as Product[]) || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductLines />
        <Catalog products={products} />
        <AboutSection />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
