import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import type { ReactNode } from 'react'

const WA_NUMBER = '5585991295842'
const WA_MSG = encodeURIComponent('Olá! Vim pelo Dramix e preciso de ajuda 😊')

function WhatsAppButton() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/watch')) return null
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 999,
        width: 56, height: 56, borderRadius: '50%',
        background: '#25D366',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        textDecoration: 'none',
        animation: 'waPulse 2.5s ease-in-out infinite',
      }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.104 1.51 5.833L.057 23.428a.75.75 0 0 0 .921.921l5.594-1.453A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.694 9.694 0 0 1-4.953-1.357l-.355-.211-3.679.955.975-3.566-.232-.368A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
      </svg>
    </a>
  )
}

import Login from './pages/Login'
import Register from './pages/Register'
import SelectProfile from './pages/SelectProfile'
import Subscription from './pages/Subscription'
import Home from './pages/Home'
import DramaDetail from './pages/DramaDetail'
import Watch from './pages/Watch'
import MyList from './pages/MyList'
import Search from './pages/Search'
import Admin from './pages/Admin'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-10 h-10 rounded-full border-2 border-violet-600 border-t-transparent"
        style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  if (!user || !isAdmin()) return <Navigate to="/home" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <WhatsAppButton />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/select-profile" element={
            <RequireAuth><SelectProfile /></RequireAuth>
          } />
          <Route path="/assinatura" element={<Subscription />} />
          <Route path="/home" element={<Home />} />
          <Route path="/drama/:id" element={<DramaDetail />} />
          <Route path="/watch/:id" element={
            <RequireAuth><Watch /></RequireAuth>
          } />
          <Route path="/minha-lista" element={
            <RequireAuth><MyList /></RequireAuth>
          } />
          <Route path="/buscar" element={<Search />} />
          <Route path="/admin" element={
            <RequireAdmin><Admin /></RequireAdmin>
          } />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
