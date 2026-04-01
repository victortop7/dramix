import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import DramaCard from '../components/DramaCard'
import { api } from '../lib/api'
import type { Drama } from '../types'

const CATEGORY_NAMES: Record<string, string> = {
  'novos': 'Novos Na Plataforma',
  'dublados': 'Dublados',
  'romance': 'Romance',
  'suspense': 'Suspense',
  'comedia': 'Comédia',
  'acao': 'Ação',
  'animes': 'Animes',
  'bl-gl': 'BL & GL',
  'identidade-escondida': 'Identidade Escondida',
  'amor-primeira-vista': 'Amor à Primeira Vista',
  'bebes-gravidezes': 'Bebês e Gravidezes',
  'relacionamento-tabu': 'Relacionamento Tabu',
  'homem-lobo-vampiro': 'Homem-lobo e Vampiro',
}

export default function Categoria() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [dramas, setDramas] = useState<Drama[]>([])
  const [loading, setLoading] = useState(true)

  const title = slug ? (CATEGORY_NAMES[slug] ?? slug) : ''

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.dramas.byCategory(slug)
      .then(({ categories }) => {
        const cat = categories[0]
        setDramas(cat?.dramas ?? [])
      })
      .catch(() => setDramas([]))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }} className="px-4 md:px-10 pb-16">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 fade-up">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div style={{ width: 4, height: 24, borderRadius: 2, background: 'var(--accent)', flexShrink: 0 }} />
            <h1 className="text-xl md:text-2xl font-extrabold" style={{ color: '#fff' }}>{title}</h1>
          </div>
          {!loading && (
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {dramas.length} drama{dramas.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />
            ))}
          </div>
        ) : dramas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 fade-up"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            <p className="text-base">Nenhum drama nesta categoria ainda</p>
          </div>
        ) : (
          <div className="grid gap-3 fade-up" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {dramas.map((d, i) => (
              <DramaCard key={d.id} drama={d} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
