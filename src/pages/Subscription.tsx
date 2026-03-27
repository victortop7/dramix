import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, Star, ArrowLeft, Copy, CheckCheck, X } from 'lucide-react'
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

interface PixData {
  transactionId: string
  pixCode: string
  pixQrCode: string
  planName: string
  price: string
}

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null)
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const formatCpf = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11)
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3')
      .replace(/(\d{3})(\d{3})$/, '$1.$2')
      .replace(/(\d{3})$/, '$1')
  }

  const openCheckout = (plan: 'basic' | 'premium') => {
    if (!user) { navigate('/login'); return }
    setSelectedPlan(plan)
    setError('')
    setCpf('')
  }

  const generatePix = async () => {
    if (!selectedPlan) return
    const rawCpf = cpf.replace(/\D/g, '')
    if (rawCpf.length !== 11) { setError('CPF inválido — deve ter 11 dígitos'); return }

    setLoading(true)
    setError('')
    try {
      const plan = plans.find(p => p.id === selectedPlan)!
      const data = await api.subscription.createPix(selectedPlan, rawCpf)
      setPixData({
        ...data,
        planName: plan.name,
        price: plan.price,
      })
      setSelectedPlan(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar PIX')
    } finally {
      setLoading(false)
    }
  }

  const copyPix = async () => {
    if (!pixData?.pixCode) return
    await navigator.clipboard.writeText(pixData.pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
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

            <button
              onClick={() => openCheckout(plan.id)}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
              style={{ ...plan.buttonStyle, border: 'none', cursor: 'pointer' }}>
              Assinar {plan.name}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
        Pagamento via PIX. Acesso liberado automaticamente após confirmação.
      </p>

      {/* Modal — CPF */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                Assinar {plans.find(p => p.id === selectedPlan)?.name}
              </h3>
              <button onClick={() => setSelectedPlan(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
              Informe seu CPF para gerar o PIX.
            </p>

            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(formatCpf(e.target.value))}
              className="input w-full mb-3"
              style={{ fontSize: 16 }}
              maxLength={14}
            />

            {error && (
              <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>{error}</p>
            )}

            <button
              onClick={() => void generatePix()}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white"
              style={{
                background: 'var(--accent)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}>
              {loading ? 'Gerando PIX...' : 'Gerar PIX'}
            </button>
          </div>
        </div>
      )}

      {/* Modal — PIX */}
      {pixData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                Pague via PIX
              </h3>
              <button onClick={() => setPixData(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm mb-1" style={{ color: 'var(--text-dim)' }}>
                {pixData.planName} — <strong style={{ color: 'var(--text)' }}>{pixData.price}/mês</strong>
              </p>
            </div>

            {/* QR Code */}
            {pixData.pixQrCode && (
              <div className="flex justify-center mb-4">
                <img
                  src={`data:image/png;base64,${pixData.pixQrCode}`}
                  alt="QR Code PIX"
                  className="rounded-xl"
                  style={{ width: 200, height: 200, background: '#fff', padding: 8 }}
                />
              </div>
            )}

            {/* Copia e Cola */}
            {pixData.pixCode && (
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>PIX Copia e Cola:</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-lg px-3 py-2 text-xs overflow-hidden"
                    style={{
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-dim)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                    {pixData.pixCode}
                  </div>
                  <button
                    onClick={() => void copyPix()}
                    className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                    style={{
                      background: copied ? 'var(--green-dim)' : 'var(--accent-dim)',
                      border: `1px solid ${copied ? 'var(--green)' : 'var(--accent)'}`,
                      color: copied ? 'var(--green)' : 'var(--accent)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                    {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--surface-alt)', color: 'var(--text-dim)' }}>
              Após o pagamento, seu acesso será liberado automaticamente em até 1 minuto.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
