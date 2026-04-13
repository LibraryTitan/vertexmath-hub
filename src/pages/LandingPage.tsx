import { Box, Typography, Button, Container, Stack } from '@mui/material'
import SchoolIcon from '@mui/icons-material/School'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { motion } from 'framer-motion'
import { motion as motionTokens } from '../theme/designTokens'
import VertexMathLogo from '../components/branding/VertexMathLogo'
import { useHubColors } from '../themeMode'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // If already signed in, redirect to apps
  if (user) {
    navigate('/apps', { replace: true })
    return null
  }

  const c = useHubColors()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: c.contentBg, p: 3 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 18 }}>
          <Stack spacing={4} sx={{ alignItems: 'center' }}>
            {/* Logo */}
            <VertexMathLogo height={100} />

            <Typography variant="h3" sx={{
              textAlign: 'center',
              fontWeight: 800,
              background: `linear-gradient(135deg, ${c.textPrimary} 0%, ${c.primary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Welcome to VertexMath
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center', maxWidth: 500, color: c.textSecondary }}>
              Choose how you'd like to get started
            </Typography>

            {/* Role selector cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ width: '100%', justifyContent: 'center' }}>
              {/* Student Card */}
              <motion.div
                whileHover={motionTokens.cardHover}
                whileTap={motionTokens.cardTap}
                transition={motionTokens.springDefault}
                style={{ flex: '1 1 280px', maxWidth: 340, cursor: 'pointer' }}
                onClick={() => navigate('/signup/student')}
              >
                <Box sx={{
                  bgcolor: c.surface,
                  borderRadius: '16px',
                  border: '1px solid transparent',
                  p: 4,
                  textAlign: 'center',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: c.cardBorderHover },
                }}>
                  <SchoolIcon sx={{ fontSize: 56, color: c.primary, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>I'm a Student</Typography>
                  <Typography sx={{ mb: 3, color: c.textSecondary }}>
                    Learn math with interactive lessons and practice problems
                  </Typography>
                  <Button variant="contained" size="large" fullWidth sx={{
                    background: c.primaryGradient,
                    borderRadius: '12px',
                    fontWeight: 600,
                    '&:hover': { background: 'linear-gradient(135deg, #5fa5ea, #4a90d9)' },
                  }}>
                    Get Started
                  </Button>
                </Box>
              </motion.div>

              {/* Teacher Card */}
              <motion.div
                whileHover={motionTokens.cardHover}
                whileTap={motionTokens.cardTap}
                transition={motionTokens.springDefault}
                style={{ flex: '1 1 280px', maxWidth: 340, cursor: 'pointer' }}
                onClick={() => navigate('/signup/teacher')}
              >
                <Box sx={{
                  bgcolor: c.surface,
                  borderRadius: '16px',
                  border: '1px solid transparent',
                  p: 4,
                  textAlign: 'center',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: c.cardBorderHover },
                }}>
                  <MenuBookIcon sx={{ fontSize: 56, color: '#f48fb1', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: c.textPrimary }}>I'm a Teacher</Typography>
                  <Typography sx={{ mb: 3, color: c.textSecondary }}>
                    Create worksheets and manage your classes
                  </Typography>
                  <Button variant="contained" size="large" fullWidth sx={{
                    background: 'linear-gradient(135deg, #f48fb1, #e06090)',
                    borderRadius: '12px',
                    fontWeight: 600,
                    '&:hover': { background: 'linear-gradient(135deg, #e06090, #d04080)' },
                  }}>
                    Get Started
                  </Button>
                </Box>
              </motion.div>
            </Stack>

            <Typography sx={{ color: c.textSecondary }}>
              Already have an account?{' '}
              <Link to="/signin" style={{ color: c.primary, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </Typography>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  )
}
