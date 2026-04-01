import { useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import DramaCard from './DramaCard'
import type { Drama } from '../types'

interface Props {
  title: string
  dramas: Drama[]
  seeAllSlug?: string
}

export default function CategoryRow({ title, dramas, seeAllSlug }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' })
  }

  if (!dramas.length) return null

  return (
    <section className="mb-10">
      {/* Header da seção */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-10">
        <div className="flex items-center gap-3">
          {/* Acento colorido */}
          <div style={{ width: 4, height: 20, borderRadius: 2, background: 'var(--accent)', flexShrink: 0 }} />
          <h2 className="text-sm md:text-base font-bold" style={{ color: '#fff' }}>
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {seeAllSlug && (
            <Link
              to={`/categoria/${seeAllSlug}`}
              className="hidden sm:flex items-center gap-1 text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
              Ver tudo
              <ArrowRight size={13} />
            </Link>
          )}
          <button onClick={() => scroll('left')}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => scroll('right')}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div ref={rowRef} className="scroll-x flex gap-3 px-4 md:px-10 pb-2">
        {dramas.map((drama, i) => (
          <DramaCard key={drama.id} drama={drama} index={i} />
        ))}
      </div>
    </section>
  )
}
