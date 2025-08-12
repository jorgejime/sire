import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield,
  Clock,
  Settings,
  Edit2,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Activity,
  FileText
} from 'lucide-react'
import { clsx } from 'clsx'

interface UserProfile {
  id: string
  email: string
  role: 'student' | 'coordinator' | 'admin' | 'counselor'
  full_name: string
  department: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_login?: string
  status: 'active' | 'inactive' | 'suspended'
  permissions?: string[]
}

interface UserDetailProps {
  user: UserProfile
  onClose: () => void
  onEdit: (user: UserProfile) => void
}

const roleLabels = {
  student: 'Estudiante',
  coordinator: 'Coordinador',
  admin: 'Administrador',
  counselor: 'Consejero'
}

const roleColors = {
  student: 'bg-blue-100 text-blue-800',
  coordinator: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
  counselor: 'bg-orange-100 text-orange-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800'
}

const statusLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
  suspended: 'Suspendido'
}

const permissionLabels = {
  manage_users: 'Gestionar usuarios',
  manage_students: 'Gestionar estudiantes',
  view_analytics: 'Ver análisis',
  manage_settings: 'Configurar sistema',
  export_data: 'Exportar datos',
  create_alerts: 'Crear alertas',
  manage_interventions: 'Gestionar intervenciones',
  view_students: 'Ver estudiantes',
  create_interventions: 'Crear intervenciones',
  access_chat: 'Acceso al chat',
  view_own_data: 'Ver datos propios',
  view_resources: 'Ver recursos'
}

export function UserDetail({ user, onClose, onEdit }: UserDetailProps) {
  const [loading, setLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Nunca ha iniciado sesión'
    
    const loginDate = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`
    
    return formatDate(dateString)
  }

  const generateActivityData = () => [
    { date: '2024-01-15', action: 'Inició sesión', details: 'Acceso desde Chrome' },
    { date: '2024-01-14', action: 'Actualizó perfil', details: 'Cambió número de teléfono' },
    { date: '2024-01-12', action: 'Creó alerta', details: 'Estudiante en riesgo - María González' },
    { date: '2024-01-10', action: 'Generó reporte', details: 'Análisis de retención Q4 2023' },
    { date: '2024-01-08', action: 'Intervención completada', details: 'Tutoría académica - Luis Silva' }
  ]

  const activityData = generateActivityData()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.full_name}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  roleColors[user.role]
                )}>
                  {roleLabels[user.role]}
                </span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  statusColors[user.status]
                )}>
                  {statusLabels[user.status]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(user)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datos personales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Información Personal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Teléfono</div>
                      <div className="text-sm text-gray-600">{user.phone}</div>
                    </div>
                  </div>
                )}
                
                {user.department && (
                  <div className="flex items-center space-x-3">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">Departamento</div>
                      <div className="text-sm text-gray-600">{user.department}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">Miembro desde</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado y actividad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Estado y Actividad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {user.status === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : user.status === 'suspended' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">
                      {statusLabels[user.status]}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost">
                    Cambiar Estado
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Último acceso</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    {formatLastLogin(user.last_login)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Última actualización</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-6">
                    {formatDate(user.updated_at)}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(Math.random() * 100) + 50}
                      </div>
                      <div className="text-xs text-gray-500">Sesiones</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.floor(Math.random() * 50) + 20}
                      </div>
                      <div className="text-xs text-gray-500">Acciones</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permisos y roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Permisos y Accesos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.permissions?.map((permission) => (
                  <div 
                    key={permission}
                    className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {permissionLabels[permission as keyof typeof permissionLabels] || permission}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total de permisos: {user.permissions?.length || 0}
                  </span>
                  <Button size="sm" variant="ghost">
                    <Key className="h-4 w-4 mr-2" />
                    Gestionar Permisos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Actividad Reciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityData.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t text-center">
                <Button variant="ghost" size="sm">
                  Ver historial completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acciones administrativas */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Acciones Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">
                  <Key className="h-4 w-4 mr-2" />
                  Resetear Contraseña
                </Button>
                
                <Button variant="secondary" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Notificación
                </Button>
                
                <Button variant="secondary" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                
                <Button variant="secondary" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Ver Log de Auditoría
                </Button>
                
                {user.status === 'active' ? (
                  <Button variant="danger" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Suspender Usuario
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activar Usuario
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}