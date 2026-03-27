import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import DramaCard from '../components/DramaCard'
import { api } from '../lib/api'
import type { Drama } from '../types'

export default function Search() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Drama[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      api.dramas.search(query)
        .then(({ dramas }) => setResults(dramas))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 400)
  }, [query])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'calc(var(--navbar-h) + 24px)' }} className="px-4 md:px-8 pb-16">

        {/* Search input */}
        <div className="flex items-center gap-3 mb-8 fade-up">
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
          <div className="relative flex-1 max-w-xl">
            <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              className="input pl-10 pr-10"
              placeholder="Buscar dramas..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />
            ))}
          </div>
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 fade-up">
            <SearchIcon size={40} style={{ color: 'var(--text-muted)' }} />
            <p className="text-base font-semibold" style={{ color: 'var(--text-dim)' }}>
              Nenhum resultado para "{query}"
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Tente outro termo de busca
            </p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm mb-4 fade-up" style={{ color: 'var(--text-muted)' }}>
              {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((d, i) => (
                <DramaCard key={d.id} drama={d} index={i} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-24 fade-up"
            style={{ color: 'var(--text-muted)' }}>
            <SearchIcon size={40} />
            <p className="text-base">Digite para buscar dramas</p>
          </div>
        )}
      </div>
    </div>
  )
}
