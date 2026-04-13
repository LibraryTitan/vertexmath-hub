import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CssBaseline, ThemeProvider, useTheme } from '@mui/material'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth, db } from './firebase'
import { getColors } from './theme/designTokens'
import { createAppTheme, type HubThemeMode } from './theme'

const STORAGE_KEY = 'vertexmath-hub-theme-mode'

type ThemeModeContextValue = {
  mode: HubThemeMode
  setMode: (mode: HubThemeMode) => void
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null)

function getInitialMode(): HubThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY)
  if (storedMode === 'dark' || storedMode === 'light') {
    return storedMode
  }

  return 'light'
}

export function HubThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<HubThemeMode>(getInitialMode)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Track auth state for Firestore sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        // Read theme preference from Firestore on login
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) {
            const data = snap.data()
            if (data.themeMode === 'dark' || data.themeMode === 'light') {
              setMode(data.themeMode)
            }
          }
        } catch { /* ignore read errors */ }
      }
    })
    return () => unsub()
  }, [])

  // Save to localStorage + Firestore
  // Track whether mode has been user-changed (not initial load)
  const modeChangedByUser = useRef(false)
  const prevMode = useRef(mode)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
    document.documentElement.style.colorScheme = mode
    // Only sync to Firestore when user explicitly toggles theme, not on initial load
    if (currentUser && modeChangedByUser.current) {
      setDoc(doc(db, 'users', currentUser.uid), { themeMode: mode }, { merge: true }).catch(() => {})
    }
    if (prevMode.current !== mode) {
      modeChangedByUser.current = true
      prevMode.current = mode
    }
  }, [mode, currentUser])

  const theme = useMemo(() => createAppTheme(mode), [mode])
  const value = useMemo<ThemeModeContextValue>(() => ({
    mode,
    setMode,
    toggleMode: () => setMode((currentMode) => currentMode === 'dark' ? 'light' : 'dark'),
  }), [mode])

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export function useHubThemeMode() {
  const context = useContext(ThemeModeContext)

  if (!context) {
    throw new Error('useHubThemeMode must be used within a HubThemeProvider')
  }

  return context
}

export function useHubColors() {
  const theme = useTheme()
  return getColors(theme.palette.mode === 'light' ? 'light' : 'dark')
}