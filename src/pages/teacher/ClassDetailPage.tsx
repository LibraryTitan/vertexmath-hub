import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import { useNavigate, useParams } from 'react-router-dom'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import {
  getClassInfo,
  updateClass,
  deleteClass,
  removeStudentFromClass,
} from '../../services/classService'
import { listenClassAssignments } from '../../services/assignmentService'
import { getStudentProfile } from '../../services/analyticsService'
import type { ClassDoc, AssignmentDoc, UserDoc } from '../../types/firestore'

interface StudentInfo {
  uid: string
  profile: UserDoc | null
}

export default function ClassDetailPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const c = useHubColors()
  const { user } = useAuth()
  const [classData, setClassData] = useState<ClassDoc | null>(null)
  const [students, setStudents] = useState<StudentInfo[]>([])
  const [assignments, setAssignments] = useState<(AssignmentDoc & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [editName, setEditName] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load class info
  useEffect(() => {
    if (!code) return
    getClassInfo(code).then((data) => {
      setClassData(data)
      setLoading(false)
      if (data) setEditName(data.className)
    })
  }, [code])

  // Load student profiles
  useEffect(() => {
    if (!classData) return
    Promise.all(
      classData.studentIds.map(async (uid) => ({
        uid,
        profile: await getStudentProfile(uid),
      }))
    ).then(setStudents)
  }, [classData])

  // Listen to assignments
  useEffect(() => {
    if (!code) return
    return listenClassAssignments(code, setAssignments)
  }, [code])

  const handleSaveName = useCallback(async () => {
    if (!code || !editName.trim()) return
    await updateClass(code, { className: editName.trim() })
    setClassData((prev) => prev ? { ...prev, className: editName.trim() } : prev)
    setEditOpen(false)
  }, [code, editName])

  const handleDelete = useCallback(async () => {
    if (!code || !user) return
    await deleteClass(code, user.uid)
    navigate('/teacher/classes')
  }, [code, user, navigate])

  const handleRemoveStudent = useCallback(async (studentUid: string) => {
    if (!code) return
    await removeStudentFromClass(code, studentUid)
    setStudents((prev) => prev.filter((s) => s.uid !== studentUid))
    setClassData((prev) => prev ? { ...prev, studentIds: prev.studentIds.filter((id) => id !== studentUid), studentCount: prev.studentCount - 1 } : prev)
  }, [code])

  const copyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <Box>
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading class...</Typography>
      </Box>
    )
  }

  if (!classData) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher/classes')} sx={{ mb: 2, textTransform: 'none', fontFamily: FONT_BODY }}>
          Back to Classes
        </Button>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, color: c.textPrimary }}>Class not found</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher/classes')} sx={{ mb: 2, textTransform: 'none', fontFamily: FONT_BODY, color: c.textSecondary }}>
        Back to Classes
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>
          {classData.className}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={() => setEditOpen(true)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>
            Edit Name
          </Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* Class code */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.875rem' }}>Join Code:</Typography>
        <Chip label={classData.classCode} size="small" sx={{ fontFamily: FONT_BODY, fontWeight: 600, letterSpacing: '0.05em' }} />
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton size="small" onClick={copyCode} sx={{ color: c.textMuted }}>
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${c.topBarBorder}` }}>
        <Tab label={`Roster (${students.length})`} sx={{ textTransform: 'none', fontFamily: FONT_BODY }} />
        <Tab label={`Assignments (${assignments.length})`} sx={{ textTransform: 'none', fontFamily: FONT_BODY }} />
      </Tabs>

      {/* Roster tab */}
      {tab === 0 && (
        students.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, mb: 1 }}>No students have joined this class yet.</Typography>
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textMuted, fontSize: '0.875rem' }}>
              Share the join code <strong>{classData.classCode}</strong> with your students.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Name</TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Email</TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Role</TableCell>
                  <TableCell align="right" sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.uid} hover>
                    <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>
                      {s.profile ? `${s.profile.firstName} ${s.profile.lastName}` : s.uid}
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
                      {s.profile?.email || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip label={s.profile?.role || 'student'} size="small" sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Remove from class">
                        <IconButton size="small" onClick={() => handleRemoveStudent(s.uid)} sx={{ color: c.textMuted }}>
                          <PersonRemoveIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {/* Assignments tab */}
      {tab === 1 && (
        assignments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>No assignments yet for this class.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Title</TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Type</TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Questions</TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Due Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow
                    key={a.id}
                    hover
                    onClick={() => navigate(`/teacher/assignments/${code}/${a.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>{a.title}</TableCell>
                    <TableCell>
                      <Chip label={a.type === 'question-bank' ? 'QB' : 'Lesson'} size="small" sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>{a.questionCount}</TableCell>
                    <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
                      {a.dueDate?.toDate ? a.dueDate.toDate().toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {/* Edit Name Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700 }}>Edit Class Name</DialogTitle>
        <DialogContent>
          <TextField fullWidth value={editName} onChange={(e) => setEditName(e.target.value)} sx={{ mt: 1 }} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveName} disabled={!editName.trim()} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700 }}>Delete Class</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
            Are you sure you want to delete <strong>{classData.className}</strong>? This will also delete all assignments and student progress for this class. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
