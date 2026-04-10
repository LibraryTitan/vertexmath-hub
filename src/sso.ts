import { httpsCallable } from 'firebase/functions'
import { signInWithCustomToken } from 'firebase/auth'
import { auth, functions } from './firebase'

/** Create a cross-app session and set the shared cookie */
export async function setCrossAppSession(): Promise<void> {
  try {
    const createSession = httpsCallable(functions, 'createCrossAppSession')
    const result = await createSession()
    const sessionId = (result.data as { sessionId: string }).sessionId
    document.cookie = `vertexmath_session=${sessionId}; domain=.vertexmath.org; secure; samesite=lax; path=/; max-age=3600`
  } catch (err) {
    console.warn('[SSO] Failed to create cross-app session:', err)
  }
}

/** Clear the cross-app session cookie */
export function clearCrossAppSession(): void {
  document.cookie = 'vertexmath_session=; domain=.vertexmath.org; secure; samesite=lax; path=/; max-age=0'
}

/** Revoke all cross-app sessions in Firestore for the current user */
export async function revokeAllSessions(): Promise<void> {
  try {
    const revoke = httpsCallable(functions, 'revokeAllSessions')
    await revoke()
  } catch (err) {
    console.warn('[SSO] Failed to revoke sessions:', err)
  }
}

/** Get a custom token for navigating to another app */
export async function getCustomTokenForRedirect(): Promise<string | null> {
  try {
    const getToken = httpsCallable(functions, 'getCustomToken')
    const result = await getToken()
    return (result.data as { token: string }).token
  } catch (err) {
    console.warn('[SSO] Failed to get custom token:', err)
    return null
  }
}

/** Exchange a cross-app session cookie for sign-in (auto-SSO on page load) */
export async function exchangeSessionCookie(): Promise<boolean> {
  const sessionCookie = document.cookie.split('; ').find(c => c.startsWith('vertexmath_session='))
  if (!sessionCookie) return false

  const sessionId = sessionCookie.split('=')[1]
  if (!sessionId) return false

  try {
    const exchangeSession = httpsCallable(functions, 'exchangeCrossAppSession')
    const result = await exchangeSession({ sessionId })
    const token = (result.data as { token: string }).token
    await signInWithCustomToken(auth, token)
    // Create new session for reverse direction
    setCrossAppSession()
    return true
  } catch (err) {
    console.warn('[SSO] Cookie session exchange failed:', err)
    clearCrossAppSession()
    return false
  }
}

/** Handle SSO token from URL (cross-app navigation link) */
export async function handleSSOToken(): Promise<boolean> {
  const params = new URLSearchParams(window.location.search)
  const ssoToken = params.get('authToken')
  if (!ssoToken) return false

  // Clean URL immediately
  const cleanUrl = new URL(window.location.href)
  cleanUrl.searchParams.delete('authToken')
  window.history.replaceState(null, '', cleanUrl.toString())

  try {
    await signInWithCustomToken(auth, ssoToken)
    setCrossAppSession()
    return true
  } catch (err) {
    console.warn('[SSO] Custom token sign-in failed:', err)
    return false
  }
}
