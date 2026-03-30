import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import type { FeaturedDrama } from '../types'
import { formatViews } from '../lib/format'

interface Props {
  dramas: FeaturedDrama[]
}

export default function HeroSection({ dramas }: Props) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const goTo = useCallback((next: number) => {
    setVisible(false)
    setTimeout(() => {
      setIndex(next)
      setVisible(true)
    }, 300)
  }, [])

  const prev = () => goTo((index - 1 + dramas.length) % dramas.length)
  const next = useCallback(() => goTo((index + 1) % dramas.length), [index, dramas.length, goTo])

  useEffect(() => {
    if (dramas.length <= 1) return
    const t = setInterval(next, 6000)
    return () => clearInterval(t)
  }, [dramas.length, next])

  if (!dramas.length) return null
  const drama = dramas[index]

  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: 'clamp(380px, 55vw, 560px)', marginTop: 'var(--navbar-h)' }}>

      {/* Background image */}
      {drama.thumbnailUrl && (
        <img
          key={drama.id + '-bg'}
          src={drama.thumbnailUrl}
          alt={drama.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 20%', filter: 'brightness(0.55)', transition: 'opacity 0.3s ease', opacity: visible ? 1 : 0 }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, rgba(10,10,15,0.88) 30%, rgba(10,10,15,0.4) 60%, rgba(10,10,15,0.1) 100%), linear-gradient(to top, rgba(10,10,15,0.85) 0%, transparent 45%)' }} />

      {/* Card flutuante direita */}
      {drama.thumbnailUrl && (
        <div className="absolute hidden md:flex items-center justify-center"
          style={{
            right: 0, top: 0, bottom: 0, width: '40%',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
          <img
            key={drama.id + '-card'}
            src={drama.thumbnailUrl}
            alt={drama.title}
            style={{
              height: '78%',
              width: 'auto',
              aspectRatio: '2/3',
              objectFit: 'cover',
              borderRadius: 20,
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 md:px-10 md:pr-[42%]"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}>

        {drama.tags && drama.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {drama.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          {drama.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span className="text-sm font-semibold" style={{ color: '#f59e0b', fontFamily: 'var(--mono)' }}>
                {drama.rating.toFixed(1)}
              </span>
            </div>
          )}
          {drama.views > 0 && (
            <div className="flex items-center gap-1">
              <Eye size={13} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                {formatViews(drama.views)}
              </span>
            </div>
          )}
        </div>

        <h1 className="font-extrabold leading-tight mb-3 max-w-xl"
          style={{ fontSize: 'clamp(22px, 4vw, 42px)', color: 'var(--text)' }}>
          {drama.title}
        </h1>

        {drama.description && (
          <p className="text-sm leading-relaxed mb-6 max-w-lg line-clamp-3"
            style={{ color: 'var(--text-dim)' }}>
            {drama.description}
          </p>
        )}

        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(`/watch/${drama.id}`)} className="btn-primary text-sm px-6 py-3">
            <Play size={16} fill="white" /> Assistir Agora
          </button>
          <button onClick={() => navigate(`/drama/${drama.id}`)} className="btn-secondary text-sm px-6 py-3">
            Ver Detalhes
          </button>
        </div>

        {/* Dots + arrows — linha separada */}
        {dramas.length > 1 && (
          <div className="flex items-center gap-2">
            <button onClick={prev} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {dramas.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
            <button onClick={next} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
