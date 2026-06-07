import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/store/Navbar'
import Hero from '@/components/store/Hero'
import ProductLines from '@/components/store/ProductLines'
import Catalog from '@/components/store/Catalog'
import FeaturedProducts from '@/components/store/FeaturedProducts'
import OffersSection from '@/components/store/OffersSection'
import BannerSection from '@/components/store/BannerSection'
import CompaniesSection from '@/components/store/CompaniesSection'
import CurrencyInit from '@/components/store/CurrencyInit'
import AboutSection from '@/components/store/AboutSection'
import Testimonials from '@/components/store/Testimonials'
import ContactSection from '@/components/store/ContactSection'
import Footer from '@/components/store/Footer'
import { Product, Banner, Company } from '@/types'

async function getData() {
  try {
    const supabase = await createClient()
    const [
      { data: products },
      { data: banners },
      { data: companies },
      { data: settings },
    ] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('banners').select('*').eq('active', true).order('sort_order'),
      supabase.from('companies').select('*').eq('active', true).order('sort_order'),
      supabase.from('settings').select('*').in('key', ['bcv_rate', 'bcv_date']),
    ])

    const bcvRate = settings?.find(s => s.key === 'bcv_rate')?.value
    const bcvDate = settings?.find(s => s.key === 'bcv_date')?.value

    return {
      products: (products as Product[]) || [],
      banners: (banners as Banner[]) || [],
      companies: (companies as Company[]) || [],
      bcvRate: bcvRate ? parseFloat(bcvRate) : 36.5,
      bcvDate: bcvDate || '',
    }
  } catch {
    return { products: [], banners: [], companies: [], bcvRate: 36.5, bcvDate: '' }
  }
}

export default async function HomePage() {
  const { products, banners, companies, bcvRate, bcvDate } = await getData()

  const featured = products.filter(p => p.featured)
  const onSale = products.filter(p => p.on_sale && p.sale_price != null)

  return (
    <>
      <CurrencyInit rate={bcvRate} date={bcvDate} />
      <Navbar />
      <main>
        <Hero />
        <BannerSection banners={banners} />
        <ProductLines />
        <FeaturedProducts products={featured} />
        <OffersSection products={onSale} />
        <Catalog products={products} />
        <CompaniesSection companies={companies} />
        <AboutSection />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}
