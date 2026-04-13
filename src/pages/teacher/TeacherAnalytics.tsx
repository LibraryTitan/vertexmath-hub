import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { motion } from 'framer-motion'
import { FONT_HEADLINE, FONT_BODY, layout } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import { listenTeacherClasses } from '../../services/classService'
import { getClassAnalytics } from '../../services/analyticsService'
import type { ClassDoc, ClassAnalytics } from '../../types/firestore'

const MotionBox = motion.create(Box)

export default function TeacherAnalytics() {
  const c = useHubColors()
  const { user } = useAuth()
  const [classes, setClasses] = useState<ClassDoc[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null)
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Load teacher classes
  useEffect(() => {
    if (!user) return
    const unsub = listenTeacherClasses(user.uid, (data) => {
      setClasses(data)
      setLoadingClasses(false)
      // Auto-select first class
      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0].classCode)
      }
    })
    return () => unsub()
  }, [user])

  // Load analytics when class changes
  useEffect(() => {
    if (!selectedClass) return
    setLoadingAnalytics(true)
    getClassAnalytics(selectedClass).then((a) => {
      setAnalytics(a)
      setLoadingAnalytics(false)
    })
  }, [selectedClass])

  const selectedClassName = classes.find((cl) => cl.classCode === selectedClass)?.className || selectedClass

  const statCards = analytics
    ? [
        { label: 'Students', value: analytics.totalStudents, color: '#4CAF50' },
        { label: 'Assignments', value: analytics.totalAssignments, color: '#2196F3' },
        { label: 'Avg Score', value: `${analytics.averageScore}%`, color: '#FF9800' },
        { label: 'Completion', value: `${analytics.completionRate}%`, color: '#9C27B0' },
      ]
    : []

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 3 }}>
        Analytics
      </Typography>

      {loadingClasses ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading classes...</Typography>
      ) : classes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.1rem', color: c.textPrimary, mb: 1 }}>
            No classes yet
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
            Create a class and assign work to see analytics.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Class selector */}
          <FormControl size="small" sx={{ mb: 3, minWidth: 250 }}>
            <InputLabel>Class</InputLabel>
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Class">
              {classes.map((cls) => (
                <MenuItem key={cls.classCode} value={cls.classCode}>
                  {cls.className} ({cls.classCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingAnalytics ? (
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading analytics for {selectedClassName}...</Typography>
          ) : analytics ? (
            <>
              {/* Stat cards */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                {statCards.map((card) => (
                  <MotionBox
                    key={card.label}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    sx={{
                      width: layout.cardWidth,
                      backgroundColor: c.surface,
                      border: `1px solid ${c.topBarBorder}`,
                      borderRadius: 2,
                      p: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {card.label}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.75rem', color: c.textPrimary }}>
                      {card.value}
                    </Typography>
                    <LinearProgress variant="determinate" value={typeof card.value === 'string' ? parseInt(card.value) || 0 : Math.min(card.value * 10, 100)} sx={{ height: 4, borderRadius: 2, mt: 0.5, backgroundColor: `${card.color}22`, '& .MuiLinearProgress-bar': { backgroundColor: card.color } }} />
                  </MotionBox>
                ))}
              </Box>

              {/* Per-question table */}
              {analytics.perQuestion.length > 0 && (
                <>
                  <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1rem', color: c.textPrimary, mb: 2 }}>
                    Per-Question Performance
                  </Typography>
                  <TableContainer sx={{ backgroundColor: c.surface, borderRadius: 2, border: `1px solid ${c.topBarBorder}` }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Question ID</TableCell>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Correct</TableCell>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Total Attempts</TableCell>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Success Rate</TableCell>
                          <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Avg Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.perQuestion.map((q) => {
                          const rate = q.totalAttempts > 0 ? Math.round((q.correctCount / q.totalAttempts) * 100) : 0
                          const avgTimeSec = q.avgTimeMs > 0 ? Math.round(q.avgTimeMs / 1000) : 0
                          return (
                            <TableRow key={q.questionId} hover>
                              <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary, fontSize: '0.8125rem' }}>{q.questionId}</TableCell>
                              <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>{q.correctCount}</TableCell>
                              <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>{q.totalAttempts}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <LinearProgress variant="determinate" value={rate} sx={{ flex: 1, height: 6, borderRadius: 3, maxWidth: 80 }} />
                                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textPrimary, fontWeight: 600, minWidth: 36 }}>
                                    {rate}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                                {avgTimeSec > 0 ? `${avgTimeSec}s` : '—'}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}

              {analytics.perQuestion.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, backgroundColor: c.surface, border: `1px solid ${c.topBarBorder}`, borderRadius: 2 }}>
                  <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
                    No assignment data yet for this class. Assign work to see per-question analytics.
                  </Typography>
                </Box>
              )}
            </>
          ) : null}
        </>
      )}
    </Box>
  )
}
