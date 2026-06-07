'use client'

import { useEffect } from 'react'
import { useCurrency } from '@/store/currency'

export default function CurrencyInit({ rate, date }: { rate: number; date: string }) {
  const setRate = useCurrency(s => s.setRate)

  useEffect(() => {
    if (rate > 0) {
      setRate(rate, date)
    }
  }, [rate, date, setRate])

  return null
}
