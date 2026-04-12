import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import AppsPage from './pages/AppsPage'
import AccountPage from './pages/AccountPage'
import DashboardLayout from './components/layout/DashboardLayout'
import RoleGuard from './components/guards/RoleGuard'
import TeacherOverview from './pages/teacher/TeacherOverview'
import TeacherClasses from './pages/teacher/TeacherClasses'
import TeacherAssignments from './pages/teacher/TeacherAssignments'
import TeacherAnalytics from './pages/teacher/TeacherAnalytics'
import TeacherQuestionBanks from './pages/teacher/TeacherQuestionBanks'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrganizations from './pages/admin/AdminOrganizations'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import AdminLicenses from './pages/admin/AdminLicenses'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/signin" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/apps" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/signup/:role" element={<PublicRoute><SignUpPage /></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute><SignInPage /></PublicRoute>} />
      <Route path="/apps" element={<ProtectedRoute><AppsPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

      {/* Teacher dashboard */}
      <Route
        path="/teacher"
        element={
          <RoleGuard allowedRoles={['teacher', 'orgAdmin', 'superAdmin']}>
            <DashboardLayout role="teacher" />
          </RoleGuard>
        }
      >
        <Route index element={<TeacherOverview />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="analytics" element={<TeacherAnalytics />} />
        <Route path="question-banks" element={<TeacherQuestionBanks />} />
      </Route>

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <RoleGuard allowedRoles={['orgAdmin', 'superAdmin']}>
            <DashboardLayout role="admin" />
          </RoleGuard>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orgs" element={<AdminOrganizations />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="licenses" element={<AdminLicenses />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
