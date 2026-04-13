import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  deleteUser,
  type User,
} from 'firebase/auth'
import { doc, getDoc, getDocFromServer, setDoc, getDocs, query, collection, where, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { auth, db } from './firebase'
import { setCrossAppSession, clearCrossAppSession, revokeAllSessions, exchangeSessionCookie, handleSSOToken } from './sso'

const ROLE_CACHE_KEY = 'hub:lastResolvedRole'
const FIRST_NAME_CACHE_KEY = 'hub:lastResolvedFirstName'
const UID_CACHE_KEY = 'hub:lastResolvedUid'

function isSupportedRole(role: unknown): role is 'student' | 'teacher' | 'orgAdmin' | 'superAdmin' {
  return role === 'student' || role === 'teacher' || role === 'orgAdmin' || role === 'superAdmin'
}

function readCachedProfile(uid: string) {
  if (typeof window === 'undefined') return { role: null, firstName: null }
  const cachedUid = window.localStorage.getItem(UID_CACHE_KEY)
  if (cachedUid !== uid) return { role: null, firstName: null }

  const cachedRole = window.localStorage.getItem(ROLE_CACHE_KEY)
  const cachedFirstName = window.localStorage.getItem(FIRST_NAME_CACHE_KEY)

  return {
    role: isSupportedRole(cachedRole) ? cachedRole : null,
    firstName: cachedFirstName || null,
  }
}

function writeCachedProfile(uid: string, role: string | null, firstName: string | null) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(UID_CACHE_KEY, uid)
  if (role) window.localStorage.setItem(ROLE_CACHE_KEY, role)
  else window.localStorage.removeItem(ROLE_CACHE_KEY)

  if (firstName) window.localStorage.setItem(FIRST_NAME_CACHE_KEY, firstName)
  else window.localStorage.removeItem(FIRST_NAME_CACHE_KEY)
}

function clearCachedProfile() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(UID_CACHE_KEY)
  window.localStorage.removeItem(ROLE_CACHE_KEY)
  window.localStorage.removeItem(FIRST_NAME_CACHE_KEY)
}

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
        const cachedProfile = readCachedProfile(firebaseUser.uid)

        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          let snap
          try {
            snap = await getDocFromServer(userRef)
          } catch {
            snap = await getDoc(userRef)
          }

          if (snap.exists()) {
            const data = snap.data()
            const resolvedRole = isSupportedRole(data.role) ? data.role : cachedProfile.role
            const resolvedFirstName = data.firstName || cachedProfile.firstName || firebaseUser.displayName?.split(' ')[0] || null

            setUserRole(resolvedRole)
            setFirstName(resolvedFirstName)
            writeCachedProfile(firebaseUser.uid, resolvedRole, resolvedFirstName)
            // Track Hub usage
            await setDoc(userRef, {
              apps: arrayUnion('hub'),
              lastLoginAt: serverTimestamp(),
            }, { merge: true }).catch(() => {})
          } else {
            const fallbackFirstName = cachedProfile.firstName || firebaseUser.displayName?.split(' ')[0] || null
            setUserRole(cachedProfile.role)
            setFirstName(fallbackFirstName)
            writeCachedProfile(firebaseUser.uid, cachedProfile.role, fallbackFirstName)
          }
        } catch {
          setUserRole(cachedProfile.role)
          setFirstName(cachedProfile.firstName)
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
          clearCachedProfile()
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
    // Create auth user first (signs them in so Firestore queries work)
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    try {
      // Validate username uniqueness (now authenticated)
      const q = query(collection(db, 'users'), where('usernameLower', '==', profile.username.toLowerCase()))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await deleteUser(cred.user)
        throw new Error('Username is already taken')
      }

      await setDoc(doc(db, 'users', cred.user.uid), {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        username: profile.username,
        usernameLower: profile.username.toLowerCase(),
        role: 'student',
        apps: arrayUnion('hub', 'vmo'),
        createdAt: serverTimestamp(),
      }, { merge: true })
      setUserRole('student')
      setFirstName(profile.firstName.trim())
      writeCachedProfile(cred.user.uid, 'student', profile.firstName.trim())
      setCrossAppSession()
    } catch (err) {
      // Clean up auth user if Firestore write failed (but not for username-taken)
      if ((err as Error).message !== 'Username is already taken') {
        await deleteUser(cred.user).catch(() => {})
      }
      throw err
    }
  }, [])

  const signUpTeacher = useCallback(async (email: string, password: string, profile: { firstName: string; lastName: string; username: string }) => {
    // Create auth user first (signs them in so Firestore queries work)
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    try {
      // Validate username uniqueness (now authenticated)
      const q = query(collection(db, 'users'), where('usernameLower', '==', profile.username.toLowerCase()))
      const snap = await getDocs(q)
      if (!snap.empty) {
        await deleteUser(cred.user)
        throw new Error('Username is already taken')
      }

      await setDoc(doc(db, 'users', cred.user.uid), {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        username: profile.username,
        usernameLower: profile.username.toLowerCase(),
        role: 'teacher',
        apps: arrayUnion('hub', 'pb', 'vmo'),
        createdAt: serverTimestamp(),
      }, { merge: true })
      setUserRole('teacher')
      setFirstName(profile.firstName.trim())
      writeCachedProfile(cred.user.uid, 'teacher', profile.firstName.trim())
      setCrossAppSession()
    } catch (err) {
      if ((err as Error).message !== 'Username is already taken') {
        await deleteUser(cred.user).catch(() => {})
      }
      throw err
    }
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
      setUserRole(role)
      setFirstName(first || '')
      writeCachedProfile(cred.user.uid, role, first || '')
    } else if (!snap.exists()) {
      // No account exists and no role specified — sign out and require role selection
      await firebaseSignOut(auth)
      const err = new Error('No account found for this Google account. Please select your role.')
      ;(err as any).code = 'auth/no-account'
      throw err
    } else {
      // Existing account — set role immediately to avoid race with onAuthStateChanged
      const data = snap.data()
      const resolvedRole = isSupportedRole(data.role) ? data.role : readCachedProfile(cred.user.uid).role
      const resolvedFirstName = data.firstName || readCachedProfile(cred.user.uid).firstName || cred.user.displayName?.split(' ')[0] || null
      setUserRole(resolvedRole)
      setFirstName(resolvedFirstName)
      writeCachedProfile(cred.user.uid, resolvedRole, resolvedFirstName)
    }
    setCrossAppSession()
  }, [])

  const signOutFn = useCallback(async () => {
    clearCrossAppSession()
    clearCachedProfile()
    await revokeAllSessions()
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
