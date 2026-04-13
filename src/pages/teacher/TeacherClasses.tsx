import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PeopleIcon from '@mui/icons-material/People'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FONT_HEADLINE, FONT_BODY, layout } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import { listenTeacherClasses, createClass } from '../../services/classService'
import type { ClassDoc } from '../../types/firestore'

const MotionBox = motion.create(Box)

export default function TeacherClasses() {
  const c = useHubColors()
  const { user, firstName } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = listenTeacherClasses(user.uid, (data) => {
      setClasses(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const handleCreate = useCallback(async () => {
    if (!user || !newName.trim()) return
    setCreating(true)
    try {
      await createClass(newName.trim(), user.uid, firstName || user.displayName || 'Teacher')
      setCreateOpen(false)
      setNewName('')
    } finally {
      setCreating(false)
    }
  }, [user, newName, firstName])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <Box>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
          Classes
        </Typography>
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>
          Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}
        >
          Create Class
        </Button>
      </Box>

      {/* Class cards grid */}
      {classes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.25rem', color: c.textPrimary, mb: 1 }}>
            No classes yet
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, mb: 3 }}>
            Create your first class to get started with managing students and assignments.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>
            Create Your First Class
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {classes.map((cls) => (
            <MotionBox
              key={cls.classCode}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => navigate(`/teacher/classes/${cls.classCode}`)}
              sx={{
                width: layout.cardWidth,
                aspectRatio: layout.cardAspectRatio,
                backgroundColor: c.surface,
                border: `1px solid ${c.topBarBorder}`,
                borderRadius: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                '&:hover': { borderColor: c.primary },
              }}
            >
              {/* Card header with color band */}
              <Box sx={{ height: 6, backgroundColor: c.primary, flexShrink: 0 }} />
              
              {/* Card content */}
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <Typography
                  sx={{
                    fontFamily: FONT_HEADLINE,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: c.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    mb: 0.5,
                  }}
                >
                  {cls.className}
                </Typography>

                {/* Class code with copy */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Chip
                    label={cls.classCode}
                    size="small"
                    sx={{
                      fontFamily: FONT_BODY,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      height: 22,
                      backgroundColor: c.surfaceContainer,
                      color: c.textSecondary,
                    }}
                  />
                  <Tooltip title={copiedCode === cls.classCode ? 'Copied!' : 'Copy class code'}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); copyCode(cls.classCode) }}
                      sx={{ p: 0.25, color: c.textMuted }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Stats */}
                <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: c.textMuted }} />
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary }}>
                      {cls.studentCount || cls.studentIds.length} student{(cls.studentCount || cls.studentIds.length) !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </MotionBox>
          ))}
        </Box>
      )}

      {/* Create Class Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700 }}>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Class Name"
            placeholder="e.g., Algebra 1 — Period 3"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
