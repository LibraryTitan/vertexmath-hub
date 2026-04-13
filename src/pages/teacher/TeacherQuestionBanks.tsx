import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Chip,
  Collapse,
  IconButton,
  CircularProgress,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LockIcon from '@mui/icons-material/Lock'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { motion } from 'framer-motion'
import { FONT_HEADLINE, FONT_BODY, layout } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import {
  fetchMasterIndex,
  fetchQuestionBank,
  checkBankEntitlement,
} from '../../services/questionBankService'
import type { BankEntry, BankQuestion } from '../../types/firestore'

const MotionBox = motion.create(Box)

// Subject display config — keys match <Subject> values in master.xml
const SUBJECT_COLORS: Record<string, string> = {
  'Algebra 1': '#4CAF50',
  'Algebra 2': '#2196F3',
  Geometry: '#FF9800',
  Precalculus: '#9C27B0',
  CC1: '#F44336',
  CC2: '#E91E63',
  CC3: '#00BCD4',
}

type BrowseLevel = 'subjects' | 'chapters' | 'banks' | 'questions'

export default function TeacherQuestionBanks() {
  const c = useHubColors()
  const { user } = useAuth()
  const [allBanks, setAllBanks] = useState<BankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [entitlements, setEntitlements] = useState<Record<string, boolean>>({})

  // Drill-down state
  const [level, setLevel] = useState<BrowseLevel>('subjects')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [selectedBank, setSelectedBank] = useState<BankEntry | null>(null)
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [expandedQ, setExpandedQ] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Load master index
  useEffect(() => {
    fetchMasterIndex()
      .then((banks) => {
        setAllBanks(banks)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load question banks:', err)
        setLoadError(err instanceof Error ? err.message : 'Failed to load question banks')
        setLoading(false)
      })
  }, [])

  // Check entitlements for each subject
  useEffect(() => {
    if (!user || allBanks.length === 0) return
    const subjects = [...new Set(allBanks.map((b) => b.subject))]
    Promise.all(
      subjects.map(async (s) => ({
        subject: s,
        entitled: await checkBankEntitlement(s, user.uid),
      }))
    ).then((results) => {
      const map: Record<string, boolean> = {}
      for (const r of results) map[r.subject] = r.entitled
      setEntitlements(map)
    })
  }, [user, allBanks])

  // Derived data
  const subjects = useMemo(() => {
    const map = new Map<string, { count: number; qCount: number; books: Set<string> }>()
    for (const b of allBanks) {
      const existing = map.get(b.subject) || { count: 0, qCount: 0, books: new Set<string>() }
      existing.count++
      existing.qCount += b.questionCount
      if (b.book) existing.books.add(b.book)
      map.set(b.subject, existing)
    }
    return Array.from(map.entries()).map(([subject, info]) => ({
      subject,
      bankCount: info.count,
      questionCount: info.qCount,
      books: [...info.books],
    }))
  }, [allBanks])

  const chapters = useMemo(() => {
    if (!selectedSubject) return []
    const filtered = allBanks.filter((b) => b.subject === selectedSubject)
    const map = new Map<string, { count: number; qCount: number }>()
    for (const b of filtered) {
      const ch = b.chapter || 'Uncategorized'
      const existing = map.get(ch) || { count: 0, qCount: 0 }
      existing.count++
      existing.qCount += b.questionCount
      map.set(ch, existing)
    }
    return Array.from(map.entries())
      .map(([chapter, info]) => ({ chapter, bankCount: info.count, questionCount: info.qCount }))
      .sort((a, b) => {
        const numA = parseInt(a.chapter.replace(/\D/g, '')) || 0
        const numB = parseInt(b.chapter.replace(/\D/g, '')) || 0
        return numA - numB
      })
  }, [allBanks, selectedSubject])

  const chapterBanks = useMemo(() => {
    if (!selectedSubject || !selectedChapter) return []
    return allBanks
      .filter((b) => b.subject === selectedSubject && (b.chapter || 'Uncategorized') === selectedChapter)
      .sort((a, b) => a.section.localeCompare(b.section, undefined, { numeric: true }))
  }, [allBanks, selectedSubject, selectedChapter])

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions
    const q = searchQuery.toLowerCase()
    return questions.filter(
      (qn) =>
        qn.questionText.toLowerCase().includes(q) ||
        qn.questionContent.toLowerCase().includes(q) ||
        qn.id.toLowerCase().includes(q) ||
        qn.subtopic.toLowerCase().includes(q)
    )
  }, [questions, searchQuery])

  // Navigation
  const goToSubjects = () => {
    setLevel('subjects')
    setSelectedSubject('')
    setSelectedChapter('')
    setSelectedBank(null)
    setQuestions([])
    setSearchQuery('')
  }

  const goToChapters = (subject: string) => {
    if (!entitlements[subject]) return
    setSelectedSubject(subject)
    setLevel('chapters')
    setSelectedChapter('')
    setSelectedBank(null)
    setQuestions([])
    setSearchQuery('')
  }

  const goToBanks = (chapter: string) => {
    setSelectedChapter(chapter)
    setLevel('banks')
    setSelectedBank(null)
    setQuestions([])
    setSearchQuery('')
  }

  const goToQuestions = useCallback(async (bank: BankEntry) => {
    setSelectedBank(bank)
    setLevel('questions')
    setQuestionsLoading(true)
    setSearchQuery('')
    try {
      const qs = await fetchQuestionBank(bank.path)
      setQuestions(qs)
    } finally {
      setQuestionsLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <Box>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
          Question Banks
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4 }}>
          <CircularProgress size={24} />
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading question banks...</Typography>
        </Box>
      </Box>
    )
  }

  if (loadError) {
    return (
      <Box>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
          Question Banks
        </Typography>
        <Typography sx={{ fontFamily: FONT_BODY, color: '#F44336', mt: 2 }}>
          {loadError}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
        Question Banks
      </Typography>

      {/* Breadcrumbs */}
      {level !== 'subjects' && (
        <Breadcrumbs sx={{ mb: 2, fontFamily: FONT_BODY, fontSize: '0.875rem' }}>
          <Link component="button" underline="hover" onClick={goToSubjects} sx={{ fontFamily: FONT_BODY, color: c.primary }}>
            Subjects
          </Link>
          {selectedSubject && level !== 'chapters' ? (
            <Link component="button" underline="hover" onClick={() => { setLevel('chapters'); setSelectedChapter(''); setSelectedBank(null); setQuestions([]) }} sx={{ fontFamily: FONT_BODY, color: c.primary }}>
              {selectedSubject}
            </Link>
          ) : selectedSubject ? (
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.875rem' }}>{selectedSubject}</Typography>
          ) : null}
          {selectedChapter && level !== 'banks' ? (
            <Link component="button" underline="hover" onClick={() => { setLevel('banks'); setSelectedBank(null); setQuestions([]) }} sx={{ fontFamily: FONT_BODY, color: c.primary }}>
              {selectedChapter}
            </Link>
          ) : selectedChapter ? (
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.875rem' }}>{selectedChapter}</Typography>
          ) : null}
          {selectedBank && (
            <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.875rem' }}>{selectedBank.title}</Typography>
          )}
        </Breadcrumbs>
      )}

      {/* Subject Grid */}
      {level === 'subjects' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {subjects.map((s) => {
            const locked = !entitlements[s.subject]
            const color = SUBJECT_COLORS[s.subject] || c.primary
            return (
              <MotionBox
                key={s.subject}
                whileHover={locked ? {} : { scale: 1.02, y: -2 }}
                whileTap={locked ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => goToChapters(s.subject)}
                sx={{
                  width: layout.cardWidth,
                  aspectRatio: layout.cardAspectRatio,
                  backgroundColor: c.surface,
                  border: `1px solid ${c.topBarBorder}`,
                  borderRadius: 2,
                  cursor: locked ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  opacity: locked ? 0.6 : 1,
                  '&:hover': locked ? {} : { borderColor: color },
                }}
              >
                <Box sx={{ height: 6, backgroundColor: color, flexShrink: 0 }} />
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1rem', color: c.textPrimary }}>
                      {s.subject}
                    </Typography>
                    {locked && <LockIcon sx={{ fontSize: 16, color: c.textMuted }} />}
                  </Box>
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary, mb: 0.5 }}>
                    {s.bankCount} bank{s.bankCount !== 1 ? 's' : ''}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textMuted }}>
                    {s.questionCount.toLocaleString()} questions
                  </Typography>
                  {locked && (
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', color: c.textMuted, mt: 'auto' }}>
                      Requires subscription
                    </Typography>
                  )}
                </Box>
              </MotionBox>
            )
          })}
        </Box>
      )}

      {/* Chapter List */}
      {level === 'chapters' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {chapters.map((ch) => (
            <MotionBox
              key={ch.chapter}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => goToBanks(ch.chapter)}
              sx={{
                width: layout.cardWidth,
                backgroundColor: c.surface,
                border: `1px solid ${c.topBarBorder}`,
                borderRadius: 2,
                cursor: 'pointer',
                p: 2,
                '&:hover': { borderColor: c.primary },
              }}
            >
              <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '0.875rem', color: c.textPrimary, mb: 0.5 }}>
                {ch.chapter}
              </Typography>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary }}>
                {ch.bankCount} bank{ch.bankCount !== 1 ? 's' : ''} · {ch.questionCount} questions
              </Typography>
            </MotionBox>
          ))}
        </Box>
      )}

      {/* Bank List */}
      {level === 'banks' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          {chapterBanks.map((bank) => (
            <MotionBox
              key={bank.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => goToQuestions(bank)}
              sx={{
                width: layout.cardWidth,
                backgroundColor: c.surface,
                border: `1px solid ${c.topBarBorder}`,
                borderRadius: 2,
                cursor: 'pointer',
                p: 2,
                '&:hover': { borderColor: c.primary },
              }}
            >
              <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '0.875rem', color: c.textPrimary, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {bank.title || bank.section}
              </Typography>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary, mb: 0.5 }}>
                {bank.section}
              </Typography>
              <Chip
                label={`${bank.questionCount} Q`}
                size="small"
                sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', height: 20 }}
              />
            </MotionBox>
          ))}
        </Box>
      )}

      {/* Question List */}
      {level === 'questions' && (
        <Box sx={{ mt: 2 }}>
          {/* Search */}
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            size="small"
            fullWidth
            sx={{ mb: 2, maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: c.textMuted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {questionsLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
              <CircularProgress size={24} />
              <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading questions...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.875rem', color: c.textMuted, mb: 1 }}>
                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </Typography>
              {filteredQuestions.map((q) => (
                <Box
                  key={q.id}
                  sx={{
                    backgroundColor: c.surface,
                    border: `1px solid ${c.topBarBorder}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {/* Question header */}
                  <Box
                    onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: c.surfaceContainer },
                    }}
                  >
                    <Chip
                      label={`D${q.difficulty}`}
                      size="small"
                      sx={{
                        fontFamily: FONT_BODY,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        height: 22,
                        minWidth: 32,
                        backgroundColor: q.difficulty <= 2 ? '#4CAF50' : q.difficulty <= 3 ? '#FF9800' : '#F44336',
                        color: '#fff',
                      }}
                    />
                    <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.8125rem', color: c.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.questionText || q.questionContent || `Question ${q.id}`}
                    </Typography>
                    {q.subtopic && (
                      <Chip label={q.subtopic} size="small" sx={{ fontFamily: FONT_BODY, fontSize: '0.7rem', height: 20, backgroundColor: c.surfaceContainer, color: c.textSecondary }} />
                    )}
                    <IconButton size="small" sx={{ color: c.textMuted }}>
                      {expandedQ === q.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  {/* Expanded content */}
                  <Collapse in={expandedQ === q.id}>
                    <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${c.topBarBorder}` }}>
                      {q.questionContent && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 600, color: c.textSecondary, mb: 0.5 }}>Question</Typography>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.8125rem', color: c.textPrimary, whiteSpace: 'pre-wrap' }}>
                            {q.questionContent}
                          </Typography>
                        </Box>
                      )}
                      {q.solution && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 600, color: c.textSecondary, mb: 0.5 }}>Solution</Typography>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.8125rem', color: c.textPrimary, whiteSpace: 'pre-wrap' }}>
                            {q.solution}
                          </Typography>
                        </Box>
                      )}
                      {q.hints && q.hints.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 600, color: c.textSecondary, mb: 0.5 }}>Hints</Typography>
                          {q.hints.map((h, i) => (
                            <Typography key={i} sx={{ fontFamily: FONT_BODY, fontSize: '0.8125rem', color: c.textSecondary }}>
                              {i + 1}. {h}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {q.explanation && (
                        <Box sx={{ mt: 1.5 }}>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', fontWeight: 600, color: c.textSecondary, mb: 0.5 }}>Explanation</Typography>
                          <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.8125rem', color: c.textPrimary, whiteSpace: 'pre-wrap' }}>
                            {q.explanation}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
