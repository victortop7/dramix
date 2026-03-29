import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { Profile } from '../types'

const AVATARS = ['robot', 'cat', 'fox', 'panda', 'bear', 'dragon', 'fairy', 'ninja']

const AVATAR_EMOJIS: Record<string, string> = {
  robot: '🤖', cat: '🐱', fox: '🦊', panda: '🐼',
  bear: '🐻', dragon: '🐉', fairy: '🧚', ninja: '🥷',
}

export default function SelectProfile() {
  const { user, setProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState('robot')
  const [loading, setLoading] = useState(true)

  const maxProfiles = (user?.plan === 'premium' || user?.isAdmin) ? 3 : 1

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.profiles.list()
      .then(({ profiles: p }) => setProfiles(p))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const select = (profile: Profile) => {
    setProfile(profile)
    navigate('/home')
  }

  const addProfile = async () => {
    if (!newName.trim()) return
    try {
      const { profile } = await api.profiles.create(newName.trim(), newAvatar)
      setProfiles(v => [...v, profile])
      setIsAdding(false)
      setNewName('')
      setNewAvatar('robot')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao criar perfil')
    }
  }

  const deleteProfile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Remover este perfil?')) return
    await api.profiles.delete(id)
    setProfiles(v => v.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>

      <h1 className="text-4xl font-bold mb-2 fade-up" style={{ color: 'var(--text)' }}>
        Quem está assistindo?
      </h1>
      <p className="text-base mb-12 fade-up stagger-1" style={{ color: 'var(--text-dim)' }}>
        Escolha um perfil para continuar.
      </p>

      {loading ? (
        <div className="flex gap-6">
          {[1, 2].map(i => (
            <div key={i} className="skeleton w-28 h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 mb-12 fade-up stagger-2">
          {profiles.map(p => (
            <button key={p.id}
              onClick={() => select(p)}
              className="group flex flex-col items-center gap-3 p-2 rounded-xl relative"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <div className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl
                transition-all duration-200 group-hover:ring-2 group-hover:ring-violet-500"
                style={{ background: 'var(--surface-alt)' }}>
                {AVATAR_EMOJIS[p.avatar] ?? '👤'}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.name}</span>
              <button
                onClick={(e) => void deleteProfile(p.id, e)}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                style={{ background: 'var(--red)', border: 'none', cursor: 'pointer', color: '#fff' }}>
                <Trash2 size={12} />
              </button>
            </button>
          ))}

          {/* Adicionar perfil */}
          {profiles.length < maxProfiles && (
            <button onClick={() => setIsAdding(true)}
              className="flex flex-col items-center gap-3 p-2"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <div className="w-24 h-24 rounded-xl flex items-center justify-center"
                style={{ border: '2px dashed var(--border-light)' }}>
                <Plus size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-dim)' }}>Adicionar Perfil</span>
            </button>
          )}
        </div>
      )}

      {/* Form novo perfil */}
      {isAdding && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 fade-up"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Novo Perfil</h3>
            <input
              className="input mb-4"
              placeholder="Nome do perfil"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Escolha um avatar</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {AVATARS.map(a => (
                <button key={a}
                  onClick={() => setNewAvatar(a)}
                  className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: newAvatar === a ? 'var(--accent-dim)' : 'var(--surface-alt)',
                    border: newAvatar === a ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}>
                  {AVATAR_EMOJIS[a]}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setIsAdding(false)}>Cancelar</button>
              <button className="btn-primary flex-1 justify-center" onClick={() => void addProfile()}>
                <Pencil size={14} /> Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button className="btn-secondary text-sm"
          onClick={() => { navigate('/home') }}>
          Gerenciar Perfis
        </button>
        <button className="text-sm" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={logout}>
          Sair
        </button>
      </div>
    </div>
  )
}
