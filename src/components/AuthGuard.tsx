import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireWaliSantriPending?: boolean
}

export default function AuthGuard({
  children,
  requireWaliSantriPending = false,
}: AuthGuardProps) {
  const { user, profile, roles, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    if (roles.length === 0) {
      navigate('/unauthorized', { replace: true })
      return
    }

    const isWaliSantri = roles.some((r) => r.nama_role === 'WALI_SANTRI')

    if (requireWaliSantriPending) {
      if (!isWaliSantri || profile?.status_aktivasi !== 'PENDING') {
        navigate('/dashboard', { replace: true })
      }
    } else {
      if (isWaliSantri && profile?.status_aktivasi === 'PENDING') {
        navigate('/aktivasi-wa', { replace: true })
      }
    }
  }, [user, profile, roles, isLoading, navigate, requireWaliSantriPending])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
