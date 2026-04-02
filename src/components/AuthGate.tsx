import { useNavigate } from 'react-router-dom'
import { Play, Crown, Star } from 'lucide-react'

export default function AuthGate() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,15,0.88)', backdropFilter: 'blur(12px)' }}>

      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Play size={18} fill="white" color="white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#fff' }}>Dramix</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'rgba(18,18,24,0.95)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

          {/* Banner 30 min grátis */}
          <div className="px-6 py-5 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.2), rgba(225,29,72,0.05))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
              style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
              <Star size={12} fill="#e11d48" color="#e11d48" />
              <span className="text-xs font-bold" style={{ color: '#fb3060' }}>GRÁTIS</span>
            </div>
            <p className="text-2xl font-extrabold mb-1" style={{ color: '#fff' }}>
              30 minutos grátis
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Crie sua conta e assista agora mesmo
            </p>
          </div>

          {/* Benefícios */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              '🎬 Mini doramas completos em português',
              '📱 Assista no celular, tablet ou PC',
              '❤️ Salve seus favoritos',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 py-1.5">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="px-6 py-5 flex flex-col gap-3">
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 20px rgba(225,29,72,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
              <Crown size={15} />
              Criar conta grátis — 30 min grátis
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}>
              Já tenho conta — Entrar
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Planos a partir de R$15,90/mês após o período grátis
        </p>
      </div>
    </div>
  )
}
