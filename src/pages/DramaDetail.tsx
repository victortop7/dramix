import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Play, Heart, HeartOff, Star, Eye, Clock, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { formatViews, formatDuration } from '../lib/format'
import type { Drama } from '../types'

export default function DramaDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, hasAccess } = useAuth()
  const navigate = useNavigate()
  const [drama, setDrama] = useState<Drama | null>(null)
  const [inList, setInList] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.dramas.get(id)
      .then(({ drama: d }) => setDrama(d))
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const toggleList = async () => {
    if (!profile || !drama) return
    if (inList) {
      await api.list.remove(profile.id, drama.id)
      setInList(false)
    } else {
      await api.list.add(profile.id, drama.id)
      setInList(true)
    }
  }

  const handleWatch = () => {
    if (!user) { navigate('/login'); return }
    if (!hasAccess()) { navigate('/assinatura'); return }
    navigate(`/watch/${drama?.id}`)
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }} className="px-4 md:px-10">
          <div className="skeleton h-8 w-32 rounded mb-8" />
          <div className="flex gap-8">
            <div className="skeleton rounded-2xl flex-shrink-0" style={{ width: 220, height: 330 }} />
            <div className="flex-1 flex flex-col gap-4">
              <div className="skeleton h-8 w-64 rounded" />
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-20 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!drama) return null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Background blur */}
      {drama.thumbnailUrl && (
        <div className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${drama.thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) brightness(0.2)',
          }} />
      )}

      <div style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }} className="px-4 md:px-10 pb-16">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-8"
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex flex-col md:flex-row gap-8 max-w-4xl fade-up">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ width: 'min(220px, 45vw)', aspectRatio: '2/3', background: 'var(--surface-alt)' }}>
              {drama.thumbnailUrl ? (
                <img src={drama.thumbnailUrl} alt={drama.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {drama.isDubbed && <span className="badge badge-red">DUBLADO</span>}
              {drama.isNew && <span className="badge badge-green">Novo</span>}
              {drama.isExclusive && <span className="badge badge-amber">Exclusivo</span>}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
              {drama.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4">
              {drama.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span className="text-sm font-semibold" style={{ color: '#f59e0b', fontFamily: 'var(--mono)' }}>
                    {drama.rating.toFixed(1)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                  {formatViews(drama.views)} visualizações
                </span>
              </div>
              {drama.durationSeconds && (
                <div className="flex items-center gap-1">
                  <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                    {formatDuration(drama.durationSeconds)}
                  </span>
                </div>
              )}
            </div>

            {/* Categories */}
            {drama.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {drama.categories.map(c => (
                  <span key={c.id} className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'var(--surface-alt)', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {drama.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)', maxWidth: 560 }}>
                {drama.description}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button onClick={handleWatch} className="btn-primary px-8 py-3">
                <Play size={16} fill="white" />
                {hasAccess() ? 'Assistir' : 'Assinar para assistir'}
              </button>
              {user && profile && (
                <button onClick={() => void toggleList()} className="btn-secondary px-4 py-3"
                  title={inList ? 'Remover da lista' : 'Adicionar à lista'}>
                  {inList ? <HeartOff size={18} style={{ color: 'var(--red)' }} /> : <Heart size={18} />}
                </button>
              )}
            </div>

            {!hasAccess() && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Assine a partir de R$15,90/mês para assistir sem limites.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
