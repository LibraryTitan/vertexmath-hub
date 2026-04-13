import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupsIcon from '@mui/icons-material/Groups'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BarChartIcon from '@mui/icons-material/BarChart'
import QuizIcon from '@mui/icons-material/Quiz'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import CardMembershipIcon from '@mui/icons-material/CardMembership'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  layout,
  typography as typo,
  motion as motionTokens,
  zIndex,
  FONT_BODY,
} from '../../theme/designTokens'
import VertexMathLogo from '../branding/VertexMathLogo'
import { useAuth } from '../../AuthProvider'
import { useHubColors } from '../../themeMode'

const MotionBox = motion.create(Box)

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const teacherNav: NavItem[] = [
  { label: 'Overview', path: '/teacher', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Classes', path: '/teacher/classes', icon: <GroupsIcon fontSize="small" /> },
  { label: 'Assignments', path: '/teacher/assignments', icon: <AssignmentIcon fontSize="small" /> },
  { label: 'Analytics', path: '/teacher/analytics', icon: <BarChartIcon fontSize="small" /> },
  { label: 'Question Banks', path: '/teacher/question-banks', icon: <QuizIcon fontSize="small" /> },
]

const adminNav: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: <DashboardIcon fontSize="small" /> },
  { label: 'Users', path: '/admin/users', icon: <PeopleIcon fontSize="small" /> },
  { label: 'Organizations', path: '/admin/orgs', icon: <BusinessIcon fontSize="small" /> },
  { label: 'Subscriptions', path: '/admin/subscriptions', icon: <CardMembershipIcon fontSize="small" /> },
  { label: 'Licenses', path: '/admin/licenses', icon: <VpnKeyIcon fontSize="small" /> },
]

interface DashboardSidebarProps {
  role: 'teacher' | 'admin'
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const theme = useTheme()
  const c = useHubColors()
  const navItems = role === 'admin' ? adminNav : teacherNav

  const isActive = (path: string) => {
    if (path === `/${role}`) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: layout.sidebarWidth,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: c.sidebarBg,
        borderRight: `1px solid ${c.sidebarBorder}`,
        zIndex: zIndex.sidebar,
      }}
    >
      {/* Brand header */}
      <Box
        sx={{
          height: layout.topBarHeight,
          display: 'flex',
          alignItems: 'center',
          px: layout.sidebarPadding / 8,
          pl: 2.5,
          backgroundColor: c.sidebarHeaderBg,
          borderBottom: `1px solid ${c.sidebarBorder}`,
        }}
      >
        <VertexMathLogo height={34} to={`/${role}`} />
      </Box>

      {/* Section label */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography
          sx={{
            fontFamily: FONT_BODY,
            fontSize: typo.sectionLabel.size,
            fontWeight: typo.sectionLabel.weight,
            letterSpacing: typo.sectionLabel.letterSpacing,
            textTransform: typo.sectionLabel.textTransform,
            color: c.sectionLabel,
          }}
        >
          {role === 'admin' ? 'Administration' : 'Teaching'}
        </Typography>
      </Box>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <MotionBox
              key={item.path}
              whileHover={motionTokens.navHover}
              whileTap={motionTokens.navTap}
              transition={motionTokens.springDefault}
              onClick={() => navigate(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                cursor: 'pointer',
                backgroundColor: active ? c.activeNavBg : 'transparent',
                color: active ? c.activeNavText : c.textSecondary,
                transition: `background-color 0.15s, color 0.15s`,
                '&:hover': {
                  backgroundColor: active ? c.activeNavBg : theme.palette.action.hover,
                },
              }}
            >
              {item.icon}
              <Typography
                sx={{
                  fontFamily: FONT_BODY,
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 500,
                }}
              >
                {item.label}
              </Typography>
            </MotionBox>
          )
        })}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          backgroundColor: c.sidebarFooterBg,
          borderTop: `1px solid ${c.sidebarBorder}`,
        }}
      >
        <MotionBox
          whileHover={motionTokens.navHover}
          whileTap={motionTokens.navTap}
          transition={motionTokens.springDefault}
          onClick={() => { signOut() }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 1.5,
            cursor: 'pointer',
            color: c.textMuted,
            '&:hover': { backgroundColor: theme.palette.action.hover, color: c.textSecondary },
          }}
        >
          <LogoutIcon fontSize="small" />
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.8125rem', fontWeight: 500 }}>
            Sign Out
          </Typography>
        </MotionBox>
      </Box>
    </Box>
  )
}
