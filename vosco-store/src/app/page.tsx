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
import { Product, Banner, Company, Testimonial, Category } from '@/types'

async function getData() {
  try {
    const supabase = await createClient()
    const [
      { data: products },
      { data: banners },
      { data: companies },
      { data: settings },
      { data: testimonials },
      { data: categories },
    ] = await Promise.all([
      supabase.from('products').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('banners').select('*').eq('active', true).order('sort_order'),
      supabase.from('companies').select('*').eq('active', true).order('sort_order'),
      supabase.from('settings').select('*'),
      supabase.from('testimonials').select('*').eq('active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    ])

    const s = (key: string) => settings?.find((r: { key: string; value: string }) => r.key === key)?.value

    return {
      products: (products as Product[]) || [],
      banners: (banners as Banner[]) || [],
      companies: (companies as Company[]) || [],
      testimonials: (testimonials as Testimonial[]) || [],
      categories: (categories as Category[]) || [],
      bcvRate: s('bcv_rate') ? parseFloat(s('bcv_rate')!) : 36.5,
      bcvDate: s('bcv_date') || '',
      heroSlogan: s('hero_slogan') || 'Ilumina tu camino y destaca tu estilo',
      footerSlogan: s('footer_slogan') || 'VOSCO — Fuerza en la ruta, estilo en la calle.',
      logoUrl: s('logo_url') || undefined,
      whatsapp: s('whatsapp_number') || '584141234567',
      socials: [
        { platform: 'instagram', url: s('instagram_url') || 'https://instagram.com/vosco' },
        ...(s('tiktok_url') ? [{ platform: 'tiktok', url: s('tiktok_url')! }] : []),
        ...(s('facebook_url') ? [{ platform: 'facebook', url: s('facebook_url')! }] : []),
      ],
    }
  } catch {
    return {
      products: [], banners: [], companies: [], testimonials: [], categories: [],
      bcvRate: 36.5, bcvDate: '', heroSlogan: 'Ilumina tu camino y destaca tu estilo',
      footerSlogan: 'VOSCO — Fuerza en la ruta, estilo en la calle.',
      logoUrl: undefined, whatsapp: '584141234567', socials: [],
    }
  }
}

export default async function HomePage() {
  const { products, banners, companies, testimonials, categories, bcvRate, bcvDate, heroSlogan, footerSlogan, logoUrl, whatsapp, socials } = await getData()

  const featured = products.filter(p => p.featured)
  const onSale = products.filter(p => p.on_sale && p.sale_price != null)

  return (
    <>
      <CurrencyInit rate={bcvRate} date={bcvDate} />
      <Navbar logoUrl={logoUrl} whatsapp={whatsapp} />
      <main>
        <Hero slogan={heroSlogan} logoUrl={logoUrl} />
        <BannerSection banners={banners} />
        <ProductLines />
        {featured.length > 0 && <FeaturedProducts products={featured} />}
        {onSale.length > 0 && <OffersSection products={onSale} />}
        <Catalog products={products} categories={categories} />
        {companies.length > 0 && <CompaniesSection companies={companies} />}
        <AboutSection />
        <Testimonials testimonials={testimonials} />
        <ContactSection whatsapp={whatsapp} />
      </main>
      <Footer slogan={footerSlogan} logoUrl={logoUrl} socials={socials} whatsapp={whatsapp} />
    </>
  )
}
