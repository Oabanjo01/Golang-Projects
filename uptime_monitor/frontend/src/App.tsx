import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { AuthPage } from './features/auth/AuthPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { DashboardPage } from './routes/DashboardPage'
import { MonitorDetailPage } from './routes/MonitorDetailPage'
import { MonitorFormPage } from './routes/MonitorFormPage'

function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <AppHeader />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/monitors/new" element={<MonitorFormPage />} />
          <Route path="/monitors/:id" element={<MonitorDetailPage />} />
          <Route path="/monitors/:id/edit" element={<MonitorFormPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
