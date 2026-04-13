import { Box, Container, Typography, Grid, CardContent, Stack, Button, Avatar, Chip, IconButton, Tooltip } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import DescriptionIcon from '@mui/icons-material/Description'
import GroupsIcon from '@mui/icons-material/Groups'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { getCustomTokenForRedirect } from '../sso'
import { motion } from 'framer-motion'
import { motion as motionTokens } from '../theme/designTokens'
import VertexMathLogo from '../components/branding/VertexMathLogo'
import { useHubColors, useHubThemeMode } from '../themeMode'

type HubApp = {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  roles: string[]
  url?: string
  route?: string
}

const apps: HubApp[] = [
  {
    id: 'vmo',
    title: 'VertexMath Online',
    subtitle: 'Interactive lessons, practice & progress tracking',
    icon: <SchoolIcon sx={{ fontSize: 48 }} />,
    color: '#1976d2',
    url: 'https://online.vertexmath.org',
    roles: ['student', 'teacher', 'orgAdmin', 'superAdmin'],
  },
  {
    id: 'pb',
    title: 'Paper Builder',
    subtitle: 'Create worksheets, quizzes & note-guides',
    icon: <DescriptionIcon sx={{ fontSize: 48 }} />,
    color: '#7b1fa2',
    url: 'https://builder.vertexmath.org',
    roles: ['teacher', 'orgAdmin', 'superAdmin'],
  },
  {
    id: 'teacher-portal',
    title: 'Teacher Portal',
    subtitle: 'Classes, assignments, analytics and question banks',
    icon: <GroupsIcon sx={{ fontSize: 48 }} />,
    color: '#0ea5a4',
    route: '/teacher',
    roles: ['teacher', 'orgAdmin', 'superAdmin'],
  },
  {
    id: 'admin-portal',
    title: 'Admin Portal',
    subtitle: 'Users, organizations, subscriptions and licenses',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />,
    route: '/admin',
    color: '#f59e0b',
    roles: ['orgAdmin', 'superAdmin'],
  },
]

export default function AppsPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { user, userRole, firstName, signOut } = useAuth()
  const { mode, toggleMode } = useHubThemeMode()
  const c = useHubColors()

  const handleAppClick = async (app: HubApp) => {
    if (app.route) {
      navigate(app.route)
      return
    }

    try {
      const token = await getCustomTokenForRedirect()
      if (token) {
        console.log(`[SSO] Hub → ${app.id.toUpperCase()} redirect:`, {
          email: user?.email,
          uid: user?.uid,
          role: userRole,
          targetApp: app.id,
          tokenLength: token.length,
        })
        window.location.href = `${app.url}?authToken=${encodeURIComponent(token)}`
      } else {
        console.warn(`[SSO] Hub → ${app.id.toUpperCase()}: token is null, redirecting without SSO`)
        window.location.href = app.url || '/apps'
      }
    } catch {
      // Fallback: just redirect without SSO token
      window.location.href = app.url || '/apps'
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const displayName = firstName || user?.email?.split('@')[0] || 'User'

  const visibleApps = apps.filter(app => {
    if (!userRole) return true // show all while loading
    return app.roles.includes(userRole)
  })

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.contentBg }}>
      {/* Top Bar */}
      <Box sx={{
        px: 3, py: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: c.divider,
        bgcolor: c.topBarBg,
        backdropFilter: 'blur(12px)',
      }}>
        <VertexMathLogo height={32} to="/apps" />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleMode} sx={{ color: c.textSecondary, '&:hover': { backgroundColor: theme.palette.action.hover, color: c.textPrimary } }}>
              {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button size="small" startIcon={<AccountCircleIcon />} onClick={() => navigate('/account')} sx={{ textTransform: 'none', color: c.textSecondary }}>
            Account
          </Button>
          <Button size="small" startIcon={<LogoutIcon />} onClick={handleSignOut} sx={{ textTransform: 'none', color: c.textSecondary }}>
            Sign Out
          </Button>
        </Stack>
      </Box>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 18 }}>
          <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: c.textPrimary }}>
              Welcome, {displayName}!
            </Typography>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
              <Typography sx={{ color: c.textSecondary }}>Your role:</Typography>
              <Chip label={userRole || 'loading…'} size="small" sx={{
                bgcolor: 'rgba(116, 185, 255, 0.12)',
                color: c.primary,
                fontWeight: 600,
                border: `1px solid rgba(116, 185, 255, 0.25)`,
              }} />
            </Stack>
          </Stack>

          <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {visibleApps.map((app, index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={app.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 18, delay: index * 0.1 }}
                >
                  <motion.div
                    whileHover={motionTokens.cardHover}
                    whileTap={motionTokens.cardTap}
                    transition={motionTokens.springDefault}
                    style={{ cursor: 'pointer', height: '100%' }}
                    onClick={() => handleAppClick(app)}
                  >
                    <Box sx={{
                      bgcolor: c.surface,
                      borderRadius: '16px',
                      border: '1px solid transparent',
                      p: 3,
                      height: '100%',
                      transition: 'border-color 0.2s',
                      '&:hover': { borderColor: c.cardBorderHover },
                    }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: app.color, width: 80, height: 80, mx: 'auto', mb: 2 }}>
                          {app.icon}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>
                          {app.title}
                        </Typography>
                        <Typography sx={{ color: c.textSecondary }}>
                          {app.subtitle}
                        </Typography>
                      </CardContent>
                    </Box>
                  </motion.div>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {userRole === 'student' && (
            <Typography sx={{ textAlign: 'center', mt: 4, color: c.textSecondary }}>
              Paper Builder is available to teachers. Ask your teacher for access!
            </Typography>
          )}
        </motion.div>
      </Container>
    </Box>
  )
}
