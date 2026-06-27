import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import WhatsAppChat from './components/WhatsAppChat'
import RenewalWarning from './components/RenewalWarning'
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
import Configuracoes from './pages/Configuracoes'
import ForgotPassword from './pages/ForgotPassword'
import Categoria from './pages/Categoria'
import Landing from './pages/Landing'
import Termos from './pages/Termos'
import Privacidade from './pages/Privacidade'
import AuthGate from './components/AuthGate'
import SubscribeBanner from './components/SubscribeBanner'
import type { ReactNode } from 'react'

function ChatWidget() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/watch')) return null
  return (
    <>
      <WhatsAppChat />
      <RenewalWarning />
      <SubscribeBanner />
    </>
  )
}

function LandingOrHome() {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-10 h-10 rounded-full border-2 border-violet-600 border-t-transparent"
        style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (user) return <Navigate to="/home" replace />
  return <Landing />
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-10 h-10 rounded-full border-2 border-violet-600 border-t-transparent"
        style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  )
  if (!user) return <AuthGate />
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
        <ChatWidget />
        <Routes>
          <Route path="/" element={<LandingOrHome />} />
          <Route path="/pageone" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/select-profile" element={
            <RequireAuth><SelectProfile /></RequireAuth>
          } />
          <Route path="/assinatura" element={<Subscription />} />
          <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/drama/:id" element={<RequireAuth><DramaDetail /></RequireAuth>} />
          <Route path="/watch/:id" element={<RequireAuth><Watch /></RequireAuth>} />
          <Route path="/minha-lista" element={<RequireAuth><MyList /></RequireAuth>} />
          <Route path="/categoria/:slug" element={<RequireAuth><Categoria /></RequireAuth>} />
          <Route path="/buscar" element={<RequireAuth><Search /></RequireAuth>} />
          <Route path="/configuracoes" element={
            <RequireAuth><Configuracoes /></RequireAuth>
          } />
          <Route path="/vs2423" element={
            <RequireAdmin><Admin /></RequireAdmin>
          } />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
