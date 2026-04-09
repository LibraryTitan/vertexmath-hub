import { useState } from 'react'
import { Box, TextField, Button, Typography, Container, Paper, Stack, Divider, Alert, CircularProgress } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

export default function SignInPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, user } = useAuth()

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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>Sign In</Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Welcome back to VertexMath
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {needsRole ? (
              <>
                <Typography sx={{ textAlign: 'center', fontWeight: 600 }}>
                  No account found. Select your role to create one:
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" size="large" onClick={() => handleRoleSelect('student')} disabled={submitting} fullWidth
                    sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}>
                    {submitting ? <CircularProgress size={24} /> : "I'm a Student"}
                  </Button>
                  <Button variant="contained" size="large" onClick={() => handleRoleSelect('teacher')} disabled={submitting} fullWidth
                    sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}>
                    {submitting ? <CircularProgress size={24} /> : "I'm a Teacher"}
                  </Button>
                </Stack>
                <Button variant="text" size="small" onClick={() => setNeedsRole(false)} sx={{ textTransform: 'none' }}>
                  ← Back to Sign In
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} disabled={submitting} fullWidth>
                  Sign in with Google
                </Button>

                <Divider>or</Divider>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth autoFocus />
                    <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
                    <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
                      {submitting ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                  </Stack>
                </form>
              </>
            )}

            <Typography sx={{ textAlign: 'center' }} color="text.secondary">
              Don't have an account?{' '}
              <Link to="/" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Get Started</Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
