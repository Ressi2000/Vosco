import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CurrencyStore {
  mode: 'usd' | 'bs'
  rate: number
  rateDate: string
  setMode: (mode: 'usd' | 'bs') => void
  setRate: (rate: number, date: string) => void
  format: (priceUsd: number) => string
}

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      mode: 'usd',
      rate: 36.5,
      rateDate: '',
      setMode: (mode) => set({ mode }),
      setRate: (rate, rateDate) => set({ rate, rateDate }),
      format: (priceUsd) => {
        const { mode, rate } = get()
        if (mode === 'bs') {
          return `Bs. ${(priceUsd * rate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`
        }
        return `$${priceUsd.toFixed(2)}`
      },
    }),
    { name: 'vosco-currency' }
  )
)
