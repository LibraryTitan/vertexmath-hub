import { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import GroupsIcon from '@mui/icons-material/Groups'
import CardMembershipIcon from '@mui/icons-material/CardMembership'
import { motion } from 'framer-motion'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { FONT_HEADLINE, FONT_BODY, layout } from '../../theme/designTokens'
import { useHubColors } from '../../themeMode'

const MotionBox = motion.create(Box)

interface StatCard {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}

export default function AdminOverview() {
  const c = useHubColors()
  const [stats, setStats] = useState<StatCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [usersSnap, teachersSnap, classesSnap, subsSnap] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(query(collection(db, 'users'), where('role', '==', 'teacher'))),
          getCountFromServer(collection(db, 'classes')),
          getCountFromServer(collection(db, 'subscriptions')),
        ])

        setStats([
          { label: 'Total Users', value: usersSnap.data().count, icon: <PeopleIcon />, color: '#4CAF50' },
          { label: 'Teachers', value: teachersSnap.data().count, icon: <PeopleIcon />, color: '#2196F3' },
          { label: 'Classes', value: classesSnap.data().count, icon: <GroupsIcon />, color: '#FF9800' },
          { label: 'Subscriptions', value: subsSnap.data().count, icon: <CardMembershipIcon />, color: '#9C27B0' },
        ])
      } catch {
        setStats([
          { label: 'Total Users', value: '—', icon: <PeopleIcon />, color: '#4CAF50' },
          { label: 'Teachers', value: '—', icon: <PeopleIcon />, color: '#2196F3' },
          { label: 'Classes', value: '—', icon: <GroupsIcon />, color: '#FF9800' },
          { label: 'Subscriptions', value: '—', icon: <CardMembershipIcon />, color: '#9C27B0' },
        ])
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  return (
    <Box>
      <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.5rem', color: c.textPrimary, mb: 3 }}>
        Admin Overview
      </Typography>

      {loading ? (
        <Typography sx={{ fontFamily: FONT_BODY, color: c.textSecondary }}>Loading platform stats...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {stats.map((stat) => (
            <MotionBox
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              sx={{
                width: layout.cardWidth,
                backgroundColor: c.surface,
                border: `1px solid ${c.topBarBorder}`,
                borderRadius: 2,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: FONT_BODY, fontSize: '0.75rem', color: c.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </Typography>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </Box>
              <Typography sx={{ fontFamily: FONT_HEADLINE, fontWeight: 700, fontSize: '1.75rem', color: c.textPrimary }}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </Typography>
            </MotionBox>
          ))}
        </Box>
      )}
    </Box>
  )
}
