import { useState } from 'react'
import { Box, TextField, Button, Typography, Container, Paper, Stack, Divider, Alert, CircularProgress } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../AuthProvider'

export default function SignUpPage() {
  const { role } = useParams<{ role: 'student' | 'teacher' }>()
  const navigate = useNavigate()
  const { signUpStudent, signUpTeacher, signInWithGoogle, user } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>
              {isTeacher ? 'Teacher Sign Up' : 'Student Sign Up'}
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              {isTeacher
                ? 'Create worksheets, manage classes, and access Paper Builder'
                : 'Start learning with interactive math lessons'}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <Button variant="outlined" size="large" startIcon={<GoogleIcon />} onClick={handleGoogle} disabled={submitting} fullWidth>
              Sign up with Google
            </Button>

            <Divider>or</Divider>

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth autoFocus />
                  <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth />
                </Stack>
                <TextField label="Username" value={username} onChange={e => setUsername(e.target.value)} required fullWidth
                  helperText="3-20 characters, letters, numbers, underscores" />
                <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
                <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth
                  helperText="At least 6 characters" />
                <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth
                  color={isTeacher ? 'secondary' : 'primary'}>
                  {submitting ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
              </Stack>
            </form>

            <Typography sx={{ textAlign: 'center' }} color="text.secondary">
              Already have an account?{' '}
              <Link to="/signin" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </Typography>
            <Typography sx={{ textAlign: 'center' }} color="text.secondary" variant="body2">
              {isTeacher ? "I'm a student → " : "I'm a teacher → "}
              <Link to={isTeacher ? '/signup/student' : '/signup/teacher'} style={{ color: '#1976d2', textDecoration: 'none' }}>
                {isTeacher ? 'Student Sign Up' : 'Teacher Sign Up'}
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
