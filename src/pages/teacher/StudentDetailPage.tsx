import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate, useParams } from 'react-router-dom'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { getStudentProfile, getStudentClassAnalytics } from '../../services/analyticsService'
import { listenTeacherClasses } from '../../services/classService'
import { useAuth } from '../../AuthProvider'
import type { UserDoc, ClassDoc } from '../../types/firestore'

interface ClassPerf {
  classCode: string
  className: string
  assignments: { assignmentId: string; title: string; score: number; completed: boolean }[]
}

export default function StudentDetailPage() {
  const { uid } = useParams<{ uid: string }>()
  const navigate = useNavigate()
  const c = useHubColors()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserDoc | null>(null)
  const [classPerfs, setClassPerfs] = useState<ClassPerf[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    getStudentProfile(uid).then((p) => {
      setProfile(p)
      setLoading(false)
    })
  }, [uid])

  // Get teacher's classes and find which ones contain this student
  useEffect(() => {
    if (!user || !uid) return
    const unsub = listenTeacherClasses(user.uid, async (classes: ClassDoc[]) => {
      const perfs: ClassPerf[] = []
      for (const cls of classes) {
        if (cls.studentIds.includes(uid)) {
          const analytics = await getStudentClassAnalytics(cls.classCode, uid)
          perfs.push({
            classCode: cls.classCode,
            className: cls.className,
            assignments: analytics,
          })
        }
      }
      setClassPerfs(perfs)
    })
    return () => unsub()
  }, [user, uid])

  if (loading) {
    return (
      <Box>
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading student...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none', fontFamily: FONT_BODY, color: c.textSecondary }}>
        Back
      </Button>

      {/* Student info header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>
          {profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Student'}
        </Typography>
        {profile?.email && (
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.875rem', mt: 0.5 }}>
            {profile.email}
          </Typography>
        )}
        {profile?.role && (
          <Chip label={profile.role} size="small" sx={{ mt: 1, fontFamily: FONT_BODY, fontSize: '0.75rem' }} />
        )}
      </Box>

      {/* Per-class performance */}
      {classPerfs.length === 0 ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
          This student is not in any of your classes.
        </Typography>
      ) : (
        classPerfs.map((cp) => (
          <Box key={cp.classCode} sx={{ mb: 4 }}>
            <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.1rem', color: c.textPrimary, mb: 2 }}>
              {cp.className}
            </Typography>

            {cp.assignments.length === 0 ? (
              <Typography sx={{ fontFamily: FONT_BODY, color: c.textMuted, fontSize: '0.875rem' }}>
                No assignments in this class yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Assignment</TableCell>
                      <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Status</TableCell>
                      <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Score</TableCell>
                      <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary, width: 160 }}>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cp.assignments.map((a) => (
                      <TableRow key={a.assignmentId} hover>
                        <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>{a.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={a.completed ? 'Completed' : 'In Progress'}
                            size="small"
                            color={a.completed ? 'success' : 'warning'}
                            sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary, fontWeight: 600 }}>
                          {a.score}%
                        </TableCell>
                        <TableCell>
                          <LinearProgress
                            variant="determinate"
                            value={a.score}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        ))
      )}
    </Box>
  )
}
