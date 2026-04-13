import { Box, Typography } from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import { FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'

export default function AdminOrganizations() {
  const c = useHubColors()

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 3 }}>
        Organizations
      </Typography>

      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          backgroundColor: c.surface,
          border: `1px solid ${c.topBarBorder}`,
          borderRadius: 2,
          px: 4,
        }}
      >
        <BusinessIcon sx={{ fontSize: 48, color: c.textMuted, mb: 2 }} />
        <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 600, fontSize: '1.1rem', color: c.textPrimary, mb: 1 }}>
          Organization Management
        </Typography>
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary, maxWidth: 480, mx: 'auto' }}>
          School and district organization management is coming in a future update. This feature will allow you to group teachers by organization, manage district-wide licenses, and view aggregated analytics.
        </Typography>
      </Box>
    </Box>
  )
}
