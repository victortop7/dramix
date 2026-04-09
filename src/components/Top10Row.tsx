import { useNavigate } from 'react-router-dom'

interface Top10Drama {
  rank: number
  id: string
  title: string
  thumbnailUrl: string | null
  views: number
  isDubbed: boolean
  isNew: boolean
}

interface Props {
  dramas: Top10Drama[]
}

export default function Top10Row({ dramas }: Props) {
  const navigate = useNavigate()

  if (dramas.length === 0) return null

  return (
    <div className="mb-8 px-4 md:px-10">
      <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>
        Top 10 de hoje
      </h2>

      <div
        className="flex gap-0 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dramas.map((drama) => (
          <div
            key={drama.id}
            className="flex-shrink-0 flex items-end cursor-pointer group"
            style={{ marginRight: 8 }}
            onClick={() => navigate(`/watch/${drama.id}`)}
          >
            {/* Número grande */}
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 'clamp(80px, 12vw, 120px)',
                fontWeight: 900,
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '2px rgba(255,255,255,0.55)',
                userSelect: 'none',
                marginRight: -12,
                zIndex: 1,
                flexShrink: 0,
                paddingBottom: 8,
              }}
            >
              {drama.rank}
            </span>

            {/* Thumbnail */}
            <div
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{
                width: 'clamp(100px, 16vw, 140px)',
                aspectRatio: '2/3',
                zIndex: 2,
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {drama.thumbnailUrl ? (
                <img
                  src={drama.thumbnailUrl}
                  alt={drama.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'var(--surface-alt)' }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Sem imagem</span>
                </div>
              )}

              {/* Overlay escuro no hover */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>

              {/* Badges */}
              {drama.isNew && (
                <div
                  className="absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'var(--mono)', fontSize: 9 }}
                >
                  NOVO
                </div>
              )}
              {drama.isDubbed && (
                <div
                  className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 9 }}
                >
                  DUB
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
