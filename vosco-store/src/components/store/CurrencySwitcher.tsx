'use client'

import { useCurrency } from '@/store/currency'

export default function CurrencySwitcher() {
  const { mode, setMode, rate, rateDate } = useCurrency()

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded border border-[#1E1E1E] overflow-hidden text-xs font-bold tracking-widest uppercase">
        <button
          onClick={() => setMode('usd')}
          className={`px-3 py-1.5 transition-colors duration-200 ${
            mode === 'usd' ? 'bg-[#C9A84C] text-black' : 'text-[#6B7680] hover:text-white'
          }`}
        >
          USD
        </button>
        <button
          onClick={() => setMode('bs')}
          className={`px-3 py-1.5 transition-colors duration-200 ${
            mode === 'bs' ? 'bg-[#C9A84C] text-black' : 'text-[#6B7680] hover:text-white'
          }`}
        >
          Bs
        </button>
      </div>
      {mode === 'bs' && rate > 0 && (
        <span className="text-[10px] text-[#6B7680] hidden sm:block">
          Bs.{rate.toFixed(2)}/$
          {rateDate && <span className="ml-1">({rateDate})</span>}
        </span>
      )}
    </div>
  )
}
