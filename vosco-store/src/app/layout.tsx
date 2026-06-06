import type { Metadata } from 'next'
import './globals.css'
import CartDrawer from '@/components/store/CartDrawer'

export const metadata: Metadata = {
  title: 'VOSCO — Iluminación y Repuestos Vehiculares · Venezuela',
  description:
    'Soluciones de iluminación y repuestos de alta calidad para vehículos y camiones en Venezuela. Kits LED, faros, repuestos para flotas y transportistas.',
  keywords: 'luces LED vehiculares, repuestos camiones Venezuela, tuning vehicular, VOSCO',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#F5F5F0]">
        {children}
        <CartDrawer />
      </body>
    </html>
  )
}
