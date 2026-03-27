import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Play } from 'lucide-react'
import type { Drama } from '../types'
import { formatViews } from '../lib/format'

interface Props {
  drama: Drama
  index?: number
}

export default function DramaCard({ drama, index = 0 }: Props) {
  const [imgError, setImgError] = useState(false)
  const delay = Math.min(index * 0.04, 0.4)

  return (
    <Link
      to={`/drama/${drama.id}`}
      className="flex-shrink-0 w-[150px] sm:w-[160px] group card-hover fade-up"
      style={{
        textDecoration: 'none',
        animationDelay: `${delay}s`,
        display: 'block',
      }}>

      {/* Thumbnail */}
      <div className="relative rounded-xl overflow-hidden mb-2"
        style={{ aspectRatio: '2/3', background: 'var(--surface-alt)' }}>

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
            <Play size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Play size={20} fill="white" color="white" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {drama.isDubbed && (
            <span className="badge badge-red" style={{ fontSize: 9 }}>DUBLADO</span>
          )}
          {drama.isNew && (
            <span className="badge badge-green" style={{ fontSize: 9 }}>Novo</span>
          )}
          {drama.isExclusive && (
            <span className="badge badge-amber" style={{ fontSize: 9 }}>Exclusivo</span>
          )}
        </div>
      </div>

      {/* Info */}
      <p className="text-xs font-semibold leading-snug line-clamp-2 mb-1"
        style={{ color: 'var(--text)' }}>
        {drama.title}
      </p>
      <div className="flex items-center gap-1">
        <Eye size={11} style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
          {formatViews(drama.views)}
        </span>
      </div>
    </Link>
  )
}
