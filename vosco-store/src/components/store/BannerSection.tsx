'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Banner } from '@/types'

export default function BannerSection({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length)
    }, 5000)
    return () => clearInterval(id)
  }, [banners.length])

  if (banners.length === 0) return null

  const banner = banners[current]

  return (
    <section className="relative h-80 md:h-[420px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: banner.bg_color }}
        >
          {banner.image_url && (
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover opacity-40"
            />
          )}
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-display text-5xl md:text-7xl text-white tracking-wider mb-4"
            >
              {banner.title}
            </motion.h2>
            {banner.subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-[#F5F5F0]/80 text-lg mb-8"
              >
                {banner.subtitle}
              </motion.p>
            )}
            {banner.cta_label && banner.cta_href && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Link
                  href={banner.cta_href}
                  className="inline-block bg-[#C9A84C] text-black px-8 py-3 font-bold tracking-widest uppercase text-sm rounded hover:bg-[#F0D98A] transition-colors duration-200"
                >
                  {banner.cta_label}
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-[#C9A84C]' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
