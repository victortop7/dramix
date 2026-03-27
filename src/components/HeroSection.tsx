import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Star, Eye } from 'lucide-react'
import type { FeaturedDrama } from '../types'
import { formatViews } from '../lib/format'

interface Props {
  drama: FeaturedDrama
}

export default function HeroSection({ drama }: Props) {
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => { setLoaded(true) }, [])

  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: 'clamp(380px, 55vw, 560px)', marginTop: 'var(--navbar-h)' }}>

      {/* Background image */}
      {drama.thumbnailUrl && (
        <>
          <img
            src={drama.thumbnailUrl}
            alt={drama.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 20%', filter: 'brightness(0.45)' }}
          />
          {/* Right side poster */}
          <img
            src={drama.thumbnailUrl}
            alt=""
            aria-hidden
            className="absolute right-0 top-0 h-full object-cover hidden md:block"
            style={{
              width: '40%',
              objectPosition: 'top',
              mask: 'linear-gradient(to right, transparent 0%, black 40%)',
              WebkitMask: 'linear-gradient(to right, transparent 0%, black 40%)',
            }}
          />
        </>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,15,0.98) 35%, rgba(10,10,15,0.6) 65%, rgba(10,10,15,0.2) 100%), linear-gradient(to top, rgba(10,10,15,1) 0%, transparent 40%)',
        }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-10 px-4 md:px-10"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>

        {/* Tags */}
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

        {/* Meta */}
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

        {/* Title */}
        <h1 className="font-extrabold leading-tight mb-3 max-w-xl"
          style={{ fontSize: 'clamp(22px, 4vw, 42px)', color: 'var(--text)' }}>
          {drama.title}
        </h1>

        {/* Description */}
        {drama.description && (
          <p className="text-sm leading-relaxed mb-6 max-w-lg line-clamp-3"
            style={{ color: 'var(--text-dim)' }}>
            {drama.description}
          </p>
        )}

        {/* CTA */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/watch/${drama.id}`)}
            className="btn-primary text-sm px-6 py-3">
            <Play size={16} fill="white" /> Assistir Agora
          </button>
          <button
            onClick={() => navigate(`/drama/${drama.id}`)}
            className="btn-secondary text-sm px-6 py-3">
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  )
}
