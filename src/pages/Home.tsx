import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import CategoryRow from '../components/CategoryRow'
import WelcomeModal from '../components/WelcomeModal'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { FeaturedDrama, CategoryWithDramas, WatchProgress } from '../types'

export default function Home() {
  const { user, profile, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState<FeaturedDrama[]>([])
  const [categories, setCategories] = useState<CategoryWithDramas[]>([])
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  // Mostra modal só para visitantes sem conta, após auth carregar, e só uma vez por dispositivo
  useEffect(() => {
    if (authLoading) return
    if (!user && !localStorage.getItem('dramix_welcome_dismissed')) {
      setShowWelcome(true)
    }
  }, [authLoading, user])

  useEffect(() => {
    Promise.all([
      api.dramas.featured().catch(() => ({ dramas: [], drama: null })),
      api.dramas.byCategory().catch(() => ({ categories: [] })),
    ]).then(([{ dramas: feat }, { categories: cats }]) => {
      setFeatured((feat ?? []) as FeaturedDrama[])
      setCategories(cats)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!profile) return
    api.history.list(profile.id)
      .then(({ dramas }) => setContinueWatching(dramas.filter(d => d.progressSeconds > 10)))
      .catch(() => {})
  }, [profile])

  const dismissWelcome = () => {
    localStorage.setItem('dramix_welcome_dismissed', '1')
    setShowWelcome(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {showWelcome && <WelcomeModal onClose={dismissWelcome} />}
      <Navbar />


      {/* Hero */}
      {loading ? (
        <div className="skeleton w-full" style={{ height: 'clamp(380px, 55vw, 560px)', marginTop: 'var(--navbar-h)' }} />
      ) : featured.length > 0 ? (
        <HeroSection dramas={featured} />
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
            <p className="font-semibold" style={{ color: 'var(--text)' }}>🎬 Acesso ilimitado por R$15,90/mês</p>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Assista todos os dramas sem interrupções</p>
          </div>
          <button className="btn-primary flex-shrink-0" onClick={() => navigate('/assinatura')}>
            Assinar agora
          </button>
        </div>
      )}

      {/* Search bar mobile (só para assinantes) */}
      {user && (user.plan === 'basic' || user.plan === 'premium' || user.isAdmin) && (
        <div className="px-4 md:hidden mb-6 mt-4">
          <button
            onClick={() => navigate('/buscar')}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-left"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            🔍 Buscar dramas...
          </button>
        </div>
      )}

      {/* Continue assistindo */}
      {continueWatching.length > 0 && (
        <div className="px-4 md:px-8 mt-6 mb-2">
          <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>Continue assistindo</h2>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {continueWatching.map(d => {
              const pct = d.durationSeconds ? Math.round((d.progressSeconds / d.durationSeconds) * 100) : 0
              return (
                <div key={d.id} className="flex-shrink-0 cursor-pointer relative"
                  style={{ width: 150 }}
                  onClick={() => navigate(`/watch/${d.id}`)}>
                  <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '2/3' }}>
                    {d.thumbnailUrl
                      ? <img src={d.thumbnailUrl} alt={d.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full" style={{ background: 'var(--surface-alt)' }} />
                    }
                    {/* Overlay play */}
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.35)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <Play size={18} fill="white" color="white" />
                      </div>
                    </div>
                    {/* Barra de progresso */}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
                      <div className="h-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--text-dim)' }}>{d.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
