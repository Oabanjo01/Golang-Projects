import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from './useSession'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useSession()

  // Render nothing while the session resolves. Showing the login screen first
  // and then redirecting would flash the wrong UI at every already-logged-in
  // user on every page load.
  if (isLoading) return null

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
