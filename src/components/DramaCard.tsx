import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { Drama } from '../types'

interface Props {
  drama: Drama
  index?: number
}

export default function DramaCard({ drama, index = 0 }: Props) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const delay = Math.min(index * 0.04, 0.4)

  return (
    <Link
      to={`/drama/${drama.id}`}
      className="flex-shrink-0 fade-up"
      style={{
        textDecoration: 'none',
        animationDelay: `${delay}s`,
        display: 'block',
        width: 'clamp(110px, 15vw, 140px)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          aspectRatio: '2/3',
          background: 'var(--surface-alt)',
          transform: hovered ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.25s ease',
          boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        {drama.thumbnailUrl && !imgError ? (
          <img
            src={drama.thumbnailUrl}
            alt={drama.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--surface-alt), var(--surface-hover))' }}>
            <Play size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Gradient overlay com título */}
        <div
          className="absolute inset-0 flex flex-col justify-end"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)',
          }}
        >
          <div className="px-2 pb-2">
            <p className="text-xs font-semibold leading-snug line-clamp-2"
              style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              {drama.title}
            </p>
          </div>
        </div>

        {/* Play button ao hover */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(225,29,72,0.9)', boxShadow: '0 4px 20px rgba(225,29,72,0.5)' }}>
            <Play size={18} fill="white" color="white" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {drama.isDubbed && (
            <span className="badge badge-red" style={{ fontSize: 8 }}>DUBLADO</span>
          )}
          {drama.isNew && (
            <span className="badge badge-green" style={{ fontSize: 8 }}>NOVO</span>
          )}
          {drama.isExclusive && (
            <span className="badge badge-amber" style={{ fontSize: 8 }}>EXCLUSIVO</span>
          )}
        </div>
      </div>
    </Link>
  )
}
