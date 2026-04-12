import { Box, Avatar, InputBase } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { darkColors, layout, blur, zIndex, FONT_BODY } from '../../theme/designTokens'
import { useAuth } from '../../AuthProvider'

export default function DashboardTopBar() {
  const { firstName } = useAuth()
  const c = darkColors

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        left: layout.sidebarWidth,
        right: 0,
        height: layout.topBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        backdropFilter: blur.topBar,
        WebkitBackdropFilter: blur.topBar,
        backgroundColor: c.topBarBg,
        borderBottom: `1px solid ${c.topBarBorder}`,
        zIndex: zIndex.topBar,
      }}
    >
      {/* Search */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: c.searchBg,
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          maxWidth: layout.searchMaxWidth,
          flex: 1,
        }}
      >
        <SearchIcon sx={{ color: c.textMuted, fontSize: 20 }} />
        <InputBase
          placeholder="Search…"
          sx={{
            flex: 1,
            color: c.textPrimary,
            fontFamily: FONT_BODY,
            fontSize: '0.875rem',
          }}
        />
      </Box>

      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          ml: 2,
          bgcolor: c.primary,
          fontSize: '0.875rem',
          fontWeight: 700,
        }}
      >
        {firstName?.[0]?.toUpperCase() ?? '?'}
      </Avatar>
    </Box>
  )
}
