import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import type {
  ClassAnalytics,
  QuestionAnalytics,
  StudentProgress,
  UserDoc,
} from '../types/firestore'

// ─── Class-level analytics ───────────────────────────────────────

export async function getClassAnalytics(classCode: string): Promise<ClassAnalytics> {
  const assignSnap = await getDocs(
    collection(db, 'classes', classCode, 'assignments')
  )

  let totalStudents = 0
  let submittedCount = 0
  let totalScore = 0
  let scoreCount = 0
  const perQuestion: Record<string, QuestionAnalytics> = {}

  for (const assignDoc of assignSnap.docs) {
    const progressSnap = await getDocs(
      collection(db, 'classes', classCode, 'assignments', assignDoc.id, 'progress')
    )

    for (const progDoc of progressSnap.docs) {
      const prog = progDoc.data() as StudentProgress
      totalStudents++
      if (prog.completedAt) submittedCount++
      if (prog.totalQuestions > 0) {
        totalScore += prog.totalCorrect / prog.totalQuestions
        scoreCount++
      }

      // Aggregate per-question stats
      if (prog.questions) {
        for (const [qId, qp] of Object.entries(prog.questions)) {
          if (!perQuestion[qId]) {
            perQuestion[qId] = { correctRate: 0, avgAttempts: 0, avgTimeSpent: 0 }
          }
          const pq = perQuestion[qId]
          // Running averages — approximation for display
          pq.correctRate = (pq.correctRate + (qp.correct ? 1 : 0)) / 2
          pq.avgAttempts = (pq.avgAttempts + qp.attempts) / 2
          pq.avgTimeSpent = (pq.avgTimeSpent + qp.timeSpent) / 2
        }
      }
    }
  }

  return {
    totalStudents,
    submittedCount,
    averageScore: scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) : 0,
    perQuestion,
  }
}

// ─── Assignment-level analytics ──────────────────────────────────

export async function getAssignmentAnalytics(
  classCode: string,
  assignmentId: string
): Promise<{ progress: StudentProgress[]; perQuestion: Record<string, QuestionAnalytics> }> {
  const progressSnap = await getDocs(
    collection(db, 'classes', classCode, 'assignments', assignmentId, 'progress')
  )

  const progress: StudentProgress[] = []
  const qCounts: Record<string, { correct: number; total: number; attempts: number; time: number }> = {}

  for (const d of progressSnap.docs) {
    const p = d.data() as StudentProgress
    progress.push(p)

    if (p.questions) {
      for (const [qId, qp] of Object.entries(p.questions)) {
        if (!qCounts[qId]) {
          qCounts[qId] = { correct: 0, total: 0, attempts: 0, time: 0 }
        }
        qCounts[qId].total++
        if (qp.correct) qCounts[qId].correct++
        qCounts[qId].attempts += qp.attempts
        qCounts[qId].time += qp.timeSpent
      }
    }
  }

  const perQuestion: Record<string, QuestionAnalytics> = {}
  for (const [qId, c] of Object.entries(qCounts)) {
    perQuestion[qId] = {
      correctRate: c.total > 0 ? Math.round((c.correct / c.total) * 100) : 0,
      avgAttempts: c.total > 0 ? Math.round((c.attempts / c.total) * 10) / 10 : 0,
      avgTimeSpent: c.total > 0 ? Math.round(c.time / c.total) : 0,
    }
  }

  return { progress, perQuestion }
}

// ─── Student profile ─────────────────────────────────────────────

export async function getStudentProfile(studentUid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, 'users', studentUid))
  if (!snap.exists()) return null
  return snap.data() as UserDoc
}

// ─── Student analytics across a class ────────────────────────────

export async function getStudentClassAnalytics(
  classCode: string,
  studentUid: string
): Promise<{ assignmentId: string; title: string; score: number; completed: boolean }[]> {
  const assignSnap = await getDocs(
    collection(db, 'classes', classCode, 'assignments')
  )

  const results: { assignmentId: string; title: string; score: number; completed: boolean }[] = []

  for (const assignDoc of assignSnap.docs) {
    const assignData = assignDoc.data()
    const progSnap = await getDoc(
      doc(db, 'classes', classCode, 'assignments', assignDoc.id, 'progress', studentUid)
    )

    if (progSnap.exists()) {
      const prog = progSnap.data() as StudentProgress
      results.push({
        assignmentId: assignDoc.id,
        title: assignData.title ?? 'Untitled',
        score: prog.totalQuestions > 0
          ? Math.round((prog.totalCorrect / prog.totalQuestions) * 100)
          : 0,
        completed: !!prog.completedAt,
      })
    } else {
      results.push({
        assignmentId: assignDoc.id,
        title: assignData.title ?? 'Untitled',
        score: 0,
        completed: false,
      })
    }
  }

  return results
}
