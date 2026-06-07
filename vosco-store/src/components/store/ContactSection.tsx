'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { MessageCircle, Send, ExternalLink } from 'lucide-react'

export default function ContactSection({ whatsapp = '584141234567' }: { whatsapp?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleWhatsApp = () => {
    const msg = `Hola VOSCO! Soy ${form.name}.\n\n${form.message}`
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <section id="contacto" className="bg-[#0A0A0A] py-24 px-6 border-t-2 border-[#C9A84C]">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Left */}
          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Hablemos</p>
            <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider mb-6">CONTACTO</h2>
            <p className="text-[#6B7680] leading-relaxed mb-8 text-sm">
              ¿No sabes cuál lleva tu camión? ¿Tienes dudas sobre una referencia?
              Mándanos un mensaje y te respondemos directo.
            </p>
            <div className="flex flex-col gap-4">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-[#22bf5e] transition-colors w-fit"
              >
                <MessageCircle size={18} />
                WhatsApp directo
              </a>
              <a
                href="https://instagram.com/vosco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-[#1E1E1E] text-[#B0B8C1] px-6 py-3 rounded-lg font-bold tracking-wider uppercase text-sm hover:border-[#B0B8C1] transition-colors w-fit"
              >
                <ExternalLink size={18} />
                @vosco
              </a>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-8 space-y-5"
          >
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Nombre</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Tu nombre"
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm placeholder-[#6B7680] focus:border-[#C9A84C] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Mensaje</label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="¿En qué te podemos ayudar?"
                rows={4}
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm placeholder-[#6B7680] focus:border-[#C9A84C] outline-none transition-colors resize-none"
              />
            </div>
            <button
              onClick={handleWhatsApp}
              disabled={!form.name || !form.message}
              className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-[#F0D98A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              {sent ? '¡Mensaje enviado!' : 'Enviar por WhatsApp'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
