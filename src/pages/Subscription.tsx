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
    icon: <Star size={22} style={{ color: 'var(--blue)' }} />,
    description: 'Acesso Completo e Sem Limites.',
    highlight: false,
    features: [
      'Assista Sem Limites a Todos os Dramas',
      '1 Perfil/tela simultânea',
      'Sem anúncios',
    ],
    color: 'var(--blue)',
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 'R$ 29,90',
    icon: <Crown size={22} style={{ color: '#f59e0b' }} />,
    description: 'Acesso Completo, Sem Limites e todos os Benefícios Exclusivos.',
    highlight: true,
    features: [
      'Assista Sem Limites a Todos os Dramas',
      '3 Perfis/tela simultânea',
      'Sem anúncios',
      'Suporte exclusivo via WhatsApp',
    ],
    color: 'var(--accent)',
  },
]

type Step = 'form' | 'pix'

interface PixData {
  pixCode: string
  pixQrCode: string
}

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null)
  const [step, setStep] = useState<Step>('form')
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)

  const openModal = (plan: 'basic' | 'premium') => {
    if (!user) { navigate('/login'); return }
    setSelectedPlan(plan)
    setStep('form')
    setError('')
    setCpf('')
    setPixData(null)
  }

  const closeModal = () => setSelectedPlan(null)

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3')
      .replace(/(\d{3})(\d{3})/, '$1.$2')
  }

  const handleGerar = async () => {
    if (!selectedPlan || !user) return
    const raw = cpf.replace(/\D/g, '')
    if (raw.length !== 11) { setError('CPF inválido'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.subscription.createPix(selectedPlan, cpf)
      setPixData({ pixCode: res.pixCode, pixQrCode: res.pixQrCode })
      setStep('pix')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar PIX')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!pixData) return
    navigator.clipboard.writeText(pixData.pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const plan = plans.find(p => p.id === selectedPlan)

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

      <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-2xl mx-auto w-full fade-up">
        {plans.map(p => (
          <div key={p.id}
            className="flex-1 rounded-2xl p-7 flex flex-col relative"
            style={{
              background: 'var(--surface)',
              border: p.highlight ? `2px solid ${p.color}` : '1px solid var(--border)',
            }}>
            {p.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: p.color, color: '#fff' }}>
                  Mais Popular
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-2">
              {p.icon}
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{p.name}</h2>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-dim)' }}>{p.description}</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-extrabold" style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{p.price}</span>
              <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/mês</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
                  <Check size={15} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => openModal(p.id)}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white"
              style={{ background: p.color, border: 'none', cursor: 'pointer' }}>
              Assinar {p.name}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedPlan && plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="w-full max-w-sm rounded-2xl p-6 relative"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button onClick={closeModal}
              className="absolute top-4 right-4"
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            {step === 'form' && (
              <>
                <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
                  Pagamento via PIX
                </h2>
                <p className="text-xs mb-5" style={{ color: 'var(--text-dim)' }}>
                  {user?.name}, informe seu CPF para gerar o PIX.
                </p>

                <div className="flex flex-col gap-3 mb-5">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>NOME</label>
                    <input value={user?.name ?? ''} readOnly
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-dim)' }} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>E-MAIL</label>
                    <input value={user?.email ?? ''} readOnly
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-dim)' }} />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>CPF *</label>
                    <input value={cpf} onChange={e => setCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--mono)' }} />
                  </div>
                </div>

                {error && <p className="text-xs mb-3" style={{ color: 'var(--red)' }}>{error}</p>}

                <button onClick={handleGerar} disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                  style={{ background: plan.color, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Gerando PIX...' : `Gerar PIX — ${plan.price}/mês`}
                </button>
              </>
            )}

            {step === 'pix' && pixData && (
              <>
                <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>
                  Pagamento via PIX
                </h2>
                <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>
                  {user?.name}, após o pagamento volte a esta página e atualize para liberar seu acesso.
                </p>

                {pixData.pixQrCode && (
                  <div className="flex justify-center mb-4">
                    <img src={`data:image/png;base64,${pixData.pixQrCode}`}
                      alt="QR Code PIX" className="rounded-lg"
                      style={{ width: 180, height: 180, background: '#fff', padding: 8 }} />
                  </div>
                )}

                <p className="text-xs mb-2 font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
                  PIX copia e cola
                </p>
                <div className="flex gap-2 mb-4">
                  <input readOnly value={pixData.pixCode}
                    className="flex-1 px-3 py-2 rounded-lg text-xs"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                </div>
                <button onClick={handleCopy}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: plan.color, border: 'none', cursor: 'pointer', color: '#fff' }}>
                  {copied ? <><CheckCheck size={16} /> Copiado!</> : <><Copy size={16} /> Copiar código</>}
                </button>
                <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
                  Assim que o pagamento for confirmado, seu plano será liberado automaticamente.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
