import { useState, useEffect } from 'react'
import { Box, Container, Typography, Stack, TextField, Button, Alert, CircularProgress, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../AuthProvider'
import { db } from '../firebase'
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

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, userRole } = useAuth()
  const c = darkColors

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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: c.contentBg }}>
        <CircularProgress sx={{ color: c.primary }} />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: c.contentBg, p: 3 }}>
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 18 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/apps')} sx={{ mb: 3, textTransform: 'none', color: c.textSecondary }}>
            Back to Apps
          </Button>

          <Box sx={{ bgcolor: c.surface, borderRadius: '16px', p: 4, border: '1px solid', borderColor: c.divider }}>
            <Stack spacing={3}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: c.textPrimary }}>Account Settings</Typography>

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">Profile updated!</Alert>}

              <form onSubmit={handleSave}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2}>
                    <TextField label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required fullWidth sx={inputSx} />
                    <TextField label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required fullWidth sx={inputSx} />
                  </Stack>
                  <TextField label="Username" value={username} disabled fullWidth helperText="Username cannot be changed." sx={inputSx} />
                  <TextField label="Email" value={email} disabled fullWidth helperText="Email cannot be changed here." sx={inputSx} />

                  <Divider sx={{ borderColor: c.divider }} />

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ color: c.textSecondary }}>Role:</Typography>
                    <Typography sx={{ fontWeight: 600, color: c.textPrimary }}>{userRole || '—'}</Typography>
                  </Stack>

                  <Button type="submit" variant="contained" size="large" disabled={saving} fullWidth
                    sx={{ background: c.primaryGradient, borderRadius: '12px', fontWeight: 600, '&:hover': { background: 'linear-gradient(135deg, #5fa5ea, #4a90d9)' } }}>
                    {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}
