import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  MessageCircle, 
  BarChart3, 
  Settings,
  GraduationCap,
  TrendingUp,
  Bell,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { clsx } from 'clsx'

const navigation = {
  student: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mi Progreso', href: '/progress', icon: TrendingUp },
    { name: 'Chat Soporte', href: '/chat', icon: MessageCircle },
    { name: 'Mis Alertas', href: '/alerts', icon: Bell },
  ],
  coordinator: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Estudiantes', href: '/students', icon: GraduationCap },
    { name: 'Alertas', href: '/alerts', icon: AlertTriangle },
    { name: 'Análisis', href: '/analytics', icon: BarChart3 },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/users', icon: Users },
    { name: 'Estudiantes', href: '/students', icon: GraduationCap },
    { name: 'Alertas', href: '/alerts', icon: AlertTriangle },
    { name: 'Análisis', href: '/analytics', icon: BarChart3 },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ],
  counselor: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mis Estudiantes', href: '/students', icon: GraduationCap },
    { name: 'Intervenciones', href: '/interventions', icon: AlertTriangle },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
  ],
}

export function Sidebar() {
  const { profile, signOut } = useAuth()
  
  if (!profile) return null

  const userNavigation = navigation[profile.role] || navigation.student

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-800">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-blue-400" />
          <span className="text-xl font-bold">USM-IA</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile.full_name}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {userNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-2 py-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white w-full transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}