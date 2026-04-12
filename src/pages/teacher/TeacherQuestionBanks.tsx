import { Box, Typography } from '@mui/material'
import { darkColors, FONT_HEADLINE, FONT_BODY } from '../../theme/designTokens'

export default function TeacherQuestionBanks() {
  const c = darkColors
  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 1 }}>
        Question Banks
      </Typography>
      <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>
        Coming soon — browse and manage question bank content.
      </Typography>
    </Box>
  )
}
