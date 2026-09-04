import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { Role } from '../api/types'

export function ProtectedRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="page-surface page-surface--opaque flex-1 px-4 py-16 text-center text-muted">Loading…</div>
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'staff' ? '/team' : '/portal'} replace />

  return <>{children}</>
}
