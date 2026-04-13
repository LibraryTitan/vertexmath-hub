import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Chip,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import ClassIcon from '@mui/icons-material/Class'
import AssignmentIcon from '@mui/icons-material/Assignment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FONT_HEADLINE, FONT_BODY, layout } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import { listenTeacherClasses } from '../../services/classService'
import { listenClassAssignments } from '../../services/assignmentService'
import type { ClassDoc, AssignmentDoc } from '../../types/firestore'

const MotionBox = motion.create(Box)

interface Stats {
  classCount: number
  studentCount: number
  assignmentCount: number
  activeAssignments: number
}

interface RecentAssignment extends AssignmentDoc {
  id: string
  className: string
}

export default function TeacherOverview() {
  const c = useHubColors()
  const { user, firstName } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ classCount: 0, studentCount: 0, assignmentCount: 0, activeAssignments: 0 })
  const [recentAssignments, setRecentAssignments] = useState<RecentAssignment[]>([])
  const [classes, setClasses] = useState<ClassDoc[]>([])
  const [loading, setLoading] = useState(true)

  // Load classes
  useEffect(() => {
    if (!user) return
    const unsub = listenTeacherClasses(user.uid, (data) => {
      setClasses(data)
      const totalStudents = data.reduce((sum, cls) => sum + (cls.studentCount || cls.studentIds.length), 0)
      setStats((prev) => ({ ...prev, classCount: data.length, studentCount: totalStudents }))
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  // Load recent assignments across all classes
  useEffect(() => {
    if (classes.length === 0) return
    const unsubs: (() => void)[] = []
    const classAssignments = new Map<string, (AssignmentDoc & { id: string })[]>()

    for (const cls of classes) {
      const unsub = listenClassAssignments(cls.classCode, (assignments) => {
        classAssignments.set(cls.classCode, assignments)
        // Aggregate
        let total = 0
        let active = 0
        const recent: RecentAssignment[] = []
        for (const [code, aList] of classAssignments.entries()) {
          total += aList.length
          active += aList.filter((a) => a.status === 'active').length
          const className = classes.find((cl) => cl.classCode === code)?.className || code
          for (const a of aList) {
            recent.push({ ...a, className })
          }
        }
        setStats((prev) => ({ ...prev, assignmentCount: total, activeAssignments: active }))
        // Sort by date, take 5 most recent
        recent.sort((a, b) => {
          const aTime = a.assignedAt?.toDate?.().getTime() || 0
          const bTime = b.assignedAt?.toDate?.().getTime() || 0
          return bTime - aTime
        })
        setRecentAssignments(recent.slice(0, 5))
      })
      unsubs.push(unsub)
    }

    return () => unsubs.forEach((u) => u())
  }, [classes])

  const statCards = [
    { label: 'Classes', value: stats.classCount, icon: <ClassIcon />, color: '#4CAF50', path: '/teacher/classes' },
    { label: 'Students', value: stats.studentCount, icon: <PeopleIcon />, color: '#2196F3', path: '/teacher/classes' },
    { label: 'Assignments', value: stats.assignmentCount, icon: <AssignmentIcon />, color: '#FF9800', path: '/teacher/assignments' },
    { label: 'Active', value: stats.activeAssignments, icon: <TrendingUpIcon />, color: '#9C27B0', path: '/teacher/assignments' },
  ]

  return (
    <Box>
      {/* Greeting */}
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 0.5 }}>
        Welcome back{firstName ? `, ${firstName}` : ''}
      </Typography>
      <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, mb: 3 }}>
        Here's an overview of your teaching dashboard.
      </Typography>

      {/* Stat cards */}
      {loading ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading...</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            {statCards.map((card) => (
              <MotionBox
                key={card.label}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => navigate(card.path)}
                sx={{
                  width: layout.cardWidth,
                  backgroundColor: c.surface,
                  border: `1px solid ${c.topBarBorder}`,
                  borderRadius: 2,
                  p: 2.5,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  '&:hover': { borderColor: card.color },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {card.label}
                  </Typography>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.75rem', color: c.textPrimary }}>
                  {card.value}
                </Typography>
              </MotionBox>
            ))}
          </Box>

          {/* Recent Assignments */}
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.1rem', color: c.textPrimary, mb: 2 }}>
            Recent Assignments
          </Typography>

          {recentAssignments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: c.surface, border: `1px solid ${c.topBarBorder}`, borderRadius: 2 }}>
              <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
                No assignments yet. Create one from the Assignments page.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recentAssignments.map((a) => (
                <Box
                  key={a.id}
                  onClick={() => navigate(`/teacher/assignments/${a.classCode}/${a.id}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    backgroundColor: c.surface,
                    border: `1px solid ${c.topBarBorder}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { borderColor: c.primary },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.875rem', color: c.textPrimary, fontWeight: 500 }}>
                      {a.title}
                    </Typography>
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textMuted }}>
                      {a.className} · {a.assignedAt?.toDate ? a.assignedAt.toDate().toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                  <Chip label={a.status} size="small" color={a.status === 'active' ? 'success' : 'default'} sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', height: 20 }} />
                </Box>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
