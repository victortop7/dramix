import { useNavigate, useLocation } from 'react-router-dom'
import { Crown, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function SubscribeBanner() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [dismissed, setDismissed] = useState(false)

  // Só mostra para usuários free logados, fora do player e da página de assinatura
  if (!user || user.plan !== 'free' || (user as { isAdmin?: boolean }).isAdmin) return null
  if (dismissed) return null
  if (pathname.startsWith('/watch') || pathname === '/assinatura' || pathname === '/login' || pathname === '/register') return null

  return (
    <div
      className="fixed left-0 right-0 z-30 flex items-center justify-between gap-3 px-4 py-2"
      style={{
        top: 'var(--navbar-h)',
        background: 'var(--accent)',
        boxShadow: '0 2px 12px rgba(225,29,72,0.4)',
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Crown size={15} color="#fff" />
        <p className="text-xs sm:text-sm font-semibold text-white truncate">
          <span className="hidden sm:inline">Você tem 30 min grátis — </span>
          Assine a partir de R$15,90/mês e assista sem limites
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/assinatura')}
          className="text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: '#fff', color: 'var(--accent)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Ver planos
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 2 }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
