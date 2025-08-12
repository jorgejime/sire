import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UsersTable } from '../components/users/UsersTable'
import { UserDetail } from '../components/users/UserDetail'
import { UserForm } from '../components/users/UserForm'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  Users, 
  Plus, 
  Download, 
  Upload,
  Shield,
  UserPlus,
  Settings,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

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

export function UsersPage() {
  const { profile } = useAuth()
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Verificar permisos de administrador
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Restringido
            </h2>
            <p className="text-gray-600">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUserSave = async (userData: any) => {
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingUser) {
        // Lógica para actualizar usuario existente
        console.log('Updating user:', userData)
      } else {
        // Lógica para crear nuevo usuario
        console.log('Creating user:', userData)
      }
    } catch (error) {
      throw error
    }
  }

  const handleCloseModals = () => {
    setSelectedUser(null)
    setEditingUser(null)
    setShowCreateForm(false)
  }

  const handleBulkImport = () => {
    toast.success('Funcionalidad de importación masiva próximamente')
  }

  const handleExportUsers = () => {
    toast.success('Funcionalidad de exportación próximamente')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <span>Gestión de Usuarios</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Administra usuarios del sistema: coordinadores, consejeros y estudiantes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={handleBulkImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Masivo
          </Button>
          
          <Button variant="secondary" size="sm" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-600">Total Usuarios</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">21</div>
                <div className="text-sm text-gray-600">Usuarios Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Staff Académico</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">87%</div>
                <div className="text-sm text-gray-600">Actividad Mensual</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Gestión de Permisos y Seguridad</h3>
              <p className="text-sm text-blue-700 mt-1">
                Cada usuario tiene permisos específicos según su rol. Los coordinadores pueden gestionar estudiantes, 
                los consejeros crear intervenciones, y solo los administradores pueden gestionar usuarios del sistema.
              </p>
              <div className="mt-3 flex items-center space-x-4 text-xs text-blue-600">
                <span>✓ Autenticación segura</span>
                <span>✓ Permisos granulares</span>
                <span>✓ Auditoría completa</span>
                <span>✓ Cumplimiento FERPA</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <UsersTable
        onUserSelect={setSelectedUser}
        onUserEdit={setEditingUser}
        onUserCreate={() => setShowCreateForm(true)}
      />

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={handleCloseModals}
          onEdit={(user) => {
            setSelectedUser(null)
            setEditingUser(user)
          }}
        />
      )}

      {/* User Edit Form */}
      {editingUser && (
        <UserForm
          user={editingUser}
          onClose={handleCloseModals}
          onSave={handleUserSave}
        />
      )}

      {/* User Create Form */}
      {showCreateForm && (
        <UserForm
          user={null}
          onClose={handleCloseModals}
          onSave={handleUserSave}
        />
      )}
    </div>
  )
}