import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Play } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/select-profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10 text-decoration-none">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent)' }}>
          <Play size={18} fill="white" color="white" />
        </div>
        <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Dramix</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl p-8 fade-up"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: 'var(--text)' }}>
          Entrar na Conta
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-dim)' }}>
          Entre com suas credenciais para acessar sua conta
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>
              E-mail
            </label>
            <input
              type="email"
              className="input"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-center rounded-lg p-3"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Link to="/forgot-password" className="text-sm"
              style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
              Esqueci minha senha
            </Link>
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: 'var(--text-dim)' }}>
          Não tem conta?{' '}
          <Link to="/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
