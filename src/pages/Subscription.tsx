import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, Star, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const plans = [
  {
    id: 'basic' as const,
    name: 'Básico',
    price: 'R$ 15,90',
    period: '/mês',
    icon: <Star size={22} style={{ color: 'var(--blue)' }} />,
    description: 'Acesso Completo e Sem Limites.',
    highlight: false,
    features: [
      'Assista Sem Limites a Todos os Dramas',
      '1 Perfil/tela simultânea',
      'Sem anúncios',
    ],
    buttonStyle: { background: 'var(--blue)' },
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 'R$ 29,90',
    period: '/mês',
    icon: <Crown size={22} style={{ color: '#f59e0b' }} />,
    description: 'Acesso Completo, Sem Limites e todos os Benefícios Exclusivos.',
    highlight: true,
    features: [
      'Assista Sem Limites a Todos os Dramas',
      '3 Perfis/tela simultânea',
      'Sem anúncios',
      'Suporte exclusivo via WhatsApp',
    ],
    buttonStyle: { background: 'var(--accent)' },
  },
]

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)

  const subscribe = async (plan: 'basic' | 'premium') => {
    if (!user) { navigate('/login'); return }
    setLoading(plan)
    try {
      const { checkoutUrl } = await api.subscription.createCheckout(plan)
      window.location.href = checkoutUrl
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao processar assinatura')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-12" style={{ background: 'var(--bg)' }}>
      {/* Voltar */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-12 w-fit"
        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Header */}
      <div className="text-center mb-12 fade-up">
        <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--text)' }}>
          Escolha o plano perfeito para você
        </h1>
        <p className="text-base" style={{ color: 'var(--text-dim)' }}>
          Assista seus dramas favoritos sem interrupções e com a melhor qualidade.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-2xl mx-auto w-full fade-up stagger-1">
        {plans.map(plan => (
          <div key={plan.id}
            className="flex-1 rounded-2xl p-7 flex flex-col relative"
            style={{
              background: 'var(--surface)',
              border: plan.highlight
                ? '2px solid var(--accent)'
                : '1px solid var(--border)',
              boxShadow: plan.highlight ? '0 0 40px var(--accent-glow)' : 'none',
            }}>

            {plan.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="badge badge-red text-xs px-3 py-1">Mais Popular</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              {plan.icon}
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{plan.name}</h2>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-dim)' }}>{plan.description}</p>

            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-extrabold" style={{ color: 'var(--text)' }}>{plan.price}</span>
              <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
            </div>

            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
                  <Check size={15} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => void subscribe(plan.id)}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{
                ...plan.buttonStyle,
                opacity: loading !== null ? 0.7 : 1,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                border: 'none',
              }}>
              {loading === plan.id ? 'Redirecionando...' : `Assinar ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
        Cancele a qualquer momento. Pagamento processado com segurança via SyncPay.
      </p>
    </div>
  )
}
