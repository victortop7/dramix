import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Play, Heart, Settings, Search, LogOut, User, Crown, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const AVATAR_EMOJIS: Record<string, string> = {
  robot: '🤖', cat: '🐱', fox: '🦊', panda: '🐼',
  bear: '🐻', dragon: '🐉', fairy: '🧚', ninja: '🥷',
}

export default function Navbar() {
  const { user, profile, logout, hasAccess } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const planLabel = user?.plan === 'premium' ? 'Premium' : user?.plan === 'basic' ? 'Básico' : 'Gratuito'
  const planColor = user?.plan === 'premium' ? 'var(--amber)' : user?.plan === 'basic' ? 'var(--blue)' : 'var(--text-dim)'

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8"
      style={{
        height: 'var(--navbar-h)',
        background: 'rgba(10,10,15,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>

      {/* Logo */}
      <Link to="/home" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent)' }}>
          <Play size={15} fill="white" color="white" />
        </div>
        <span className="text-lg font-bold hidden sm:block" style={{ color: 'var(--text)' }}>Dramix</span>
      </Link>

      {/* Search — desktop */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-8">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar dramas..."
            className="input pl-9 py-2 text-sm"
            style={{ height: 38 }}
            onFocus={() => navigate('/buscar')}
            readOnly
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search mobile */}
        <Link to="/buscar" className="md:hidden p-2 rounded-lg"
          style={{ color: 'var(--text-dim)' }}>
          <Search size={20} />
        </Link>

        {/* Minha Lista */}
        {user && (
          <Link to="/minha-lista"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              color: location.pathname === '/minha-lista' ? 'var(--accent-light)' : 'var(--text-dim)',
              background: location.pathname === '/minha-lista' ? 'var(--accent-dim)' : 'transparent',
              textDecoration: 'none',
            }}>
            <Heart size={15} />
            <span className="hidden lg:block">Minha Lista</span>
          </Link>
        )}

        {/* Plano badge */}
        {user && (
          <button onClick={() => navigate('/assinatura')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              color: planColor,
              cursor: 'pointer',
            }}>
            {user.plan === 'premium' && <Crown size={12} />}
            {planLabel}
          </button>
        )}

        {/* Configurações */}
        {user && (
          <Link to="/configuracoes"
            className="hidden md:flex p-2 rounded-lg"
            style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
            <Settings size={18} />
          </Link>
        )}

        {/* User avatar / menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer', color: '#fff' }}>
              {profile ? (AVATAR_EMOJIS[profile.avatar] ?? profile.name[0].toUpperCase()) : user.name[0].toUpperCase()}
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 w-52 rounded-xl overflow-hidden z-50"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{user.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                  {[
                    { icon: <User size={14} />, label: 'Trocar Perfil', to: '/select-profile' },
                    { icon: <Heart size={14} />, label: 'Minha Lista', to: '/minha-lista' },
                    { icon: <Crown size={14} />, label: 'Assinatura', to: '/assinatura' },
                    { icon: <Settings size={14} />, label: 'Configurações', to: '/configuracoes' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                      style={{ color: 'var(--text-dim)', textDecoration: 'none',
                        transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); navigate('/login'); setUserMenuOpen(false) }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm w-full"
                    style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'background 0.15s', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <LogOut size={14} /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">Entrar</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Criar conta</Link>
          </div>
        )}

        {/* Mobile menu */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          {!hasAccess() && (
            <Link to="/assinatura" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold"
              style={{ color: 'var(--accent-light)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>
              <Crown size={16} /> Assinar agora
            </Link>
          )}
          <Link to="/minha-lista" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm"
            style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>
            <Heart size={16} /> Minha Lista
          </Link>
        </div>
      )}
    </nav>
  )
}
