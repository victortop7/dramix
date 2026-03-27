import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DramaCard from './DramaCard'
import type { Drama } from '../types'

interface Props {
  title: string
  dramas: Drama[]
  seeAllSlug?: string
}

export default function CategoryRow({ title, dramas }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return
    rowRef.current.scrollBy({ left: dir === 'right' ? 500 : -500, behavior: 'smooth' })
  }

  if (!dramas.length) return null

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 md:px-8">
        <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--text)' }}>
          {title}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-dim)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-alt)')}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-dim)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dim)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-alt)')}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={rowRef} className="scroll-x flex gap-3 px-4 md:px-8 pb-2">
        {dramas.map((drama, i) => (
          <DramaCard key={drama.id} drama={drama} index={i} />
        ))}
      </div>
    </section>
  )
}
