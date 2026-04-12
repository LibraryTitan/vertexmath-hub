import { useState } from 'react'
import { Box, TextField, Button, Typography, Container, Stack, Divider, Alert, CircularProgress, IconButton } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider'
import { motion } from 'framer-motion'
import { darkColors } from '../theme/designTokens'

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#1a1a1a',
    borderRadius: '12px',
    '& fieldset': { borderColor: 'rgba(72, 72, 71, 0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(72, 72, 71, 0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#74b9ff' },
  },
}

export default function SignUpPage() {
  const { role } = useParams<{ role: 'student' | 'teacher' }>()
  const navigate = useNavigate()
  const { signUpStudent, signUpTeacher, signInWithGoogle, user } = useAuth()
  const c = darkColors

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting && !error) {
    navigate('/apps', { replace: true })
    return null
  }

  const isTeacher = role === 'teacher'
  const signUpFn = isTeacher ? signUpTeacher : signUpStudent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!firstName.trim()) { setError('First name is required'); return }
    if (!lastName.trim()) { setError('Last name is required'); return }
    if (!username.trim()) { setError('Username is required'); return }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return }
    if (username.length > 20) { setError('Username must be 20 characters or less'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers, and underscores'); return }

    setSubmitting(true)
    try {
      await signUpFn(email, password, { firstName: firstName.trim(), lastName: lastName.trim(), username })
      navigate('/apps')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await signInWithGoogle(role as 'student' | 'teacher')
      navigate('/apps')
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.')
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
                <Typography variant="h4" sx={{ flex: 1, textAlign: 'center', mr: 5, color: c.textPrimary }}>
                  {isTeacher ? 'Teacher Sign Up' : 'Student Sign Up'}
                </Typography>
              </Box>
              <Typography sx={{ textAlign: 'center', color: c.textSecondary }}>
                {isTeacher
                  ? 'Create worksheets, manage classes, and access Paper Builder'
                  : 'Start learning with interactive math lessons'}
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} disabled={submitting} fullWidth
                sx={{
                  borderRadius: '12px',
                  borderColor: 'rgba(72, 72, 71, 0.3)',
                  color: c.textPrimary,
                  bgcolor: c.surfaceContainer,
                  '&:hover': { borderColor: 'rgba(72, 72, 71, 0.5)', bgcolor: c.surfaceBright },
                }}>
                Sign up with Google
              </Button>

              <Divider sx={{ '&::before, &::after': { borderColor: c.divider } }}>
                <Typography sx={{ color: c.textMuted, fontSize: '0.85rem' }}>or</Typography>
              </Divider>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth autoFocus sx={inputSx} />
                    <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth sx={inputSx} />
                  </Stack>
                  <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required fullWidth
                    helperText="3-20 characters, letters, numbers, underscores" sx={inputSx} />
                  <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth sx={inputSx} />
                  <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth
                    helperText="At least 6 characters" sx={inputSx} />
                  <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth
                    sx={{
                      background: isTeacher ? 'linear-gradient(135deg, #f48fb1, #e06090)' : c.primaryGradient,
                      borderRadius: '12px',
                      fontWeight: 600,
                      '&:hover': {
                        background: isTeacher ? 'linear-gradient(135deg, #e06090, #d04080)' : 'linear-gradient(135deg, #5fa5ea, #4a90d9)',
                      },
                    }}>
                    {submitting ? <CircularProgress size={24} /> : 'Create Account'}
                  </Button>
                </Stack>
              </form>

              <Typography sx={{ textAlign: 'center', color: c.textSecondary }}>
                Already have an account?{' '}
                <Link to="/signin" style={{ color: c.primary, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
              </Typography>
              <Typography sx={{ textAlign: 'center', color: c.textSecondary }} variant="body2">
                {isTeacher ? "I'm a student → " : "I'm a teacher → "}
                <Link to={isTeacher ? '/signup/student' : '/signup/teacher'} style={{ color: c.primary, textDecoration: 'none' }}>
                  {isTeacher ? 'Student Sign Up' : 'Teacher Sign Up'}
                </Link>
              </Typography>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
