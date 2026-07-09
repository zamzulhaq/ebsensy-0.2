import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import AuthGuard from './components/AuthGuard'
import Login from './pages/Login'
import AktivasiWA from './pages/AktivasiWA'
import Unauthorized from './pages/Unauthorized'
import DashboardLayout from './layouts/DashboardLayout'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import SchoolProfile from './pages/dashboard/admin/SchoolProfile'
import AcademicYears from './pages/dashboard/admin/AcademicYears'
import Students from './pages/dashboard/admin/Students'
import Teachers from './pages/dashboard/admin/Teachers'
import Groups from './pages/dashboard/admin/Groups'
import GuruDashboard from './pages/dashboard/GuruDashboard'
import WaliKelasDashboard from './pages/dashboard/WaliKelasDashboard'
import MusyrifDashboard from './pages/dashboard/MusyrifDashboard'
import WaliSantriDashboard from './pages/dashboard/WaliSantriDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/aktivasi-wa"
            element={
              <AuthGuard requireWaliSantriPending>
                <AktivasiWA />
              </AuthGuard>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/master/school-profile" element={<SchoolProfile />} />
            <Route path="admin/master/academic-years" element={<AcademicYears />} />
            <Route path="admin/master/students" element={<Students />} />
            <Route path="admin/master/teachers" element={<Teachers />} />
            <Route path="admin/master/groups" element={<Groups />} />
            <Route path="guru" element={<GuruDashboard />} />
            <Route path="wali-kelas" element={<WaliKelasDashboard />} />
            <Route path="musyrif" element={<MusyrifDashboard />} />
            <Route path="wali-santri" element={<WaliSantriDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
