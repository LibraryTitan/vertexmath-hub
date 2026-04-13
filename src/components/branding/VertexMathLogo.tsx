import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

interface VertexMathLogoProps {
  height?: number
  to?: string
  alt?: string
  sx?: object
  imageSx?: object
}

export default function VertexMathLogo({
  height = 40,
  to,
  alt = 'VertexMath',
  sx,
  imageSx,
}: VertexMathLogoProps) {
  const theme = useTheme()
  const logoSrc = theme.palette.mode === 'dark'
    ? '/logo/logo_transparent.png'
    : '/logo/logo_transparent_light.png'
  const wrapperBase = {
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: 0,
    textDecoration: 'none',
    cursor: to ? 'pointer' : 'default',
  }
  const imageBase = {
    height,
    width: 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
    display: 'block',
  }
  const wrapperStyles = { ...wrapperBase, ...(sx || {}) }
  const imageStyles = { ...imageBase, ...(imageSx || {}) }

  return (
    <Box
      component={to ? RouterLink : 'div'}
      to={to}
      aria-label={to ? 'VertexMath home' : undefined}
      sx={wrapperStyles}
    >
      <Box
        component="img"
        src={logoSrc}
        alt={alt}
        sx={imageStyles}
      />
    </Box>
  )
}