import { useState } from 'react'
import { Box, TextField, Button, Typography, Container, Stack, Divider, Alert, CircularProgress, IconButton } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { motion } from 'framer-motion'
import { useHubColors } from '../themeMode'

const getInputSx = (borderColor: string, hoverBorderColor: string, backgroundColor: string, accentColor: string) => ({
  '& .MuiOutlinedInput-root': {
    bgcolor: backgroundColor,
    borderRadius: '12px',
    '& fieldset': { borderColor },
    '&:hover fieldset': { borderColor: hoverBorderColor },
    '&.Mui-focused fieldset': { borderColor: accentColor },
  },
})

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, user } = useAuth()
  const c = useHubColors()
  const inputSx = getInputSx(c.topBarBorder, c.cardBorderHover, c.surfaceContainer, c.primary)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [needsRole, setNeedsRole] = useState(false)

  if (user) {
    navigate('/apps', { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/apps')
    } catch (err: any) {
      const code = err.code || ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError(err.message || 'Sign in failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await signInWithGoogle()
      navigate('/apps')
    } catch (err: any) {
      if (err.code === 'auth/no-account') {
        setNeedsRole(true)
        setError(null)
      } else {
        setError(err.message || 'Google sign-in failed.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleSelect = async (role: 'student' | 'teacher') => {
    setError(null)
    setSubmitting(true)
    try {
      await signInWithGoogle(role)
      navigate('/apps')
    } catch (err: any) {
      setError(err.message || 'Account creation failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: c.contentBg, p: 3 }}>
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 18 }}>
          <Box sx={{ bgcolor: c.surface, borderRadius: '16px', p: 4, border: '1px solid', borderColor: c.divider }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 1, color: c.textSecondary }} aria-label="Back to home">
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1, textAlign: 'center', mr: 5, color: c.textPrimary }}>Sign In</Typography>
              </Box>
              <Typography sx={{ textAlign: 'center', color: c.textSecondary }}>
                Welcome back to VertexMath
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              {needsRole ? (
                <>
                  <Typography sx={{ textAlign: 'center', fontWeight: 600, color: c.textPrimary }}>
                    No account found. Select your role to create one:
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" size="large" onClick={() => handleRoleSelect('student')} disabled={submitting} fullWidth
                      sx={{ background: c.primaryGradient, borderRadius: '12px', '&:hover': { background: 'linear-gradient(135deg, #5fa5ea, #4a90d9)' } }}>
                      {submitting ? <CircularProgress size={24} /> : "I'm a Student"}
                    </Button>
                    <Button variant="contained" size="large" onClick={() => handleRoleSelect('teacher')} disabled={submitting} fullWidth
                      sx={{ background: 'linear-gradient(135deg, #f48fb1, #e06090)', borderRadius: '12px', '&:hover': { background: 'linear-gradient(135deg, #e06090, #d04080)' } }}>
                      {submitting ? <CircularProgress size={24} /> : "I'm a Teacher"}
                    </Button>
                  </Stack>
                  <Button variant="text" size="small" onClick={() => setNeedsRole(false)} sx={{ textTransform: 'none', color: c.primary }}>
                    ← Back to Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} disabled={submitting} fullWidth
                    sx={{
                      borderRadius: '12px',
                      borderColor: 'rgba(72, 72, 71, 0.3)',
                      color: c.textPrimary,
                      bgcolor: c.surfaceContainer,
                      '&:hover': { borderColor: 'rgba(72, 72, 71, 0.5)', bgcolor: c.surfaceBright },
                    }}>
                    Sign in with Google
                  </Button>

                  <Divider sx={{ '&::before, &::after': { borderColor: c.divider } }}>
                    <Typography sx={{ color: c.textMuted, fontSize: '0.85rem' }}>or</Typography>
                  </Divider>

                  <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                      <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth autoFocus sx={inputSx} />
                      <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth sx={inputSx} />
                      <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth
                        sx={{ background: c.primaryGradient, borderRadius: '12px', fontWeight: 600, '&:hover': { background: 'linear-gradient(135deg, #5fa5ea, #4a90d9)' } }}>
                        {submitting ? <CircularProgress size={24} /> : 'Sign In'}
                      </Button>
                    </Stack>
                  </form>
                </>
              )}

              <Typography sx={{ textAlign: 'center', color: c.textSecondary }}>
                Don't have an account?{' '}
                <Link to="/" style={{ color: c.primary, textDecoration: 'none', fontWeight: 600 }}>Get Started</Link>
              </Typography>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
