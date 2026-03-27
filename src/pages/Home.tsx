import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CategoryRow from '../components/CategoryRow'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { FeaturedDrama, CategoryWithDramas } from '../types'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<FeaturedDrama | null>(null)
  const [categories, setCategories] = useState<CategoryWithDramas[]>([])
  const [loading, setLoading] = useState(true)
  const [pwaPrompt, setPwaPrompt] = useState(true)

  useEffect(() => {
    Promise.all([
      api.dramas.featured().catch(() => ({ drama: null })),
      api.dramas.byCategory().catch(() => ({ categories: [] })),
    ]).then(([{ drama }, { categories: cats }]) => {
      setFeatured(drama as FeaturedDrama | null)
      setCategories(cats)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* PWA install banner */}
      {pwaPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30
          flex items-center gap-3 px-4 py-3 rounded-2xl fade-up"
          style={{
            background: 'linear-gradient(135deg, #4f46e5, var(--accent))',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Download size={18} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Instale o app Dramix</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Toque aqui para ter acesso mais rápido</p>
          </div>
          <button
            onClick={() => setPwaPrompt(false)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', cursor: 'pointer' }}>
            Instalar →
          </button>
          <button onClick={() => setPwaPrompt(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>
            ×
          </button>
        </div>
      )}

      {/* Hero */}
      {loading ? (
        <div className="skeleton w-full" style={{ height: 'clamp(380px, 55vw, 560px)', marginTop: 'var(--navbar-h)' }} />
      ) : featured ? (
        <HeroSection drama={featured} />
      ) : (
        <div className="w-full flex items-center justify-center"
          style={{ height: 'clamp(380px, 55vw, 560px)', marginTop: 'var(--navbar-h)', background: 'var(--surface)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Nenhum destaque configurado</p>
        </div>
      )}

      {/* Paywall banner */}
      {user && user.plan === 'free' && (
        <div className="mx-4 md:mx-8 my-6 rounded-2xl flex items-center justify-between gap-4 px-6 py-4 fade-up"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))',
            border: '1px solid var(--accent-dim)',
          }}>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>🎬 Acesso ilimitado por R$14,90/mês</p>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Assista todos os dramas sem interrupções</p>
          </div>
          <button className="btn-primary flex-shrink-0" onClick={() => navigate('/assinatura')}>
            Assinar agora
          </button>
        </div>
      )}

      {/* Search bar mobile */}
      <div className="px-4 md:hidden mb-6 mt-4">
        <button
          onClick={() => navigate('/buscar')}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-left"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          🔍 Buscar dramas...
        </button>
      </div>

      {/* Category rows */}
      <div className="pb-16 mt-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-8 px-4 md:px-8">
              <div className="skeleton h-5 w-40 rounded mb-4" />
              <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="skeleton rounded-xl flex-shrink-0"
                    style={{ width: 150, aspectRatio: '2/3' }} />
                ))}
              </div>
            </div>
          ))
        ) : (
          categories.map(cat => (
            <CategoryRow
              key={cat.id}
              title={cat.name}
              dramas={cat.dramas}
              seeAllSlug={cat.slug}
            />
          ))
        )}
      </div>
    </div>
  )
}
