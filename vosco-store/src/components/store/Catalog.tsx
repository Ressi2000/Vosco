'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Product, ProductLineName, Category } from '@/types'
import ProductCard from './ProductCard'

type LineFilter = 'all' | ProductLineName
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

const lineFilters: { value: LineFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'luces', label: 'Luces' },
  { value: 'repuestos', label: 'Repuestos' },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
]

interface CatalogProps {
  products: Product[]
  categories?: Category[]
  defaultLine?: 'luces' | 'repuestos' | 'all'
  hideLineFilter?: boolean
}

function ActiveBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-1.5 bg-[#C9A84C] text-black text-[10px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center">
      {count}
    </span>
  )
}

export default function Catalog({ products, categories, defaultLine = 'all', hideLineFilter = false }: CatalogProps) {
  const [activeLine, setActiveLine] = useState<LineFilter>(defaultLine)
  const [activeCat, setActiveCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyOffers, setOnlyOffers] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999])
  const [activeBrand, setActiveBrand] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 100), [products])

  // Unique vehicle brands from repuestos products
  const vehicleBrands = useMemo(() => {
    const brands = new Set<string>()
    products
      .filter(p => p.line === 'repuestos' && p.vehicle_compat)
      .forEach(p => p.vehicle_compat?.forEach(v => brands.add(v.brand)))
    return Array.from(brands).sort()
  }, [products])

  const visibleCategories = useMemo(() => {
    if (!categories) return []
    if (activeLine === 'all') return categories
    return categories.filter(c => c.line_slug === activeLine)
  }, [categories, activeLine])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (activeCat !== 'all') count++
    if (onlyInStock) count++
    if (onlyOffers) count++
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++
    if (activeBrand !== 'all') count++
    return count
  }, [activeCat, onlyInStock, onlyOffers, priceRange, maxPrice, activeBrand])

  const filtered = useMemo(() => {
    let list = products
    if (activeLine !== 'all') list = list.filter(p => p.line === activeLine)
    if (activeCat !== 'all') list = list.filter(p => p.category === activeCat || p.category_id === activeCat)
    if (onlyInStock) list = list.filter(p => p.stock > 0)
    if (onlyOffers) list = list.filter(p => p.on_sale)
    if (activeBrand !== 'all') list = list.filter(p => p.vehicle_compat?.some(v => v.brand === activeBrand))
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'price_asc': return [...list].sort((a, b) => a.price - b.price)
      case 'price_desc': return [...list].sort((a, b) => b.price - a.price)
      case 'name_asc': return [...list].sort((a, b) => a.name.localeCompare(b.name))
      default: return list
    }
  }, [products, activeLine, activeCat, onlyInStock, onlyOffers, priceRange, search, sort, activeBrand])

  const clearAll = () => {
    setActiveCat('all')
    setOnlyInStock(false)
    setOnlyOffers(false)
    setPriceRange([0, maxPrice])
    setActiveBrand('all')
  }

  return (
    <section id="catalogo" className="bg-[#0A0A0A] py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.4em] uppercase mb-4">Productos</p>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-wider mb-8">CATÁLOGO</h2>
        </motion.div>

        {/* Top bar */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Line filter */}
            {!hideLineFilter && (
              <div className="flex rounded-lg border border-[#1E1E1E] overflow-hidden">
                {lineFilters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => { setActiveLine(f.value); setActiveCat('all'); setActiveBrand('all') }}
                    className={`px-5 py-2 text-xs font-bold tracking-widest uppercase transition-colors duration-200 ${
                      activeLine === f.value ? 'bg-[#C9A84C] text-black' : 'text-[#6B7680] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold tracking-wider uppercase transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-[#1E1E1E] text-[#6B7680] hover:text-white'
              }`}
            >
              <SlidersHorizontal size={14} />
              Filtros
              <ActiveBadge count={activeFilterCount} />
            </button>

            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-[#6B7680] hover:text-red-400 transition-colors">
                <X size={12} /> Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="appearance-none bg-[#111111] border border-[#1E1E1E] rounded-lg pl-4 pr-8 py-2 text-xs text-[#B0B8C1] focus:border-[#C9A84C] outline-none transition-colors cursor-pointer"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7680] pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7680]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="bg-[#111111] border border-[#1E1E1E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-[#6B7680] outline-none focus:border-[#C9A84C] transition-colors w-44"
              />
            </div>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Categories */}
                {visibleCategories.length > 0 && (
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Categoría</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setActiveCat('all')}
                        className={`text-left text-xs py-1 transition-colors ${activeCat === 'all' ? 'text-[#C9A84C] font-bold' : 'text-[#6B7680] hover:text-white'}`}
                      >
                        Todas
                      </button>
                      {visibleCategories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCat(cat.slug)}
                          className={`text-left text-xs py-1 transition-colors ${activeCat === cat.slug ? 'text-[#C9A84C] font-bold' : 'text-[#6B7680] hover:text-white'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price range */}
                <div>
                  <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Precio (USD)</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded px-2 py-1.5 text-xs text-white focus:border-[#C9A84C] outline-none"
                        placeholder="Mín"
                      />
                      <span className="text-[#6B7680] text-xs">—</span>
                      <input
                        type="number"
                        min={priceRange[0]}
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full bg-[#0A0A0A] border border-[#1E1E1E] rounded px-2 py-1.5 text-xs text-white focus:border-[#C9A84C] outline-none"
                        placeholder="Máx"
                      />
                    </div>
                    <p className="text-[#6B7680] text-[10px]">${priceRange[0]} — ${priceRange[1]}</p>
                  </div>
                </div>

                {/* Vehicle brand (only repuestos) */}
                {(activeLine === 'repuestos' || activeLine === 'all') && vehicleBrands.length > 0 && (
                  <div>
                    <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Marca vehicular</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setActiveBrand('all')}
                        className={`text-left text-xs py-1 transition-colors ${activeBrand === 'all' ? 'text-[#C9A84C] font-bold' : 'text-[#6B7680] hover:text-white'}`}
                      >
                        Todas
                      </button>
                      {vehicleBrands.map(brand => (
                        <button
                          key={brand}
                          onClick={() => setActiveBrand(brand)}
                          className={`text-left text-xs py-1 transition-colors ${activeBrand === brand ? 'text-[#C9A84C] font-bold' : 'text-[#6B7680] hover:text-white'}`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div>
                  <p className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3">Estado</p>
                  <div className="space-y-3">
                    {[
                      { label: 'En stock', value: onlyInStock, set: setOnlyInStock },
                      { label: 'Solo ofertas', value: onlyOffers, set: setOnlyOffers },
                    ].map(toggle => (
                      <label key={toggle.label} className="flex items-center gap-3 cursor-pointer">
                        <div
                          onClick={() => toggle.set(v => !v)}
                          className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${toggle.value ? 'bg-[#C9A84C]' : 'bg-[#1E1E1E]'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full mt-0.5 mx-0.5 transition-transform ${toggle.value ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-[#B0B8C1] text-xs">{toggle.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-[#6B7680] text-xs mb-6">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 ? ' con los filtros aplicados' : ''}
        </p>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-[#6B7680] mb-4">No se encontraron productos.</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} className="text-[#C9A84C] text-sm underline">Limpiar filtros</button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`${activeLine}-${activeCat}-${search}-${sort}-${onlyInStock}-${onlyOffers}-${activeBrand}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
