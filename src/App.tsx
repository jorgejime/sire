import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { LoginForm } from './components/auth/LoginForm'
import { DemoLogin } from './components/DemoLogin'
import { Dashboard } from './pages/Dashboard'
import { ChatPage } from './pages/ChatPage'
import { AlertsPage } from './pages/AlertsPage'
import { StudentsPage } from './pages/StudentsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { UsersPage } from './pages/UsersPage'
import { InterventionsPage } from './pages/InterventionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProgressPage } from './pages/ProgressPage'

function AuthenticatedApp() {
  const { user, loading, demoLogin, isDemo } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    // Siempre mostrar opciones de demo + login real
    return <DemoLogin onLogin={demoLogin} />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/interventions" element={<InterventionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthenticatedApp />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App