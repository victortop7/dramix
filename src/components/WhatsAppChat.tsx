import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'

const WA_NUMBER = '5585991295842'

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')

  const openWA = () => {
    const text = msg.trim() || 'Olá! Vim pelo Dramix e preciso de ajuda 😊'
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <>
      {/* Card de chat */}
      {open && (
        <div
          className="fixed z-50 fade-up"
          style={{
            bottom: 88, right: 20,
            width: 320,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            padding: '16px 16px 20px',
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                  D
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">Dramix</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ opacity: 0.9 }} />
                    <p className="text-xs text-white" style={{ opacity: 0.8 }}>Online agora</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 4, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
            <p className="text-sm font-semibold text-white">Dúvidas? Fale conosco! 👋</p>
          </div>

          {/* Corpo */}
          <div style={{ background: '#111118', padding: 16 }}>
            {/* Bolha de mensagem */}
            <div className="flex items-start gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: '#25D366' }}>D</div>
              <div className="px-3 py-2 rounded-2xl rounded-tl-none text-sm"
                style={{ background: '#1e1e2a', color: 'var(--text)', maxWidth: 220, lineHeight: 1.4 }}>
                Olá! Como posso ajudar você? 😊
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2 items-center">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && openWA()}
                placeholder="Escreva sua mensagem..."
                className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
                style={{
                  background: '#1e1e2a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text)',
                }}
              />
              <button onClick={openWA}
                style={{
                  background: '#25D366', border: 'none', borderRadius: 10,
                  width: 38, height: 38, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>

            <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              Abre no WhatsApp
            </p>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Abrir chat"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%',
          background: '#25D366', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
          animation: open ? 'none' : 'waPulse 2.5s ease-in-out infinite',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(0deg) scale(1.05)' : 'none',
        }}>
        {open
          ? <X size={24} color="white" />
          : <MessageCircle size={26} color="white" fill="white" />}
      </button>
    </>
  )
}
