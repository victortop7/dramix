import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Crown, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const AVATAR_EMOJIS: Record<string, string> = {
  robot: '🤖', cat: '🐱', fox: '🦊', panda: '🐼',
  bear: '🐻', dragon: '🐉', fairy: '🧚', ninja: '🥷',
}

export default function Configuracoes() {
  const { user, profile, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name ?? '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState('')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdError, setPwdError] = useState('')

  const planLabel = user?.plan === 'premium' ? 'Premium' : user?.plan === 'basic' ? 'Básico' : 'Gratuito'
  const planColor = user?.plan === 'premium' ? 'var(--amber)' : user?.plan === 'basic' ? 'var(--blue)' : 'var(--text-dim)'

  const saveName = async () => {
    if (!name.trim() || name.trim() === user?.name) return
    setNameSaving(true)
    setNameMsg('')
    try {
      await api.user.updateSettings({ name: name.trim() })
      await refreshUser()
      setNameMsg('Nome atualizado com sucesso!')
    } catch (e) {
      setNameMsg(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setNameSaving(false)
      setTimeout(() => setNameMsg(''), 3000)
    }
  }

  const savePwd = async () => {
    setPwdError('')
    setPwdMsg('')
    if (!currentPwd || !newPwd || !confirmPwd) { setPwdError('Preencha todos os campos'); return }
    if (newPwd !== confirmPwd) { setPwdError('As senhas não coincidem'); return }
    if (newPwd.length < 6) { setPwdError('Nova senha deve ter pelo menos 6 caracteres'); return }
    setPwdSaving(true)
    try {
      await api.user.updateSettings({ currentPassword: currentPwd, newPassword: newPwd })
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      setPwdMsg('Senha atualizada com sucesso!')
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : 'Erro ao atualizar senha')
    } finally {
      setPwdSaving(false)
      setTimeout(() => setPwdMsg(''), 3000)
    }
  }

  if (!user) return null

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pb-16" style={{ paddingTop: 'calc(var(--navbar-h) + 32px)' }}>

        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Configurações</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Gerencie sua conta e preferências</p>

        {/* Configuração da Conta */}
        <section className="rounded-2xl p-6 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <User size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Configuração da Conta</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Gerencie suas informações pessoais</p>

          {/* Avatar + perfil atual */}
          {profile && (
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: 'var(--surface-alt)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'var(--accent-dim)' }}>
                {AVATAR_EMOJIS[profile.avatar] ?? '👤'}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{profile.name}</p>
                <button className="text-xs" style={{ color: 'var(--accent-light)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => navigate('/select-profile')}>
                  Trocar perfil
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-dim)' }}>Nome</label>
              <input className="input w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-dim)' }}>E-mail</label>
              <input className="input w-full" value={user.email} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
          </div>

          {nameMsg && (
            <p className="text-xs mb-3" style={{ color: 'var(--green)' }}>{nameMsg}</p>
          )}

          <button className="btn-primary text-sm" onClick={() => void saveName()} disabled={nameSaving || name.trim() === user.name}>
            {nameSaving ? 'Salvando...' : 'Salvar Nome'}
          </button>
        </section>

        {/* Alterar Senha */}
        <section className="rounded-2xl p-6 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} style={{ color: 'var(--accent)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Alterar Senha</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Mantenha sua conta segura</p>

          <div className="mb-4">
            <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-dim)' }}>Senha Atual</label>
            <div className="relative">
              <input className="input w-full pr-10" type={showCurrent ? 'text' : 'password'}
                value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowCurrent(v => !v)}>
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-dim)' }}>Nova Senha</label>
              <div className="relative">
                <input className="input w-full pr-10" type={showNew ? 'text' : 'password'}
                  value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onClick={() => setShowNew(v => !v)}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--text-dim)' }}>Confirmar Nova Senha</label>
              <input className="input w-full" type="password"
                value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repita a senha" />
            </div>
          </div>

          {pwdError && <p className="text-xs mb-3" style={{ color: 'var(--red)' }}>{pwdError}</p>}
          {pwdMsg && <p className="text-xs mb-3" style={{ color: 'var(--green)' }}>{pwdMsg}</p>}

          <button className="btn-primary text-sm" onClick={() => void savePwd()} disabled={pwdSaving}>
            {pwdSaving ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </section>

        {/* Plano */}
        <section className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Crown size={16} style={{ color: 'var(--amber)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Meu Plano</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Gerencie sua assinatura</p>

          <div className="flex items-center justify-between p-4 rounded-xl mb-4"
            style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: planColor }}>Plano {planLabel}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {user.plan === 'free' ? 'Acesso limitado a 30 minutos' :
                 user.plan === 'basic' ? 'Acesso ilimitado — 1 tela' :
                 user.plan === 'premium' ? 'Acesso ilimitado — até 3 telas' : 'Acesso total'}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: 'var(--accent-dim)', color: planColor }}>
              {planLabel}
            </span>
          </div>

          {user.plan === 'free' && (
            <button className="btn-primary text-sm w-full justify-center" onClick={() => navigate('/assinatura')}>
              <Crown size={14} /> Assinar agora — R$15,90/mês
            </button>
          )}
          {(user.plan === 'basic' || user.plan === 'premium') && (
            <button className="btn-secondary text-sm" onClick={() => navigate('/assinatura')}>
              Gerenciar assinatura
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
