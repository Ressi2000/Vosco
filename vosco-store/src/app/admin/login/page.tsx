'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Credenciales incorrectas.')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <svg width="48" height="48" viewBox="0 0 100 100" className="mb-4">
            <polygon points="50,5 95,95 50,70 5,95" fill="white" />
            <polygon points="50,30 75,80 50,65 25,80" fill="#0A0A0A" />
          </svg>
          <h1 className="font-display text-3xl tracking-widest text-white">VOSCO ADMIN</h1>
          <p className="text-[#6B7680] text-xs mt-2">Panel de administración</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-8 space-y-5">
          <div>
            <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[#C9A84C] text-xs tracking-widest uppercase mb-2 block">Contraseña</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded-lg px-4 py-3 pr-10 text-white text-sm focus:border-[#C9A84C] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7680] hover:text-white transition-colors"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-black py-3 rounded-lg font-bold tracking-wider uppercase text-sm hover:bg-[#F0D98A] transition-colors disabled:opacity-50"
          >
            <LogIn size={16} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
