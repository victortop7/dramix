import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, Profile } from '../types'
import { api } from '../lib/api'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; whatsapp?: string; password: string }) => Promise<void>
  logout: () => void
  setProfile: (profile: Profile | null) => void
  hasAccess: () => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dramix_token'))
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('dramix_token')
    if (!t) { setIsLoading(false); return }
    try {
      const { user: u } = await api.auth.me()
      setUser(u)
      const savedProfile = localStorage.getItem('dramix_profile')
      if (savedProfile) setProfile(JSON.parse(savedProfile) as Profile)
    } catch {
      localStorage.removeItem('dramix_token')
      localStorage.removeItem('dramix_profile')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void loadUser() }, [loadUser])

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await api.auth.login(email, password)
    localStorage.setItem('dramix_token', t)
    setToken(t)
    setUser(u)
  }

  const register = async (data: { name: string; email: string; whatsapp?: string; password: string }) => {
    const { token: t, user: u } = await api.auth.register(data)
    localStorage.setItem('dramix_token', t)
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('dramix_token')
    localStorage.removeItem('dramix_profile')
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  const selectProfile = (p: Profile | null) => {
    setProfile(p)
    if (p) localStorage.setItem('dramix_profile', JSON.stringify(p))
    else localStorage.removeItem('dramix_profile')
  }

  const hasAccess = () => {
    if (!user) return false
    if (user.isAdmin) return true
    return user.plan === 'basic' || user.plan === 'premium'
  }

  const isAdmin = () => user?.isAdmin === true

  return (
    <AuthContext.Provider value={{
      user, profile, token, isLoading,
      login, register, logout,
      setProfile: selectProfile,
      hasAccess, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
