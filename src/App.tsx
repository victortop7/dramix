import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import WhatsAppChat from './components/WhatsAppChat'
import type { ReactNode } from 'react'

function ChatWidget() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/watch')) return null
  return <WhatsAppChat />
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
        <ChatWidget />
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
