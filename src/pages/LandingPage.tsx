import { Box, Card, CardContent, CardActionArea, Typography, Button, Container, Stack } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // If already signed in, redirect to apps
  if (user) {
    navigate('/apps', { replace: true })
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="md">
        <Stack spacing={4} sx={{ alignItems: 'center' }}>
          {/* Logo */}
          <Box component="img" src="/logo/logo_transparent.png" alt="VertexMath" sx={{ height: 64, width: 'auto', objectFit: 'contain' }} />

          <Typography variant="h3" sx={{ textAlign: 'center' }} color="text.primary">
            Welcome to VertexMath
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 500 }}>
            Choose how you'd like to get started
          </Typography>

          {/* Role selector cards */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: '100%', justifyContent: 'center' }}>
            {/* Student Card */}
            <Card elevation={3} sx={{ flex: '1 1 280px', maxWidth: 340 }}>
              <CardActionArea onClick={() => navigate('/signup/student')} sx={{ p: 3, textAlign: 'center' }}>
                <CardContent>
                  <SchoolIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>I'm a Student</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Learn math with interactive lessons and practice problems
                  </Typography>
                  <Button variant="contained" size="large" fullWidth>
                    Get Started
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>

            {/* Teacher Card */}
            <Card elevation={3} sx={{ flex: '1 1 280px', maxWidth: 340 }}>
              <CardActionArea onClick={() => navigate('/signup/teacher')} sx={{ p: 3, textAlign: 'center' }}>
                <CardContent>
                  <MenuBookIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>I'm a Teacher</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Create worksheets and manage your classes
                  </Typography>
                  <Button variant="contained" color="secondary" size="large" fullWidth>
                    Get Started
                  </Button>
                </CardContent>
              </CardActionArea>
            </Card>
          </Stack>

          <Typography color="text.secondary">
            Already have an account?{' '}
            <Link to="/signin" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
