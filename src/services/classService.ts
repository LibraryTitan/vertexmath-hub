import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { ClassDoc, ClassSettings } from '../types/firestore'
import { generateClassCode } from '../utils/classCodeGenerator'

// ─── Create ──────────────────────────────────────────────────────

export async function createClass(
  className: string,
  teacherUid: string,
  teacherName: string
): Promise<string> {
  let code = generateClassCode()
  // Ensure uniqueness
  let existing = await getDoc(doc(db, 'classes', code))
  let attempts = 0
  while (existing.exists() && attempts < 10) {
    code = generateClassCode()
    existing = await getDoc(doc(db, 'classes', code))
    attempts++
  }
  if (existing.exists()) {
    throw new Error('Failed to generate unique class code')
  }

  const classDoc: Omit<ClassDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    classCode: code,
    className,
    teacherUid,
    teacherName,
    createdAt: serverTimestamp(),
    studentIds: [],
    studentCount: 0,
  }

  await setDoc(doc(db, 'classes', code), classDoc)
  // Track class in teacher's user doc
  await updateDoc(doc(db, 'users', teacherUid), {
    classes: arrayUnion(code),
  })

  return code
}

// ─── Read ────────────────────────────────────────────────────────

export function listenTeacherClasses(
  teacherUid: string,
  callback: (classes: ClassDoc[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'classes'),
    where('teacherUid', '==', teacherUid)
  )
  return onSnapshot(q, (snap) => {
    const classes = snap.docs.map((d) => ({ ...d.data(), classCode: d.id } as ClassDoc))
    callback(classes)
  })
}

export async function getClassInfo(classCode: string): Promise<ClassDoc | null> {
  const snap = await getDoc(doc(db, 'classes', classCode))
  if (!snap.exists()) return null
  return { ...snap.data(), classCode: snap.id } as ClassDoc
}

// ─── Update ──────────────────────────────────────────────────────

export async function updateClass(
  classCode: string,
  updates: { className?: string; settings?: ClassSettings }
): Promise<void> {
  await updateDoc(doc(db, 'classes', classCode), updates)
}

// ─── Delete ──────────────────────────────────────────────────────

export async function deleteClass(
  classCode: string,
  teacherUid: string
): Promise<void> {
  // Delete assignment subcollection docs
  const assignSnap = await getDocs(collection(db, 'classes', classCode, 'assignments'))
  const batch = writeBatch(db)
  for (const assignDoc of assignSnap.docs) {
    // Delete progress sub-subcollection
    const progressSnap = await getDocs(
      collection(db, 'classes', classCode, 'assignments', assignDoc.id, 'progress')
    )
    for (const prog of progressSnap.docs) {
      batch.delete(prog.ref)
    }
    batch.delete(assignDoc.ref)
  }
  batch.delete(doc(db, 'classes', classCode))
  await batch.commit()

  // Remove from teacher's class list
  await updateDoc(doc(db, 'users', teacherUid), {
    classes: arrayRemove(classCode),
  })
}

// ─── Students ────────────────────────────────────────────────────

export async function addStudentToClass(
  classCode: string,
  studentUid: string
): Promise<void> {
  await updateDoc(doc(db, 'classes', classCode), {
    studentIds: arrayUnion(studentUid),
    studentCount: increment(1),
  })
}

export async function removeStudentFromClass(
  classCode: string,
  studentUid: string
): Promise<void> {
  await updateDoc(doc(db, 'classes', classCode), {
    studentIds: arrayRemove(studentUid),
    studentCount: increment(-1),
  })
}
