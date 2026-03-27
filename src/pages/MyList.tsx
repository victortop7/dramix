import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import DramaCard from '../components/DramaCard'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Drama } from '../types'

export default function MyList() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [dramas, setDramas] = useState<Drama[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (!profile) { navigate('/select-profile'); return }
    api.list.get(profile.id)
      .then(({ dramas: d }) => setDramas(d))
      .catch(() => setDramas([]))
      .finally(() => setLoading(false))
  }, [user, profile, navigate])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }} className="px-4 md:px-8 pb-16">
        <div className="flex items-center gap-3 mb-8 fade-up">
          <Heart size={22} style={{ color: 'var(--accent)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Minha Lista</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />
            ))}
          </div>
        ) : dramas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 fade-up">
            <Heart size={48} style={{ color: 'var(--text-muted)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--text-dim)' }}>
              Sua lista está vazia
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Adicione dramas clicando no ❤️ na página do drama
            </p>
            <button className="btn-primary mt-2" onClick={() => navigate('/home')}>
              Explorar dramas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {dramas.map((d, i) => (
              <DramaCard key={d.id} drama={d} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
