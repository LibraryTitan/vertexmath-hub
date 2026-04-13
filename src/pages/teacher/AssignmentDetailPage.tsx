import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate, useParams } from 'react-router-dom'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import {
  getAssignment,
  deleteAssignment,
  listenAssignmentProgress,
} from '../../services/assignmentService'
import { getStudentProfile } from '../../services/analyticsService'
import type { AssignmentDoc, StudentProgress, UserDoc } from '../../types/firestore'

interface ProgressRow {
  studentUid: string
  profile: UserDoc | null
  progress: StudentProgress
}

export default function AssignmentDetailPage() {
  const { classCode, assignmentId } = useParams<{ classCode: string; assignmentId: string }>()
  const navigate = useNavigate()
  const c = useHubColors()

  const [assignment, setAssignment] = useState<(AssignmentDoc & { id: string }) | null>(null)
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Load assignment
  useEffect(() => {
    if (!classCode || !assignmentId) return
    getAssignment(classCode, assignmentId).then((a) => {
      setAssignment(a)
      setLoading(false)
    })
  }, [classCode, assignmentId])

  // Listen to progress
  useEffect(() => {
    if (!classCode || !assignmentId) return
    return listenAssignmentProgress(classCode, assignmentId, async (progressDocs) => {
      const rows: ProgressRow[] = await Promise.all(
        progressDocs.map(async (p) => ({
          studentUid: p.studentUid,
          profile: await getStudentProfile(p.studentUid),
          progress: p,
        }))
      )
      setProgressRows(rows)
    })
  }, [classCode, assignmentId])

  const handleDelete = useCallback(async () => {
    if (!classCode || !assignmentId) return
    await deleteAssignment(classCode, assignmentId)
    navigate('/teacher/assignments')
  }, [classCode, assignmentId, navigate])

  if (loading) {
    return (
      <Box>
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading assignment...</Typography>
      </Box>
    )
  }

  if (!assignment) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher/assignments')} sx={{ mb: 2, textTransform: 'none', fontFamily: FONT_BODY }}>
          Back to Assignments
        </Button>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, color: c.textPrimary }}>Assignment not found</Typography>
      </Box>
    )
  }

  const avgScore = progressRows.length > 0 ? Math.round(progressRows.reduce((sum, r) => sum + r.progress.progressPercent, 0) / progressRows.length) : 0
  const completedCount = progressRows.filter((r) => r.progress.completedAt).length

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/teacher/assignments')} sx={{ mb: 2, textTransform: 'none', fontFamily: FONT_BODY, color: c.textSecondary }}>
        Back to Assignments
      </Button>

      {/* Assignment header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>
          {assignment.title}
        </Typography>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>
          Delete
        </Button>
      </Box>

      {/* Meta info */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Chip label={assignment.type === 'question-bank' ? 'Question Bank' : 'Lesson'} size="small" sx={{ fontFamily: FONT_BODY }} />
        <Chip label={assignment.status} size="small" color={assignment.status === 'active' ? 'success' : 'default'} sx={{ fontFamily: FONT_BODY }} />
        {assignment.questionCount != null && <Chip label={`${assignment.questionCount} questions`} size="small" variant="outlined" sx={{ fontFamily: FONT_BODY }} />}
        {assignment.dueDate?.toDate && <Chip label={`Due: ${assignment.dueDate.toDate().toLocaleDateString()}`} size="small" variant="outlined" sx={{ fontFamily: FONT_BODY }} />}
      </Box>

      {/* Summary stats */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textMuted, textTransform: 'uppercase' }}>Submissions</Typography>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>{progressRows.length}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textMuted, textTransform: 'uppercase' }}>Completed</Typography>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>{completedCount}</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textMuted, textTransform: 'uppercase' }}>Average Score</Typography>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>{avgScore}%</Typography>
        </Box>
      </Box>

      {/* Progress table */}
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1rem', color: c.textPrimary, mb: 2 }}>
        Student Progress
      </Typography>

      {progressRows.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, backgroundColor: c.surface, border: `1px solid ${c.topBarBorder}`, borderRadius: 2 }}>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>No student submissions yet.</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ backgroundColor: c.surface, borderRadius: 2, border: `1px solid ${c.topBarBorder}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Student</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Status</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Correct</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Attempted</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary, width: 160 }}>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {progressRows.map((row) => (
                <TableRow key={row.studentUid} hover>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>
                    {row.profile ? `${row.profile.firstName} ${row.profile.lastName}` : row.studentUid}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.progress.completedAt ? 'Completed' : 'In Progress'}
                      size="small"
                      color={row.progress.completedAt ? 'success' : 'warning'}
                      sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>{row.progress.totalCorrect}</TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>{row.progress.totalAttempted}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={row.progress.progressPercent}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                      <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textPrimary, fontWeight: 600, minWidth: 36 }}>
                        {row.progress.progressPercent}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700 }}>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
            Are you sure you want to delete <strong>{assignment.title}</strong>? All student progress for this assignment will also be deleted. This action cannot be undone.
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
