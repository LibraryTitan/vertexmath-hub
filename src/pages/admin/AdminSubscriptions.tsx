import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import type { SubscriptionDoc } from '../../types/firestore'

interface SubRow extends SubscriptionDoc {
  id: string
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  canceled: 'error',
}

export default function AdminSubscriptions() {
  const c = useHubColors()
  const [subscriptions, setSubscriptions] = useState<SubRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadSubs() {
      try {
        const snap = await getDocs(query(collection(db, 'subscriptions'), orderBy('currentPeriodEnd', 'desc')))
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubRow))
        setSubscriptions(rows)
      } catch {
        setSubscriptions([])
      }
      setLoading(false)
    }
    loadSubs()
  }, [])

  const filtered = subscriptions.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return s.userId?.toLowerCase().includes(q) || s.planId?.toLowerCase().includes(q) || s.stripeSubscriptionId?.toLowerCase().includes(q)
  })

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 3 }}>
        Subscriptions
      </Typography>

      <TextField
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by user ID, plan, or subscription ID..."
        size="small"
        sx={{ mb: 3, maxWidth: 420 }}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: c.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.875rem', color: c.textMuted, mb: 2 }}>
        {filtered.length} subscription{filtered.length !== 1 ? 's' : ''}
      </Typography>

      {loading ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading subscriptions...</Typography>
      ) : (
        <TableContainer sx={{ backgroundColor: c.surface, borderRadius: 2, border: `1px solid ${c.topBarBorder}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>User ID</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Plan</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Status</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Renewal Date</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Auto-Renew</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary, fontSize: '0.8125rem' }}>
                    {s.userId}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {s.planId || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip label={s.status} size="small" color={STATUS_COLORS[s.status] || 'default'} sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {s.currentPeriodEnd?.toDate ? s.currentPeriodEnd.toDate().toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {s.cancelAtPeriodEnd ? 'No' : 'Yes'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
