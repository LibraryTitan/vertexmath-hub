import { useEffect, useState } from 'react'
import { onSnapshot, type Query } from 'firebase/firestore'

interface UseFirestoreCollectionResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
}

export function useFirestoreCollection<T>(
  query: Query | null
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!query) {
      setData([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = onSnapshot(
      query,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T))
        setData(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [query])

  return { data, loading, error }
}
