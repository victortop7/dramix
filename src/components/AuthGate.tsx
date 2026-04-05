import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Play, Crown, Zap } from 'lucide-react'
import { api } from '../lib/api'

export default function AuthGate() {
  const navigate = useNavigate()
  const [thumbs, setThumbs] = useState<string[]>([])
  const [showRegisterHint, setShowRegisterHint] = useState(false)

  useEffect(() => {
    api.dramas.byCategory().then(({ categories }) => {
      const urls = categories.flatMap((c: any) => c.dramas.map((d: any) => d.thumbnailUrl)).filter(Boolean)
      if (urls.length > 0) setThumbs(Array.from({ length: 48 }, (_: unknown, i: number) => urls[i % urls.length]))
    }).catch(() => {})
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,15,0.6)' }}>

      {/* Mosaico de thumbnails */}
      {thumbs.length > 0 && (
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 3, opacity: 0.25, transform: 'scale(1.05)', height: '100%' }}>
            {thumbs.map((url, i) => (
              <img key={i} src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ))}
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.7) 100%)' }} />
        </div>
      )}

      <div className="w-full max-w-sm fade-up" style={{ position: 'relative', zIndex: 1 }}>
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

          {/* Banner preço */}
          <div className="px-6 py-5 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.2), rgba(225,29,72,0.05))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
              style={{ background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)' }}>
              <Crown size={12} fill="#e11d48" color="#e11d48" />
              <span className="text-xs font-bold" style={{ color: '#fb3060' }}>ASSINE AGORA</span>
            </div>
            <p className="text-2xl font-extrabold mb-1" style={{ color: '#fff' }}>
              A partir de R$12,90
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Plano básico — acesso ilimitado
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
            {/* Teste grátis */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => { setShowRegisterHint(true); navigate('/register') }}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 20px rgba(225,29,72,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}>
                <Zap size={15} fill="white" />
                Teste grátis
              </button>
              {showRegisterHint && (
                <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  ⚡ Cadastro rápido, leva menos de 1 minuto!
                </p>
              )}
              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                ⚡ Cadastro rápido, leva menos de 1 minuto!
              </p>
            </div>

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
          Planos: Básico R$12,90/mês · Premium R$24,90/mês
        </p>
      </div>
    </div>
  )
}
