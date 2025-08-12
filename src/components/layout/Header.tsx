import { useState, useEffect } from 'react'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export function Header() {
  const { profile, isDemo } = useAuth()
  const [alertsCount, setAlertsCount] = useState(0)

  useEffect(() => {
    if (profile?.role !== 'student') {
      fetchUnresolvedAlerts()
    }
  }, [profile, isDemo])

  const fetchUnresolvedAlerts = async () => {
    try {
      if (isDemo) {
        setAlertsCount(23) // Dato mock para demo
        return
      }

      const { count } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_resolved', false)

      setAlertsCount(count || 0)
    } catch (error) {
      console.error('Error fetching alerts count:', error)
    }
  }

  const formatDate = () => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date())
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-600 mt-1 capitalize">
            {formatDate()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          {profile?.role !== 'student' && (
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="h-6 w-6" />
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alertsCount > 99 ? '99+' : alertsCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function getPageTitle() {
  const path = window.location.pathname
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/students': 'Estudiantes',
    '/alerts': 'Alertas',
    '/analytics': 'Análisis',
    '/chat': 'Chat',
    '/users': 'Usuarios',
    '/settings': 'Configuración',
    '/progress': 'Mi Progreso',
    '/interventions': 'Intervenciones',
    '/reports': 'Reportes',
  }

  return titles[path] || 'Dashboard'
}