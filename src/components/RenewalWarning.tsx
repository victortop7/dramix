import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const POPUP_INTERVAL = 30 * 60 * 1000 // 30 minutos
const POPUP_KEY = 'dramix_renewal_popup_last'

export default function RenewalWarning() {
  const { user } = useAuth()
  const [pixCode, setPixCode] = useState('')
  const [pixQrCode, setPixQrCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)
  const [loadingPix, setLoadingPix] = useState(false)

  const fetchPix = useCallback(async () => {
    if (loadingPix || pixCode) return
    setLoadingPix(true)
    try {
      const data = await api.subscription.getRenewal()
      setPixCode(data.pixCode)
      setPixQrCode(data.pixQrCode)
    } catch {}
    finally { setLoadingPix(false) }
  }, [loadingPix, pixCode])

  useEffect(() => {
    if (!user || user.isAdmin) return
    if (user.plan !== 'basic' && user.plan !== 'premium') return
    if (!user.planExpiresAt) return

    const expires = new Date(user.planExpiresAt)
    const now = new Date()
    const diff = expires.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    setDaysLeft(days)

    // Dia 29 ou menos: banner
    if (days <= 1) {
      setShowBanner(true)
      void fetchPix()
    }

    // Dias 0 a -5 (tolerância): popup a cada 30 min
    if (days <= 0 && days >= -5) {
      const last = parseInt(localStorage.getItem(POPUP_KEY) ?? '0')
      if (Date.now() - last > POPUP_INTERVAL) {
        setShowPopup(true)
        localStorage.setItem(POPUP_KEY, String(Date.now()))
        void fetchPix()
      }
      // Reagenda popup
      const timer = setInterval(() => {
        setShowPopup(true)
        localStorage.setItem(POPUP_KEY, String(Date.now()))
      }, POPUP_INTERVAL)
      return () => clearInterval(timer)
    }
  }, [user])

  const copy = async () => {
    await navigator.clipboard.writeText(pixCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!showBanner && !showPopup) return null

  const isGrace = daysLeft <= 0
  const planLabel = user?.plan === 'premium' ? 'Premium' : 'Básico'
  const price = user?.plan === 'premium' ? 'R$24,90' : 'R$12,90'

  const PixContent = () => (
    <div>
      <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
        {isGrace
          ? `Seu plano venceu. Você tem ${Math.abs(daysLeft)} dia(s) restantes no período de tolerância.`
          : `Seu plano ${planLabel} renova em breve. Pague agora para não perder o acesso.`}
      </p>

      {loadingPix ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : pixCode ? (
        <div>
          {pixQrCode && (
            <div className="flex justify-center mb-4">
              <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX"
                className="rounded-xl" style={{ width: 160, height: 160 }} />
            </div>
          )}
          <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-dim)' }}>PIX Copia e Cola</p>
          <div className="flex gap-2">
            <input readOnly value={pixCode} className="input flex-1 text-xs"
              style={{ fontFamily: 'var(--mono)', fontSize: 11 }} />
            <button onClick={() => void copy()} className="btn-primary px-3 flex-shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          {copied && <p className="text-xs mt-1" style={{ color: 'var(--green)' }}>Copiado!</p>}
          <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Valor: <strong style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{price}/mês</strong>
          </p>
        </div>
      ) : (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Não foi possível carregar o PIX. Verifique seu e-mail para o link de pagamento.
        </p>
      )}
    </div>
  )

  return (
    <>
      {/* Banner + popup dia 29 */}
      {showBanner && !isGrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--amber)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown size={18} style={{ color: 'var(--amber)' }} />
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>Renovar Plano</h3>
              </div>
              <button onClick={() => setShowBanner(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <PixContent />
          </div>
        </div>
      )}

      {/* Popup de renovação (grace period ou banner expandido) */}
      {(showPopup || (showBanner && isGrace)) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'var(--surface)', border: `1px solid ${isGrace ? 'var(--red)' : 'var(--amber)'}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown size={18} style={{ color: isGrace ? 'var(--red)' : 'var(--amber)' }} />
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>
                  {isGrace ? 'Plano Vencido' : 'Renovar Plano'}
                </h3>
              </div>
              {!isGrace && (
                <button onClick={() => setShowPopup(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              )}
            </div>
            <PixContent />
            {isGrace && (
              <p className="text-xs text-center mt-3" style={{ color: 'var(--red)' }}>
                Após o período de tolerância o acesso será bloqueado.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
