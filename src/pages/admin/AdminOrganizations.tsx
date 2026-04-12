import { Box, Typography } from '@mui/material'
import { darkColors, FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'

export default function AdminOrganizations() {
  const c = darkColors
  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
        Organizations
      </Typography>
      <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
        Coming soon — school and district organization management.
      </Typography>
    </Box>
  )
}
