import { Box, Typography } from '@mui/material'
import { darkColors, FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'

export default function AdminOverview() {
  const c = darkColors
  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
        Admin Overview
      </Typography>
      <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
        Coming soon — platform-wide metrics and admin dashboard.
      </Typography>
    </Box>
  )
}
