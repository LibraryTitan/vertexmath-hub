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
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import type { UserDoc } from '../../types/firestore'

interface UserRow extends UserDoc {
  uid: string
}

const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
  student: 'default',
  teacher: 'primary',
  orgAdmin: 'warning',
  superAdmin: 'error',
}

export default function AdminUsers() {
  const c = useHubColors()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    async function loadUsers() {
      try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
        const rows = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserRow))
        setUsers(rows)
      } catch {
        setUsers([])
      }
      setLoading(false)
    }
    loadUsers()
  }, [])

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    if (!matchesRole) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    )
  })

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 3 }}>
        Users
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or username..."
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: c.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role">
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="orgAdmin">Org Admin</MenuItem>
            <MenuItem value="superAdmin">Super Admin</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.875rem', color: c.textMuted, mb: 2 }}>
        {filtered.length} user{filtered.length !== 1 ? 's' : ''}{searchQuery ? ` matching "${searchQuery}"` : ''}
      </Typography>

      {loading ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading users...</Typography>
      ) : (
        <TableContainer sx={{ backgroundColor: c.surface, borderRadius: 2, border: `1px solid ${c.topBarBorder}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Name</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Email</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Username</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Role</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.uid} hover>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textPrimary }}>
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {u.email || '—'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {u.username || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" color={ROLE_COLORS[u.role] || 'default'} sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : '—'}
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
