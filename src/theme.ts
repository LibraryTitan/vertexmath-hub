import { createTheme } from '@mui/material/styles'
import { darkMuiPalette, FONT_STACK_HEADLINE, FONT_STACK_BODY } from './theme/designTokens'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    ...darkMuiPalette,
  },
  typography: {
    fontFamily: FONT_STACK_BODY,
    h1: { fontFamily: FONT_STACK_HEADLINE, fontWeight: 800 },
    h2: { fontFamily: FONT_STACK_HEADLINE, fontWeight: 700 },
    h3: { fontFamily: FONT_STACK_HEADLINE, fontWeight: 700 },
    h4: { fontFamily: FONT_STACK_HEADLINE, fontWeight: 600 },
    h5: { fontFamily: FONT_STACK_HEADLINE, fontWeight: 600 },
    h6: { fontFamily: FONT_STACK_HEADLINE, fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
})
