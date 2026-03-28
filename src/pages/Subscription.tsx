import { useNavigate } from 'react-router-dom'
import { Check, Crown, Star, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const CHECKOUT_URLS: Record<string, string> = {
  basic: 'https://syncpagamentoseguro.com/checkout/a16778d7-027b-49dc-b6c0-f8ecd8575b1f+a1677c23-fea6-40d3-bb33-d37372e6ca2b',
  premium: 'https://syncpagamentoseguro.com/checkout/a1677b5c-b9c0-42a0-8607-dfc1097fb6ed+a1678152-5fdc-4d0a-a41f-adcbb2c0c483',
}

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

  const handleSubscribe = (planId: 'basic' | 'premium') => {
    if (!user) { navigate('/login'); return }
    const url = CHECKOUT_URLS[planId]
    // Pré-preenche o email do usuário no checkout
    const checkoutUrl = `${url}?email=${encodeURIComponent(user.email)}`
    window.open(checkoutUrl, '_blank')
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-12" style={{ background: 'var(--bg)' }}>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-12 w-fit"
        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="text-center mb-12 fade-up">
        <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--text)' }}>
          Escolha o plano perfeito para você
        </h1>
        <p className="text-base" style={{ color: 'var(--text-dim)' }}>
          Assista seus dramas favoritos sem interrupções e com a melhor qualidade.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-2xl mx-auto w-full fade-up stagger-1">
        {plans.map(plan => (
          <div key={plan.id}
            className="flex-1 rounded-2xl p-7 flex flex-col relative"
            style={{
              background: 'var(--surface)',
              border: plan.highlight ? '2px solid var(--accent)' : '1px solid var(--border)',
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
            <button onClick={() => handleSubscribe(plan.id)}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white"
              style={{ ...plan.buttonStyle, border: 'none', cursor: 'pointer' }}>
              Assinar {plan.name}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
        Você será redirecionado para a página de pagamento seguro. Após o pagamento, atualize esta página para liberar seu acesso.
      </p>
    </div>
  )
}
