import { Box, Container, Typography, Grid, Card, CardContent, CardActionArea, Stack, Button, Avatar, Chip } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import DescriptionIcon from '@mui/icons-material/Description'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { getCustomTokenForRedirect } from '../sso'

const apps = [
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
]

export default function AppsPage() {
  const navigate = useNavigate()
  const { user, userRole, firstName, signOut } = useAuth()

  const handleAppClick = async (app: typeof apps[0]) => {
    try {
      const token = await getCustomTokenForRedirect()
      if (token) {
        window.location.href = `${app.url}?authToken=${encodeURIComponent(token)}`
      } else {
        window.location.href = app.url
      }
    } catch {
      // Fallback: just redirect without SSO token
      window.location.href = app.url
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top Bar */}
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">VertexMath</Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button size="small" startIcon={<AccountCircleIcon />} onClick={() => navigate('/account')} sx={{ textTransform: 'none' }}>
            Account
          </Button>
          <Button size="small" startIcon={<LogoutIcon />} onClick={handleSignOut} color="inherit" sx={{ textTransform: 'none' }}>
            Sign Out
          </Button>
        </Stack>
      </Box>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome, {displayName}!
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            <Typography color="text.secondary">Your role:</Typography>
            <Chip label={userRole || 'loading…'} size="small" color="primary" variant="outlined" />
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {visibleApps.map(app => (
            <Grid size={{ xs: 12, sm: 6 }} key={app.id}>
              <Card elevation={2} sx={{ borderRadius: 3, height: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 8 } }}>
                <CardActionArea onClick={() => handleAppClick(app)} sx={{ p: 3, height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: app.color, width: 80, height: 80, mx: 'auto', mb: 2 }}>
                      {app.icon}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {app.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {app.subtitle}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {userRole === 'student' && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Paper Builder is available to teachers. Ask your teacher for access!
          </Typography>
        )}
      </Container>
    </Box>
  )
}
