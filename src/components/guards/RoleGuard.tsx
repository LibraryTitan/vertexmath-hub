import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../../AuthProvider'

interface RoleGuardProps {
  /** Roles allowed to access the wrapped routes */
  allowedRoles: string[]
  children: React.ReactNode
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, userRole, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/apps" replace />
  }

  return <>{children}</>
}
