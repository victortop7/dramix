import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Play, Eye, EyeOff } from 'lucide-react'
import { api } from '../lib/api'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // Etapa 1 — solicitar reset
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [waUrl, setWaUrl] = useState('')
  const [error, setError] = useState('')

  // Etapa 2 — nova senha (com token)
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.auth.forgotPassword(email)
      setSent(true)
      if (data.waUrl) setWaUrl(data.waUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPwd !== confirmPwd) { setError('As senhas não coincidem'); return }
    if (newPwd.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    try {
      await api.auth.resetPassword(token!, newPwd)
      setResetDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>

      <Link to="/" className="flex items-center gap-2 mb-10 text-decoration-none">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent)' }}>
          <Play size={18} fill="white" color="white" />
        </div>
        <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Dramix</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl p-8 fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

        {/* ETAPA 2 — nova senha com token */}
        {token && !resetDone && (
          <>
            <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--text)' }}>Nova Senha</h1>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-dim)' }}>Digite sua nova senha abaixo</p>
            <form onSubmit={(e) => void handleReset(e)} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>Nova Senha</label>
                <div className="relative">
                  <input className="input w-full pr-12" type={showPwd ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>Confirmar Senha</label>
                <input className="input w-full" type="password" placeholder="Repita a senha"
                  value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-center rounded-lg p-3"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Nova Senha'}
              </button>
            </form>
          </>
        )}

        {/* ETAPA 2 — concluído */}
        {token && resetDone && (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Senha redefinida!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>Sua senha foi alterada com sucesso.</p>
            <Link to="/login" className="btn-primary">Fazer login</Link>
          </div>
        )}

        {/* ETAPA 1 — formulário */}
        {!token && !sent && (
          <>
            <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--text)' }}>Esqueci minha senha</h1>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-dim)' }}>
              Informe seu e-mail e entraremos em contato via WhatsApp para redefinir sua senha.
            </p>
            <form onSubmit={(e) => void handleRequest(e)} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>E-mail</label>
                <input type="email" className="input w-full" placeholder="seuemail@exemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-center rounded-lg p-3"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}
              <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                {loading ? 'Enviando...' : 'Solicitar Reset'}
              </button>
            </form>
            <p className="text-sm text-center mt-6" style={{ color: 'var(--text-dim)' }}>
              <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>← Voltar ao login</Link>
            </p>
          </>
        )}

        {/* ETAPA 1 — enviado */}
        {!token && sent && (
          <div className="text-center">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Solicitação enviada!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-dim)' }}>
              Se o e-mail estiver cadastrado, nossa equipe entrará em contato via WhatsApp em breve com o link para redefinir sua senha.
            </p>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center"
                style={{ display: 'flex', textDecoration: 'none' }}>
                💬 Abrir WhatsApp agora
              </a>
            )}
            <p className="text-sm mt-4" style={{ color: 'var(--text-dim)' }}>
              <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>← Voltar ao login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
