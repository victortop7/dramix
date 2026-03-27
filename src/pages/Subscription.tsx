import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Crown, Star, ArrowLeft, Copy, CheckCheck, X, QrCode, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const plans = [
  {
    id: 'basic' as const,
    name: 'Básico',
    price: 'R$ 15,90',
    priceNum: 15.90,
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
    priceNum: 29.90,
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

type Step = 'method' | 'form' | 'pix'

interface PixData {
  pixCode: string
  pixQrCode: string
  planName: string
  price: string
}

const formatCpf = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 3) return n
  if (n.length <= 6) return `${n.slice(0,3)}.${n.slice(3)}`
  if (n.length <= 9) return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6)}`
  return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9)}`
}

const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
}

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null)
  const [step, setStep] = useState<Step>('method')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState((user as any)?.whatsapp ?? '')
  const [loading, setLoading] = useState(false)
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const openPlan = (plan: typeof plans[0]) => {
    if (!user) { navigate('/login'); return }
    setSelectedPlan(plan)
    setStep('method')
    setError('')
    setCpf('')
  }

  const closeModal = () => {
    setSelectedPlan(null)
    setPixData(null)
    setError('')
  }

  const generatePix = async () => {
    if (!selectedPlan || !user) return
    const rawCpf = cpf.replace(/\D/g, '')
    const rawPhone = phone.replace(/\D/g, '')
    if (rawCpf.length !== 11) { setError('CPF inválido — deve ter 11 dígitos'); return }
    if (rawPhone.length < 10) { setError('WhatsApp inválido'); return }

    setLoading(true)
    setError('')
    try {
      const data = await api.subscription.createPix(selectedPlan.id, rawCpf, rawPhone)
      setPixData({
        pixCode: data.pixCode,
        pixQrCode: data.pixQrCode,
        planName: selectedPlan.name,
        price: selectedPlan.price,
      })
      setStep('pix')
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
            <button onClick={() => openPlan(plan)}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white"
              style={{ ...plan.buttonStyle, border: 'none', cursor: 'pointer' }}>
              Assinar {plan.name}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
        Pagamento via PIX. Acesso liberado automaticamente após confirmação.
      </p>

      {/* Modal overlay */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text)' }}>
                  {step === 'method' && 'Como você quer pagar?'}
                  {step === 'form' && 'Pagamento via PIX'}
                  {step === 'pix' && 'Pagamento via PIX'}
                </h3>
                {step === 'method' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>Escolha entre PIX ou Cartão.</p>
                )}
                {step === 'form' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    Nome e E-mail já vêm da sua conta. Informe seu CPF e o WhatsApp, depois clique em <strong>Gerar PIX</strong>.
                  </p>
                )}
                {step === 'pix' && pixData && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    <strong style={{ color: 'var(--text)' }}>{user?.name}</strong>, após o pagamento volte para esta página e aguarde alguns segundos que sua conta já será liberada automaticamente.
                  </p>
                )}
              </div>
              <button onClick={closeModal}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0, marginLeft: 12 }}>
                <X size={20} />
              </button>
            </div>

            {/* Step: method */}
            {step === 'method' && (
              <div className="p-6 flex flex-col gap-3">
                <div className="rounded-xl px-4 py-3 mb-1"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{selectedPlan.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{selectedPlan.price}/mês</p>
                </div>
                <button onClick={() => setStep('form')}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
                  <QrCode size={16} /> PIX Único
                </button>
                <button
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'not-allowed', opacity: 0.6 }}
                  disabled>
                  <CreditCard size={16} /> Cartão de Crédito <span className="text-xs">(em breve)</span>
                </button>
              </div>
            )}

            {/* Step: form */}
            {step === 'form' && (
              <div className="p-6 flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>DADOS DA CONTA</label>
                  <div className="flex flex-col gap-2">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-dim)' }}>Nome</label>
                      <input value={user?.name ?? ''} readOnly className="input w-full text-sm"
                        style={{ opacity: 0.7, cursor: 'default' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-dim)' }}>E-mail</label>
                      <input value={user?.email ?? ''} readOnly className="input w-full text-sm"
                        style={{ opacity: 0.7, cursor: 'default' }} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-dim)' }}>CPF <span style={{ color: 'var(--red)' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={e => setCpf(formatCpf(e.target.value))}
                        className="input w-full text-sm"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-dim)' }}>WhatsApp <span style={{ color: 'var(--red)' }}>*</span></label>
                      <input
                        type="text"
                        placeholder="(00) 00000-0000"
                        value={phone}
                        onChange={e => setPhone(formatPhone(e.target.value))}
                        className="input w-full text-sm"
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>
                {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
                <button
                  onClick={() => void generatePix()}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-1"
                  style={{
                    background: 'var(--accent)',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}>
                  {loading ? 'Gerando PIX...' : 'Gerar PIX'}
                </button>
              </div>
            )}

            {/* Step: pix */}
            {step === 'pix' && pixData && (
              <div className="p-6 flex flex-col gap-4">
                {pixData.pixQrCode && (
                  <div className="flex justify-center">
                    <img
                      src={`data:image/png;base64,${pixData.pixQrCode}`}
                      alt="QR Code PIX"
                      style={{ width: 180, height: 180, background: '#fff', padding: 8, borderRadius: 12 }}
                    />
                  </div>
                )}
                {pixData.pixCode && (
                  <div>
                    <p className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>PIX copia e cola</p>
                    <div className="rounded-xl p-3 text-xs mb-2 break-all"
                      style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', color: 'var(--text-dim)' }}>
                      {pixData.pixCode}
                    </div>
                    <button
                      onClick={() => void copyPix()}
                      className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                      style={{
                        background: copied ? 'var(--green-dim)' : 'var(--accent)',
                        border: copied ? '1px solid var(--green)' : 'none',
                        color: copied ? 'var(--green)' : '#fff',
                        cursor: 'pointer',
                      }}>
                      {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
                      {copied ? 'Código Copiado!' : 'Copiar código'}
                    </button>
                  </div>
                )}
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Assim que o pagamento for confirmado pelo banco, seu plano será liberado automaticamente.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
