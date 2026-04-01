import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Play, Heart, Settings, Search, LogOut, User, Crown, ChevronDown, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const AVATAR_EMOJIS: Record<string, string> = {
  robot: '🤖', cat: '🐱', fox: '🦊', panda: '🐼',
  bear: '🐻', dragon: '🐉', fairy: '🧚', ninja: '🥷',
}

export default function Navbar() {
  const { user, profile, logout, hasAccess, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [catOpen, setCatOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.categories.list()
      .then(({ categories: cats }) => setCategories(cats))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const planLabel = user?.plan === 'premium' ? 'Premium' : user?.plan === 'basic' ? 'Básico' : 'Gratuito'
  const planColor = user?.plan === 'premium' ? 'var(--amber)' : user?.plan === 'basic' ? 'var(--blue)' : 'var(--text-dim)'

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-10"
      style={{
        height: 'var(--navbar-h)',
        background: scrolled
          ? 'rgba(10,10,15,0.97)'
          : 'linear-gradient(to bottom, rgba(10,10,15,0.85), transparent)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
        transition: 'background 0.3s, border-color 0.3s',
      }}>

      {/* Esquerda: logo + navegação */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Play size={15} fill="white" color="white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight" style={{ color: '#fff' }}>Dramix</span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/home"
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              color: location.pathname === '/home' ? '#fff' : 'rgba(255,255,255,0.65)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = location.pathname === '/home' ? '#fff' : 'rgba(255,255,255,0.65)')}>
            Início
          </Link>

          {/* Categorias dropdown — só para assinantes */}
          {hasAccess() && <div ref={catRef} className="relative">
            <button
              onClick={() => setCatOpen(v => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                background: 'none',
                border: 'none',
                color: catOpen ? '#fff' : 'rgba(255,255,255,0.65)',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = catOpen ? '#fff' : 'rgba(255,255,255,0.65)')}>
              Categorias
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: catOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {catOpen && (
              <div
                className="absolute top-full left-0 mt-2 rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(18,18,24,0.97)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(20px)',
                  width: 200,
                  maxHeight: 320,
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                }}>
                {categories.map(cat => (
                  <Link
                    key={cat.slug}
                    to={`/categoria/${cat.slug}`}
                    onClick={() => setCatOpen(false)}
                    className="block px-4 py-2.5 text-sm"
                    style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>}

          {user && (
            <Link to="/minha-lista"
              className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
              style={{
                color: location.pathname === '/minha-lista' ? '#fff' : 'rgba(255,255,255,0.65)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = location.pathname === '/minha-lista' ? '#fff' : 'rgba(255,255,255,0.65)')}>
              <Heart size={14} />
              Minha Lista
            </Link>
          )}
        </div>
      </div>

      {/* Direita: busca + plano + avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        {hasAccess() && (
          <button
            onClick={() => navigate('/buscar')}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
            <Search size={17} />
          </button>
        )}

        {/* Plano badge */}
        {user && (
          <button
            onClick={() => navigate('/assinatura')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: planColor,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
            {user.plan === 'premium' && <Crown size={12} />}
            {planLabel}
          </button>
        )}

        {/* Avatar / user menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold"
              style={{ background: 'var(--accent)', border: '2px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: '#fff' }}>
              {profile ? (AVATAR_EMOJIS[profile.avatar] ?? profile.name[0].toUpperCase()) : user.name[0].toUpperCase()}
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50"
                  style={{ background: 'rgba(18,18,24,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#fff' }}>{user.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                  </div>
                  {[
                    { icon: <User size={14} />, label: 'Trocar Perfil', to: '/select-profile' },
                    { icon: <Heart size={14} />, label: 'Minha Lista', to: '/minha-lista' },
                    { icon: <Crown size={14} />, label: 'Assinatura', to: '/assinatura' },
                    { icon: <Settings size={14} />, label: 'Configurações', to: '/configuracoes' },
                    ...(isAdmin() ? [{ icon: <ShieldCheck size={14} />, label: 'Admin', to: '/vs2423' }] : []),
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                      style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={() => { logout(); navigate('/login'); setUserMenuOpen(false) }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full"
                      style={{ color: 'var(--accent-light)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,29,72,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <LogOut size={14} /> Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="px-4 py-1.5 rounded-lg text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}>
              Entrar
            </Link>
            <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Assinar</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
