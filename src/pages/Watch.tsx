import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Drama } from '../types'
import { formatDuration } from '../lib/format'

export default function Watch() {
  const { id } = useParams<{ id: string }>()
  const { user, profile, hasAccess } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [drama, setDrama] = useState<Drama | null>(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const saveInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!hasAccess()) { navigate('/assinatura'); return }
    if (!id) return

    api.dramas.get(id)
      .then(({ drama: d }) => {
        setDrama(d)
        void api.dramas.incrementView(id)
      })
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false))
  }, [id, user, navigate, hasAccess])

  // Retomar de onde parou
  useEffect(() => {
    if (!profile || !id) return
    api.history.list(profile.id).then(({ dramas: h }) => {
      const saved = h.find(d => d.id === id)
      if (saved && saved.progressSeconds > 10 && videoRef.current) {
        videoRef.current.currentTime = saved.progressSeconds
      }
    }).catch(() => {})
  }, [profile, id])

  // Auto-save progress
  useEffect(() => {
    if (!profile || !id) return
    saveInterval.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        void api.history.save(profile.id, id, Math.floor(videoRef.current.currentTime))
      }
    }, 30_000)
    return () => { if (saveInterval.current) clearInterval(saveInterval.current) }
  }, [profile, id])

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeout) clearTimeout(controlsTimeout)
    const t = setTimeout(() => setShowControls(false), 3000)
    setControlsTimeout(t)
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { void v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Number(e.target.value)
    setCurrentTime(Number(e.target.value))
  }

  const toggleFullscreen = () => {
    const video = videoRef.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void; webkitRequestFullscreen?: () => void }
    const container = containerRef.current as HTMLDivElement & { webkitRequestFullscreen?: () => void }

    if (!document.fullscreenElement && !(document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
      // iOS Safari: usa webkitEnterFullscreen no próprio video
      if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen()
      } else if (container?.requestFullscreen) {
        void container.requestFullscreen()
      } else if (container?.webkitRequestFullscreen) {
        container.webkitRequestFullscreen()
      }
    } else {
      const doc = document as Document & { webkitExitFullscreen?: () => void }
      if (doc.exitFullscreen) void doc.exitFullscreen()
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen()
    }
  }

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#000' }}>
      <div className="w-12 h-12 rounded-full border-2 border-violet-600 border-t-transparent"
        style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (!drama?.videoUrl) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: '#000' }}>
      <p style={{ color: 'var(--text-dim)' }}>Vídeo não disponível</p>
      <button className="btn-secondary" onClick={() => navigate(-1)}>Voltar</button>
    </div>
  )

  return (
    <div ref={containerRef}
      className="fixed inset-0 flex flex-col"
      style={{ background: '#000' }}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}>

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 z-10 transition-opacity duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          position: 'absolute', top: 0, left: 0, right: 0,
        }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={22} />
        </button>
        <span className="text-sm font-semibold text-white">{drama.title}</span>
      </div>

      {/* Video — centralizado em formato retrato */}
      <div className="flex-1 flex items-center justify-center" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={drama.videoUrl}
          style={{ maxHeight: '100vh', maxWidth: '100%', width: 'auto', height: '100%', cursor: 'pointer' }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
          onEnded={() => setPlaying(false)}
          muted={muted}
          playsInline
        />
      </div>

      {/* Controls */}
      <div className="z-10 px-4 pb-6 pt-4 transition-opacity duration-300"
        style={{
          opacity: showControls ? 1 : 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
          position: 'absolute', bottom: 0, left: 0, right: 0,
        }}>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-white" style={{ fontFamily: 'var(--mono)', minWidth: 36 }}>
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={seek}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 0%)`,
              accentColor: 'var(--accent)',
            }}
          />
          <span className="text-xs text-white" style={{ fontFamily: 'var(--mono)', minWidth: 36, textAlign: 'right' }}>
            {formatDuration(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
              {playing ? <Pause size={24} /> : <Play size={24} fill="white" />}
            </button>
            <button
              onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10 }}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setMuted(v => !v)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
          <button onClick={toggleFullscreen}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
