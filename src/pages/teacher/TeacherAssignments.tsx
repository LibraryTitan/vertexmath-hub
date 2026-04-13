import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FONT_HEADLINE, FONT_BODY, layout } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import { listenTeacherClasses } from '../../services/classService'
import { listenClassAssignments, createAssignment, type CreateAssignmentInput } from '../../services/assignmentService'
import type { ClassDoc, AssignmentDoc } from '../../types/firestore'

const MotionBox = motion.create(Box)

interface ClassAssignments {
  classCode: string
  className: string
  assignments: (AssignmentDoc & { id: string })[]
}

const STEPS = ['Select Class', 'Assignment Details']

export default function TeacherAssignments() {
  const c = useHubColors()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [classAssignments, setClassAssignments] = useState<ClassAssignments[]>([])
  const [classes, setClasses] = useState<ClassDoc[]>([])
  const [loading, setLoading] = useState(true)

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [selectedClass, setSelectedClass] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'question-bank' | 'lesson'>('lesson')
  const [lessonName, setLessonName] = useState('')
  const [creating, setCreating] = useState(false)

  // Load classes
  useEffect(() => {
    if (!user) return
    const unsub = listenTeacherClasses(user.uid, (data) => {
      setClasses(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  // Load assignments for each class
  useEffect(() => {
    if (classes.length === 0) return
    const unsubscribers: (() => void)[] = []
    const dataMap = new Map<string, (AssignmentDoc & { id: string })[]>()

    for (const cls of classes) {
      const unsub = listenClassAssignments(cls.classCode, (assignments) => {
        dataMap.set(cls.classCode, assignments)
        // Rebuild array
        const result: ClassAssignments[] = classes
          .map((c) => ({
            classCode: c.classCode,
            className: c.className,
            assignments: dataMap.get(c.classCode) || [],
          }))
          .filter((ca) => ca.assignments.length > 0)
        setClassAssignments(result)
      })
      unsubscribers.push(unsub)
    }

    return () => unsubscribers.forEach((u) => u())
  }, [classes])

  const handleCreate = useCallback(async () => {
    if (!user || !selectedClass || !title.trim()) return
    setCreating(true)
    try {
      const input: CreateAssignmentInput = {
        classCode: selectedClass,
        type,
        title: title.trim(),
        teacherUid: user.uid,
      }
      if (type === 'lesson' && lessonName.trim()) {
        input.lessonName = lessonName.trim()
      }
      await createAssignment(input)
      setCreateOpen(false)
      setStep(0)
      setSelectedClass('')
      setTitle('')
      setLessonName('')
    } finally {
      setCreating(false)
    }
  }, [user, selectedClass, title, type, lessonName])

  const resetDialog = () => {
    setCreateOpen(false)
    setStep(0)
    setSelectedClass('')
    setTitle('')
    setLessonName('')
  }

  const totalAssignments = classAssignments.reduce((sum, ca) => sum + ca.assignments.length, 0)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>
            Assignments
          </Typography>
          {!loading && (
            <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.875rem', color: c.textMuted, mt: 0.5 }}>
              {totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''} across {classes.length} class{classes.length !== 1 ? 'es' : ''}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          disabled={classes.length === 0}
          sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}
        >
          Create Assignment
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading assignments...</Typography>
      ) : classes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.1rem', color: c.textPrimary, mb: 1 }}>
            No classes yet
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
            Create a class first, then you can assign work to students.
          </Typography>
        </Box>
      ) : totalAssignments === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.1rem', color: c.textPrimary, mb: 1 }}>
            No assignments yet
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, mb: 3 }}>
            Create your first assignment to get started.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>
            Create Your First Assignment
          </Button>
        </Box>
      ) : (
        classAssignments.map((ca) => (
          <Box key={ca.classCode} sx={{ mb: 4 }}>
            <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1rem', color: c.textPrimary, mb: 2 }}>
              {ca.className}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {ca.assignments.map((a) => (
                <MotionBox
                  key={a.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={() => navigate(`/teacher/assignments/${ca.classCode}/${a.id}`)}
                  sx={{
                    width: layout.cardWidth,
                    backgroundColor: c.surface,
                    border: `1px solid ${c.topBarBorder}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    '&:hover': { borderColor: c.primary },
                  }}
                >
                  <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '0.875rem', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={a.type === 'question-bank' ? 'QB' : 'Lesson'} size="small" sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', height: 20 }} />
                    <Chip label={a.status} size="small" color={a.status === 'active' ? 'success' : 'default'} sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', height: 20 }} />
                  </Box>
                  {a.questionCount != null && (
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textMuted }}>
                      {a.questionCount} question{a.questionCount !== 1 ? 's' : ''}
                    </Typography>
                  )}
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', color: c.textMuted }}>
                    {a.assignedAt?.toDate ? a.assignedAt.toDate().toLocaleDateString() : ''}
                  </Typography>
                </MotionBox>
              ))}
            </Box>
          </Box>
        ))
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onClose={resetDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700 }}>Create Assignment</DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} sx={{ mb: 3, mt: 1 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontFamily: FONT_BODY } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 && (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Class">
                {classes.map((cls) => (
                  <MenuItem key={cls.classCode} value={cls.classCode}>
                    {cls.className} ({cls.classCode})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Assignment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                placeholder="e.g., Chapter 5 Practice"
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} label="Type">
                  <MenuItem value="lesson">Lesson</MenuItem>
                  <MenuItem value="question-bank">Question Bank</MenuItem>
                </Select>
              </FormControl>
              {type === 'lesson' && (
                <TextField
                  label="Lesson Name (optional)"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  fullWidth
                  placeholder="e.g., 5.1 Solving Systems"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={resetDialog} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>Cancel</Button>
          {step > 0 && (
            <Button onClick={() => setStep(step - 1)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>Back</Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="contained" onClick={() => setStep(step + 1)} disabled={step === 0 && !selectedClass} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>
              Next
            </Button>
          ) : (
            <Button variant="contained" onClick={handleCreate} disabled={!title.trim() || creating} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
