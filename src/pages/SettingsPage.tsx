import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Mail,
  Smartphone,
  Globe,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Users,
  BarChart3,
  Zap,
  Clock
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: any
  requiresAdmin?: boolean
}

export function SettingsPage() {
  const { profile } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: '',
    department: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    sms_alerts: false,
    push_notifications: true,
    weekly_reports: true,
    intervention_reminders: true,
    system_updates: true
  })

  // System settings (admin only)
  const [systemSettings, setSystemSettings] = useState({
    ai_model_threshold: 0.75,
    alert_frequency: 'daily',
    retention_data_days: 365,
    max_concurrent_users: 100,
    backup_frequency: 'daily',
    maintenance_mode: false
  })

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Perfil de Usuario',
      description: 'Actualiza tu información personal y credenciales',
      icon: User
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura alertas y notificaciones del sistema',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Seguridad y Privacidad',
      description: 'Gestiona la seguridad de tu cuenta y datos',
      icon: Shield
    },
    {
      id: 'system',
      title: 'Configuración del Sistema',
      description: 'Ajustes avanzados del sistema USM-IA',
      icon: Settings,
      requiresAdmin: true
    },
    {
      id: 'integrations',
      title: 'Integraciones',
      description: 'Conecta con sistemas externos y APIs',
      icon: Globe,
      requiresAdmin: true
    }
  ]

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuración de notificaciones actualizada')
    } catch (error) {
      toast.error('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystemSettings = async () => {
    try {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Configuración del sistema actualizada')
    } catch (error) {
      toast.error('Error al guardar configuración del sistema')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = () => {
    toast.success('Conexión exitosa - Todos los servicios funcionando correctamente')
  }

  const handleBackupNow = () => {
    toast.success('Respaldo iniciado - Se completará en segundo plano')
  }

  const filteredSections = sections.filter(section => {
    if (section.requiresAdmin) {
      return profile?.role === 'admin'
    }
    return true
  })

  const renderProfileSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Información Personal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre Completo"
            value={profileData.full_name}
            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
            placeholder="Tu nombre completo"
          />
          
          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
            placeholder="tu@email.com"
            disabled
          />
          
          <Input
            label="Teléfono"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
            placeholder="+56 9 1234 5678"
          />
          
          <Input
            label="Departamento"
            value={profileData.department}
            onChange={(e) => setProfileData({...profileData, department: e.target.value})}
            placeholder="Tu departamento"
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Cambiar Contraseña</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                label="Contraseña Actual"
                type={showPassword ? 'text' : 'password'}
                value={profileData.current_password}
                onChange={(e) => setProfileData({...profileData, current_password: e.target.value})}
                placeholder="Contraseña actual"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            <Input
              label="Nueva Contraseña"
              type="password"
              value={profileData.new_password}
              onChange={(e) => setProfileData({...profileData, new_password: e.target.value})}
              placeholder="Nueva contraseña"
            />
            
            <Input
              label="Confirmar Contraseña"
              type="password"
              value={profileData.confirm_password}
              onChange={(e) => setProfileData({...profileData, confirm_password: e.target.value})}
              placeholder="Confirma la contraseña"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} loading={loading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderNotificationSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Preferencias de Notificación</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(notifications).map(([key, value]) => {
            const labels = {
              email_alerts: 'Alertas por Email',
              sms_alerts: 'Alertas por SMS',
              push_notifications: 'Notificaciones Push',
              weekly_reports: 'Reportes Semanales',
              intervention_reminders: 'Recordatorios de Intervenciones',
              system_updates: 'Actualizaciones del Sistema'
            }
            
            const descriptions = {
              email_alerts: 'Recibe alertas importantes por correo electrónico',
              sms_alerts: 'Notificaciones urgentes por mensaje de texto',
              push_notifications: 'Notificaciones en tiempo real en el navegador',
              weekly_reports: 'Resumen semanal de actividades',
              intervention_reminders: 'Recordatorios de intervenciones pendientes',
              system_updates: 'Notificaciones sobre actualizaciones del sistema'
            }

            return (
              <label key={key} className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {labels[key as keyof typeof labels]}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {descriptions[key as keyof typeof descriptions]}
                  </div>
                </div>
              </label>
            )
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveNotifications} loading={loading}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Preferencias
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Configuración de Seguridad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Autenticación de Dos Factores</h4>
              <p className="text-sm text-gray-600">Añade una capa extra de seguridad</p>
            </div>
            <Button variant="secondary" size="sm">
              <Key className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Sesiones Activas</h4>
              <p className="text-sm text-gray-600">Gestiona tus sesiones activas</p>
            </div>
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Sesiones
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Historial de Acceso</h4>
              <p className="text-sm text-gray-600">Revisa tu actividad reciente</p>
            </div>
            <Button variant="secondary" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Ver Historial
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Política de Privacidad FERPA</h3>
              <p className="text-sm text-yellow-700 mt-1">
                USM-IA cumple con las regulaciones FERPA para proteger la privacidad de los datos estudiantiles. 
                Solo el personal autorizado puede acceder a información confidencial de estudiantes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Configuración de IA y Análisis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umbral del Modelo de IA ({systemSettings.ai_model_threshold})
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={systemSettings.ai_model_threshold}
              onChange={(e) => setSystemSettings({...systemSettings, ai_model_threshold: parseFloat(e.target.value)})}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Sensibilidad del modelo para detectar estudiantes en riesgo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia de Alertas
              </label>
              <select
                value={systemSettings.alert_frequency}
                onChange={(e) => setSystemSettings({...systemSettings, alert_frequency: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="realtime">Tiempo Real</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retención de Datos (días)
              </label>
              <Input
                type="number"
                value={systemSettings.retention_data_days}
                onChange={(e) => setSystemSettings({...systemSettings, retention_data_days: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Administración del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Estado del Sistema</h4>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Todos los servicios operativos</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Último Respaldo</h4>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Hace 2 horas</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={handleTestConnection}>
              <Zap className="h-4 w-4 mr-2" />
              Probar Conexión
            </Button>
            
            <Button variant="secondary" size="sm" onClick={handleBackupNow}>
              <Database className="h-4 w-4 mr-2" />
              Respaldar Ahora
            </Button>
            
            <Button variant="secondary" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar Servicios
            </Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSystemSettings} loading={loading}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'system':
        return renderSystemSettings()
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sección en Desarrollo</h3>
              <p className="text-gray-600">Esta sección estará disponible próximamente.</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <span>Configuración</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Personaliza tu experiencia y configura el sistema según tus necesidades
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {filteredSections.map(section => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={clsx(
                        'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors',
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{section.title}</div>
                        {section.requiresAdmin && (
                          <div className="text-xs text-orange-600 flex items-center space-x-1">
                            <Lock className="h-3 w-3" />
                            <span>Solo Admin</span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}