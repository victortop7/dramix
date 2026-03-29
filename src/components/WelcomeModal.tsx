import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: Props) {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full md:max-w-sm mx-auto rounded-t-3xl md:rounded-2xl px-6 py-8 fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <span className="text-2xl font-black text-white">D</span>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-center mb-1" style={{ color: 'var(--text)' }}>
          Bem-vindo ao Dramix!
        </h2>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-dim)' }}>
          Escolha uma opção para continuar:
        </p>

        {/* Já tenho conta */}
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm mb-3"
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          <LogIn size={18} />
          Já tenho conta!
        </button>

        {/* Não tenho conta */}
        <button
          onClick={() => { navigate('/register') }}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm mb-3"
          style={{ background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>
          <UserPlus size={18} />
          Criar conta grátis
        </button>

        {/* Continuar sem conta */}
        <button
          onClick={onClose}
          className="w-full py-3 text-sm"
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          Continuar sem conta →
        </button>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Sem conta você pode assistir 30 min grátis
        </p>
      </div>
    </div>
  )
}
