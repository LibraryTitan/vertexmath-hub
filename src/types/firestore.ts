import type { Timestamp } from 'firebase/firestore'

// ─── User ────────────────────────────────────────────────────────

export interface UserDoc {
  firstName: string
  lastName: string
  username: string
  usernameLower: string
  role: 'student' | 'teacher' | 'orgAdmin' | 'superAdmin'
  apps: string[]
  email?: string
  googleLinked?: boolean
  themeMode?: 'dark' | 'light'
  createdAt: Timestamp
  lastLoginAt?: Timestamp
  classes?: string[]
  accountId?: number
}

// ─── Class ───────────────────────────────────────────────────────

export interface ClassDoc {
  classCode: string
  className: string
  teacherUid: string
  teacherName: string
  createdAt: Timestamp
  studentIds: string[]
  studentCount: number
  settings?: ClassSettings
}

export interface ClassSettings {
  allowLateSubmissions?: boolean
  defaultMaxAttempts?: number
}

// ─── Assignment ──────────────────────────────────────────────────

export type AssignmentType = 'question-bank' | 'lesson'
export type SolutionVisibility = 'submit' | 'deadline' | 'never'

export interface AssignmentSettings {
  shuffleQuestions: boolean
  showHints: boolean
  maxAttempts: number
  showSolutionAfter: SolutionVisibility
}

export interface AssignmentDoc {
  classCode: string
  type: AssignmentType
  title: string
  bankId?: string
  bankPath?: string
  questionIds?: string[]
  questionCount: number
  lessonFile?: string
  lessonName?: string
  dueDate: Timestamp
  assignedAt: Timestamp
  teacherUid: string
  settings: AssignmentSettings
}

// ─── Progress ────────────────────────────────────────────────────

export interface QuestionProgress {
  answered: boolean
  correct: boolean
  attempts: number
  hintsUsed: number
  answer: string
  timeSpent: number
}

export interface StudentProgress {
  studentUid: string
  studentAccountId?: number
  startedAt: Timestamp
  completedAt: Timestamp | null
  questions: Record<string, QuestionProgress>
  totalCorrect: number
  totalQuestions: number
  progressPercent: number
}

// ─── Question Bank ───────────────────────────────────────────────

export interface BankEntry {
  id: string
  path: string
  subject: string
  chapter: string
  section: string
  title: string
  book: string
  tags: string
  questionCount: number
}

export interface BankQuestion {
  id: string
  difficulty: number
  questionText: string
  questionContent: string
  solution: string
  topic: string
  subtopic: string
  questionImage?: string
  solutionImage?: string
  questionType?: string
  options?: { text: string; correct: boolean }[]
  hints?: string[]
  explanation?: string
}

// ─── Analytics ───────────────────────────────────────────────────

export interface ClassAnalytics {
  totalStudents: number
  submittedCount: number
  averageScore: number
  perQuestion: Record<string, QuestionAnalytics>
}

export interface QuestionAnalytics {
  correctRate: number
  avgAttempts: number
  avgTimeSpent: number
}

// ─── Subscription / Entitlement ──────────────────────────────────

export interface SubscriptionDoc {
  userId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  planId: string
  currentPeriodEnd: Timestamp
  cancelAtPeriodEnd: boolean
  stripeCustomerId: string
  stripeSubscriptionId: string
}

export interface RedemptionCodeDoc {
  code: string
  type: 'qbGrant' | 'proGrant' | 'storageGrant'
  subject?: string
  createdAt: Timestamp
  expiresAt?: Timestamp
  redeemedBy?: string
  redeemedAt?: Timestamp
  createdBy: string
}
