import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import type { FeaturedDrama } from '../types'

interface Props {
  dramas: FeaturedDrama[]
  allThumbnails?: string[]
}

export default function HeroSection({ dramas, allThumbnails = [] }: Props) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const goTo = useCallback((next: number) => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setIndex(next)
      setTransitioning(false)
    }, 400)
  }, [transitioning])

  const prev = () => goTo((index - 1 + dramas.length) % dramas.length)
  const next = useCallback(() => goTo((index + 1) % dramas.length), [index, dramas.length, goTo])

  useEffect(() => {
    if (dramas.length <= 1) return
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [dramas.length, next])

  if (!dramas.length) return null
  const drama = dramas[index]

  // Gera grid de thumbnails repetindo até ter pelo menos 40 itens
  const mosaicThumbs = allThumbnails.length > 0
    ? Array.from({ length: 40 }, (_, i) => allThumbnails[i % allThumbnails.length])
    : []

  return (
    <div className="relative w-full overflow-hidden"
      style={{ height: 'clamp(480px, 62vw, 680px)', marginTop: 'var(--navbar-h)' }}>

      {/* Mosaico Netflix-style */}
      {mosaicThumbs.length > 0 && (
        <div className="absolute inset-0" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, opacity: 0.35, transform: 'scale(1.05)' }}>
          {mosaicThumbs.map((url, i) => (
            <img key={i} src={url} alt="" className="w-full h-full object-cover" style={{ aspectRatio: '2/3' }} />
          ))}
        </div>
      )}

      {/* Background image do destaque (sobre o mosaico) */}
      {drama.thumbnailUrl && (
        <img
          key={drama.id}
          src={drama.thumbnailUrl}
          alt={drama.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: 'center 15%',
            filter: 'brightness(0.45)',
            opacity: transitioning ? 0 : 0.7,
            transition: 'opacity 0.4s ease',
          }}
        />
      )}

      {/* Gradiente principal — escurece embaixo e esquerda */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(10,10,15,1) 0%, rgba(10,10,15,0.55) 40%, rgba(10,10,15,0.1) 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to right, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.3) 50%, transparent 100%)',
      }} />

      {/* Conteúdo */}
      <div
        className="absolute inset-0 flex flex-col justify-end px-4 md:px-12 pb-14 max-w-2xl"
        style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.4s ease' }}
      >
        {/* Tags */}
        {drama.tags && drama.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {drama.tags.map(tag => (
              <span key={tag}
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Título */}
        <h1
          className="font-extrabold leading-none mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 58px)', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
        >
          {drama.title}
        </h1>

        {/* Descrição */}
        {drama.description && (
          <p className="text-sm md:text-base leading-relaxed mb-6 line-clamp-2"
            style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 480 }}>
            {drama.description}
          </p>
        )}

        {/* Botões */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/watch/${drama.id}`)}
            className="flex items-center gap-2 font-bold rounded-xl px-7 py-3 text-sm md:text-base"
            style={{
              background: '#fff',
              color: '#0a0a0f',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Play size={18} fill="#0a0a0f" color="#0a0a0f" />
            Assistir
          </button>

          <button
            onClick={() => navigate(`/drama/${drama.id}`)}
            className="flex items-center gap-2 font-semibold rounded-xl px-6 py-3 text-sm md:text-base"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <Info size={16} />
            Detalhes
          </button>
        </div>
      </div>

      {/* Navegação — setas + dots */}
      {dramas.length > 1 && (
        <div className="absolute bottom-5 right-4 md:right-12 flex items-center gap-3">
          <button onClick={prev}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1.5">
            {dramas.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{
                  width: i === index ? 24 : 6,
                  height: 6,
                  borderRadius: 3,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: i === index ? '#fff' : 'rgba(255,255,255,0.35)',
                }} />
            ))}
          </div>

          <button onClick={next}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
