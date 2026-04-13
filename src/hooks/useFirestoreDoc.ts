import { useEffect, useState } from 'react'
import { doc, onSnapshot, type DocumentReference } from 'firebase/firestore'
import { db } from '../firebase'

interface UseFirestoreDocResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useFirestoreDoc<T>(
  path: string | null
): UseFirestoreDocResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!path) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const ref = doc(db, path) as DocumentReference
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setData({ id: snap.id, ...snap.data() } as T)
        } else {
          setData(null)
        }
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [path])

  return { data, loading, error }
}
