import { useMemo, useState } from 'react'
import { Box, Avatar, InputBase, IconButton, Menu, MenuItem, Divider, Tooltip, Typography, ListItemIcon, ListItemText } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AppsIcon from '@mui/icons-material/Apps'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import GroupsIcon from '@mui/icons-material/Groups'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useNavigate } from 'react-router-dom'
import { darkColors, layout, blur, zIndex, FONT_BODY } from '../../theme/designTokens'
import { useAuth } from '../../AuthProvider'

interface DashboardTopBarProps {
  role: 'teacher' | 'admin'
}

export default function DashboardTopBar({ role }: DashboardTopBarProps) {
  const navigate = useNavigate()
  const { user, userRole, firstName, signOut } = useAuth()
  const [accountAnchorEl, setAccountAnchorEl] = useState<HTMLElement | null>(null)
  const c = darkColors
  const portalLabel = role === 'admin' ? 'Admin Portal' : 'Teacher Portal'
  const searchPlaceholder = role === 'admin'
    ? 'Search users, organizations, subscriptions...'
    : 'Search classes, assignments, analytics...'
  const canOpenTeacherPortal = ['teacher', 'orgAdmin', 'superAdmin'].includes(userRole || '')
  const canOpenAdminPortal = ['orgAdmin', 'superAdmin'].includes(userRole || '')
  const avatarLabel = useMemo(() => {
    return user?.displayName?.trim()?.[0]?.toUpperCase()
      || firstName?.[0]?.toUpperCase()
      || user?.email?.[0]?.toUpperCase()
      || '?'
  }, [firstName, user?.displayName, user?.email])

  const closeMenu = () => setAccountAnchorEl(null)

  const goTo = (path: string) => {
    closeMenu()
    navigate(path)
  }

  const handleSignOut = async () => {
    closeMenu()
    await signOut()
    navigate('/')
  }

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            border: `1px solid ${c.topBarBorder}`,
            backgroundColor: c.surfaceContainer,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              color: c.textPrimary,
              fontFamily: FONT_BODY,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {portalLabel}
          </Typography>
        </Box>

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
            minWidth: 0,
          }}
        >
          <SearchIcon sx={{ color: c.textMuted, fontSize: 20 }} />
          <InputBase
            placeholder={searchPlaceholder}
            sx={{
              flex: 1,
              color: c.textPrimary,
              fontFamily: FONT_BODY,
              fontSize: '0.875rem',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
        <Tooltip title="App Selector">
          <IconButton
            onClick={() => navigate('/apps')}
            sx={{ color: c.textMuted, '&:hover': { color: c.textPrimary, backgroundColor: c.surfaceContainer } }}
          >
            <AppsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Profile & Settings">
          <IconButton
            onClick={() => navigate('/account')}
            sx={{ color: c.textMuted, '&:hover': { color: c.textPrimary, backgroundColor: c.surfaceContainer } }}
          >
            <SettingsOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton
            onClick={(event) => setAccountAnchorEl(event.currentTarget)}
            sx={{ p: 0, borderRadius: 2 }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                width: 36,
                height: 36,
                bgcolor: c.primary,
                fontSize: '0.875rem',
                fontWeight: 700,
                color: c.onPrimary,
                border: `1px solid ${c.topBarBorder}`,
              }}
            >
              {avatarLabel}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={accountAnchorEl}
        open={Boolean(accountAnchorEl)}
        onClose={closeMenu}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              mt: 1,
              borderRadius: 2,
              border: `1px solid ${c.topBarBorder}`,
              bgcolor: c.surface,
              color: c.textPrimary,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ color: c.textPrimary, fontSize: '0.875rem', fontWeight: 700, fontFamily: FONT_BODY }}>
            {user?.displayName || firstName || 'VertexMath User'}
          </Typography>
          <Typography sx={{ color: c.textSecondary, fontSize: '0.75rem', mt: 0.25, fontFamily: FONT_BODY }}>
            {user?.email || ''}
          </Typography>
          <Typography sx={{ color: c.primary, fontSize: '0.75rem', mt: 0.75, fontWeight: 600, fontFamily: FONT_BODY }}>
            {portalLabel}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: c.topBarBorder }} />

        <MenuItem onClick={() => goTo('/account')} sx={{ gap: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 32, color: c.textSecondary }}>
            <AccountCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>

        <MenuItem onClick={() => goTo('/account')} sx={{ gap: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 32, color: c.textSecondary }}>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Account Settings" />
        </MenuItem>

        <MenuItem onClick={() => goTo('/apps')} sx={{ gap: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 32, color: c.textSecondary }}>
            <AppsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="App Selector" />
        </MenuItem>

        {role !== 'teacher' && canOpenTeacherPortal && (
          <MenuItem onClick={() => goTo('/teacher')} sx={{ gap: 1.25 }}>
            <ListItemIcon sx={{ minWidth: 32, color: c.textSecondary }}>
              <GroupsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Teacher Portal" />
          </MenuItem>
        )}

        {role !== 'admin' && canOpenAdminPortal && (
          <MenuItem onClick={() => goTo('/admin')} sx={{ gap: 1.25 }}>
            <ListItemIcon sx={{ minWidth: 32, color: c.textSecondary }}>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Admin Portal" />
          </MenuItem>
        )}

        <Divider sx={{ borderColor: c.topBarBorder }} />

        <MenuItem onClick={handleSignOut} sx={{ gap: 1.25 }}>
          <ListItemIcon sx={{ minWidth: 32, color: c.textSecondary }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </Box>
  )
}
