import { useState, useEffect } from 'react'
import { Box, Container, Typography, Paper, Stack, TextField, Button, Alert, CircularProgress, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../AuthProvider'
import { db } from '../firebase'

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, userRole } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setEmail(user.email || '')
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const d = snap.data()
          setFirstName(d.firstName || '')
          setLastName(d.lastName || '')
          setUsername(d.username || '')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="sm">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/apps')} sx={{ mb: 3, textTransform: 'none' }}>
          Back to Apps
        </Button>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Account Settings</Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Profile updated!</Alert>}

            <form onSubmit={handleSave}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth />
                  <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth />
                </Stack>
                <TextField label="Username" value={username} disabled fullWidth helperText="Username cannot be changed." />
                <TextField label="Email" value={email} disabled fullWidth helperText="Email cannot be changed here." />

                <Divider />

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography color="text.secondary">Role:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{userRole || '—'}</Typography>
                </Stack>

                <Button type="submit" variant="contained" size="large" disabled={saving} fullWidth>
                  {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
