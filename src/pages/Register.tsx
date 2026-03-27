import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Play } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', whatsapp: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(v => ({ ...v, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('As senhas não coincidem'); return }
    if (form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    if (!agreed) { setError('Você precisa aceitar os termos'); return }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, whatsapp: form.whatsapp, password: form.password })
      navigate('/select-profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg)' }}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10" style={{ textDecoration: 'none' }}>
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
          Criar Conta
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-dim)' }}>
          Preencha os dados abaixo para criar sua conta
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          {[
            { label: 'Primeiro Nome', field: 'name', type: 'text', placeholder: 'Seu primeiro nome' },
            { label: 'WhatsApp', field: 'whatsapp', type: 'tel', placeholder: '(11) 98888-7777' },
            { label: 'E-mail', field: 'email', type: 'email', placeholder: 'seu@email.com' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>
                {label}
              </label>
              <input
                type={type}
                className="input"
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={set(field)}
                required={field !== 'whatsapp'}
              />
            </div>
          ))}

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-12"
                placeholder="Crie uma senha com pelo menos 6 caracteres"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dim)' }}>
              Confirmar Senha
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Digite a senha novamente"
              value={form.confirm}
              onChange={set('confirm')}
              required
              autoComplete="new-password"
            />
          </div>

          {/* Termos */}
          <label className="flex items-start gap-3 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 accent-violet-600"
              style={{ width: 16, height: 16 }}
            />
            <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Aceito os{' '}
              <Link to="/termos" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Termos de Uso</Link>
              {' '}e{' '}
              <Link to="/privacidade" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Política de Privacidade</Link>
            </span>
          </label>

          {error && (
            <p className="text-sm text-center rounded-lg p-3"
              style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center mt-2"
            disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-sm text-center mt-5" style={{ color: 'var(--text-dim)' }}>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  )
}
