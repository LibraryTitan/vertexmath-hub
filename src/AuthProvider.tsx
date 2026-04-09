import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, getDocs, query, collection, where, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { auth, db } from './firebase'
import { setCrossAppSession, clearCrossAppSession, exchangeSessionCookie, handleSSOToken } from './sso'

interface AuthContextValue {
  user: User | null
  userRole: string | null
  firstName: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUpStudent: (email: string, password: string, profile: { firstName: string; lastName: string; username: string }) => Promise<void>
  signUpTeacher: (email: string, password: string, profile: { firstName: string; lastName: string; username: string }) => Promise<void>
  signInWithGoogle: (role?: 'student' | 'teacher') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle SSO token from URL (cross-app navigation)
    handleSSOToken()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            const data = snap.data()
            setUserRole(data.role || 'student')
            setFirstName(data.firstName || firebaseUser.displayName?.split(' ')[0] || null)
            // Track Hub usage
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              apps: arrayUnion('hub'),
              lastLoginAt: serverTimestamp(),
            }, { merge: true }).catch(() => {})
          } else {
            setUserRole(null)
            setFirstName(firebaseUser.displayName?.split(' ')[0] || null)
          }
        } catch {
          setUserRole(null)
          setFirstName(null)
        }
        setUser(firebaseUser)
        setLoading(false)
      } else {
        // Try cookie-based auto-SSO before giving up
        const exchanged = await exchangeSessionCookie()
        if (!exchanged) {
          setUser(null)
          setUserRole(null)
          setFirstName(null)
          setLoading(false)
        }
        // If exchange succeeded, onAuthStateChanged will re-fire with the user
      }
    })

    return () => unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
    setCrossAppSession()
  }, [])

  const signUpStudent = useCallback(async (email: string, password: string, profile: { firstName: string; lastName: string; username: string }) => {
    // Validate username uniqueness
    const q = query(collection(db, 'users'), where('usernameLower', '==', profile.username.toLowerCase()))
    const snap = await getDocs(q)
    if (!snap.empty) throw new Error('Username is already taken')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      username: profile.username,
      usernameLower: profile.username.toLowerCase(),
      role: 'student',
      apps: arrayUnion('hub', 'vmo'),
      createdAt: serverTimestamp(),
    }, { merge: true })
    setCrossAppSession()
  }, [])

  const signUpTeacher = useCallback(async (email: string, password: string, profile: { firstName: string; lastName: string; username: string }) => {
    const q = query(collection(db, 'users'), where('usernameLower', '==', profile.username.toLowerCase()))
    const snap = await getDocs(q)
    if (!snap.empty) throw new Error('Username is already taken')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      username: profile.username,
      usernameLower: profile.username.toLowerCase(),
      role: 'teacher',
      apps: arrayUnion('hub', 'pb', 'vmo'),
      createdAt: serverTimestamp(),
    }, { merge: true })
    setCrossAppSession()
  }, [])

  const signInWithGoogleFn = useCallback(async (role?: 'student' | 'teacher') => {
    const cred = await signInWithPopup(auth, googleProvider)
    // Check if user doc already exists
    const snap = await getDoc(doc(db, 'users', cred.user.uid))
    if (!snap.exists() && role) {
      // First-time Google sign-in — create user doc with the selected role
      const displayName = cred.user.displayName || ''
      const [first, ...rest] = displayName.split(' ')
      await setDoc(doc(db, 'users', cred.user.uid), {
        firstName: first || '',
        lastName: rest.join(' ') || '',
        username: cred.user.email?.split('@')[0] || cred.user.uid.substring(0, 8),
        usernameLower: (cred.user.email?.split('@')[0] || cred.user.uid.substring(0, 8)).toLowerCase(),
        role,
        apps: arrayUnion('hub', ...(role === 'teacher' ? ['pb', 'vmo'] : ['vmo'])),
        googleLinked: true,
        createdAt: serverTimestamp(),
      }, { merge: true })
    }
    setCrossAppSession()
  }, [])

  const signOutFn = useCallback(async () => {
    clearCrossAppSession()
    await firebaseSignOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{
      user, userRole, firstName, loading,
      signIn, signUpStudent, signUpTeacher,
      signInWithGoogle: signInWithGoogleFn,
      signOut: signOutFn,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
