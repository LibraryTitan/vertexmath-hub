import { useCallback, useEffect, useState } from 'react'
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'
import { useAuth } from '../../AuthProvider'
import type { RedemptionCodeDoc } from '../../types/firestore'

interface CodeRow extends RedemptionCodeDoc {
  id: string
}

export default function AdminLicenses() {
  const c = useHubColors()
  const { user } = useAuth()
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [codeValue, setCodeValue] = useState('')
  const [codeType, setCodeType] = useState<'qbGrant' | 'proGrant' | 'storageGrant'>('qbGrant')
  const [codeSubject, setCodeSubject] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function loadCodes() {
      try {
        const snap = await getDocs(query(collection(db, 'redemptionCodes'), orderBy('createdAt', 'desc')))
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CodeRow))
        setCodes(rows)
      } catch {
        setCodes([])
      }
      setLoading(false)
    }
    loadCodes()
  }, [])

  const handleCreate = useCallback(async () => {
    if (!user || !codeValue.trim()) return
    setCreating(true)
    try {
      const newCode: Omit<RedemptionCodeDoc, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
        code: codeValue.trim().toUpperCase(),
        type: codeType,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      }
      if (codeType === 'qbGrant' && codeSubject) {
        newCode.subject = codeSubject
      }
      await addDoc(collection(db, 'redemptionCodes'), newCode)
      const snap = await getDocs(query(collection(db, 'redemptionCodes'), orderBy('createdAt', 'desc')))
      setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CodeRow)))
      setCreateOpen(false)
      setCodeValue('')
      setCodeSubject('')
    } finally {
      setCreating(false)
    }
  }, [user, codeValue, codeType, codeSubject])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary }}>
          Licenses & Redemption Codes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}
        >
          Create Code
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading codes...</Typography>
      ) : codes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, backgroundColor: c.surface, border: `1px solid ${c.topBarBorder}`, borderRadius: 2 }}>
          <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, color: c.textPrimary, mb: 1 }}>
            No redemption codes yet
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, mb: 3 }}>
            Create redemption codes to grant access to question banks, Pro features, or additional storage.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>
            Create First Code
          </Button>
        </Box>
      ) : (
        <TableContainer sx={{ backgroundColor: c.surface, borderRadius: 2, border: `1px solid ${c.topBarBorder}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Code</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Type</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Subject</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Status</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Created</TableCell>
                <TableCell sx={{ fontFamily: FONT_BODY, fontWeight: 600, color: c.textSecondary }}>Redeemed By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontFamily: FONT_BODY, color: c.textPrimary, fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.05em' }}>
                        {code.code}
                      </Typography>
                      <Tooltip title={copied === code.code ? 'Copied!' : 'Copy'}>
                        <IconButton size="small" onClick={() => copyCode(code.code)} sx={{ color: c.textMuted }}>
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={code.type} size="small" sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {code.subject || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={code.redeemedBy ? 'Redeemed' : 'Available'}
                      size="small"
                      color={code.redeemedBy ? 'default' : 'success'}
                      sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {code.createdAt?.toDate ? code.createdAt.toDate().toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: FONT_BODY, color: c.textSecondary, fontSize: '0.8125rem' }}>
                    {code.redeemedBy || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700 }}>Create Redemption Code</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Code"
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
            placeholder="e.g., MATH2026"
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={codeType} onChange={(e) => setCodeType(e.target.value as typeof codeType)} label="Type">
              <MenuItem value="qbGrant">Question Bank Grant</MenuItem>
              <MenuItem value="proGrant">Pro Grant</MenuItem>
              <MenuItem value="storageGrant">Storage Grant</MenuItem>
            </Select>
          </FormControl>
          {codeType === 'qbGrant' && (
            <TextField
              label="Subject"
              value={codeSubject}
              onChange={(e) => setCodeSubject(e.target.value)}
              placeholder="e.g., A1, GEO, all"
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none', fontFamily: FONT_BODY }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!codeValue.trim() || creating} sx={{ textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 600, borderRadius: 2 }}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
