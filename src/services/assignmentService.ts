import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { AssignmentDoc, AssignmentSettings, StudentProgress } from '../types/firestore'

// ─── Create ──────────────────────────────────────────────────────

export interface CreateAssignmentInput {
  classCode: string
  type: 'question-bank' | 'lesson'
  title: string
  bankId?: string
  bankPath?: string
  questionIds?: string[]
  questionCount: number
  lessonFile?: string
  lessonName?: string
  dueDate: Date
  teacherUid: string
  settings: AssignmentSettings
}

export async function createAssignment(input: CreateAssignmentInput): Promise<string> {
  const { dueDate, ...rest } = input
  const ref = await addDoc(
    collection(db, 'classes', input.classCode, 'assignments'),
    {
      ...rest,
      dueDate: dueDate,
      assignedAt: serverTimestamp(),
    }
  )
  return ref.id
}

// ─── Read ────────────────────────────────────────────────────────

export function listenClassAssignments(
  classCode: string,
  callback: (assignments: (AssignmentDoc & { id: string })[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'classes', classCode, 'assignments'),
    orderBy('assignedAt', 'desc')
  )
  return onSnapshot(q, (snap) => {
    const assignments = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as (AssignmentDoc & { id: string })[]
    callback(assignments)
  })
}

export async function getAssignment(
  classCode: string,
  assignmentId: string
): Promise<(AssignmentDoc & { id: string }) | null> {
  const snap = await getDoc(doc(db, 'classes', classCode, 'assignments', assignmentId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AssignmentDoc & { id: string }
}

// ─── Update ──────────────────────────────────────────────────────

export async function updateAssignment(
  classCode: string,
  assignmentId: string,
  updates: Partial<Pick<AssignmentDoc, 'title' | 'dueDate' | 'settings'>>
): Promise<void> {
  await updateDoc(
    doc(db, 'classes', classCode, 'assignments', assignmentId),
    updates
  )
}

// ─── Delete ──────────────────────────────────────────────────────

export async function deleteAssignment(
  classCode: string,
  assignmentId: string
): Promise<void> {
  // Delete progress sub-subcollection
  const progressSnap = await getDocs(
    collection(db, 'classes', classCode, 'assignments', assignmentId, 'progress')
  )
  const batch = writeBatch(db)
  for (const prog of progressSnap.docs) {
    batch.delete(prog.ref)
  }
  batch.delete(doc(db, 'classes', classCode, 'assignments', assignmentId))
  await batch.commit()
}

// ─── Progress ────────────────────────────────────────────────────

export function listenAssignmentProgress(
  classCode: string,
  assignmentId: string,
  callback: (progress: (StudentProgress & { id: string })[]) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'classes', classCode, 'assignments', assignmentId, 'progress'),
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as (StudentProgress & { id: string })[]
      callback(items)
    }
  )
}
