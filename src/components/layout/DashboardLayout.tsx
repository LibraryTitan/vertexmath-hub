import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { layout } from '../../theme/designTokens'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopBar from './DashboardTopBar'
import { useHubColors } from '../../themeMode'

interface DashboardLayoutProps {
  role: 'teacher' | 'admin'
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const c = useHubColors()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: c.background }}>
      <DashboardSidebar role={role} />
      <DashboardTopBar role={role} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          marginLeft: `${layout.sidebarWidth}px`,
          marginTop: `${layout.topBarHeight}px`,
          flex: 1,
          minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
          backgroundColor: c.contentBg,
          p: layout.contentPadding / 8,
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
