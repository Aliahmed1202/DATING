import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../lib/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
