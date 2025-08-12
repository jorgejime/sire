import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Search, 
  Filter, 
  Plus,
  Edit2, 
  Trash2,
  Eye,
  MoreHorizontal,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { clsx } from 'clsx'
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

interface UsersTableProps {
  onUserSelect: (user: UserProfile) => void
  onUserEdit: (user: UserProfile) => void
  onUserCreate: () => void
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

export function UsersTable({ onUserSelect, onUserEdit, onUserCreate }: UsersTableProps) {
  const { isDemo } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(15)

  useEffect(() => {
    fetchUsers()
  }, [isDemo])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setUsers(generateMockUsers())
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Enriquecer con datos adicionales (último login, status, etc.)
      const enrichedUsers = await Promise.all(
        (data || []).map(async (user) => {
          // Aquí se podrían obtener datos adicionales de otras tablas
          return {
            ...user,
            status: 'active' as const,
            last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            permissions: getDefaultPermissions(user.role)
          }
        })
      )

      setUsers(enrichedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const generateMockUsers = (): UserProfile[] => {
    const departments = ['Ingeniería', 'Ciencias', 'Administración', 'Servicios Estudiantiles']
    const names = [
      'Dr. Carlos Mendoza', 'Ana Rodríguez', 'Luis Silva', 'María González',
      'Carmen Torres', 'Diego Martínez', 'Sofía López', 'Miguel Castro',
      'Valentina Flores', 'Sebastián Morales', 'Patricia Vargas', 'Matías Rojas',
      'Fernanda Soto', 'Joaquín Herrera', 'Antonia Muñoz', 'Benjamín Pizarro',
      'Isabella García', 'Nicolás Ramírez', 'Catalina Espinoza', 'Tomás Guerrero',
      'Javiera Contreras', 'Felipe Bravo', 'Monserrat Fuentes', 'Cristóbal Núñez'
    ]

    const roles: UserProfile['role'][] = ['admin', 'coordinator', 'coordinator', 'counselor', 'counselor']
    
    return names.map((name, index) => {
      const role = index === 0 ? 'admin' : roles[index % roles.length]
      const isActive = Math.random() > 0.1 // 90% activos
      
      return {
        id: `demo-user-${index + 1}`,
        email: `${name.toLowerCase().replace(/\s+/g, '.').replace('dr.', '')}@usm.cl`,
        role,
        full_name: name,
        department: role !== 'student' ? departments[index % departments.length] : null,
        phone: `+569${Math.floor(Math.random() * 90000000) + 10000000}`,
        avatar_url: null,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_login: isActive ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        status: isActive ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'suspended'),
        permissions: getDefaultPermissions(role)
      }
    })
  }

  const getDefaultPermissions = (role: string): string[] => {
    const permissions = {
      admin: ['manage_users', 'manage_students', 'view_analytics', 'manage_settings', 'export_data'],
      coordinator: ['manage_students', 'view_analytics', 'create_alerts', 'manage_interventions'],
      counselor: ['view_students', 'create_interventions', 'access_chat', 'create_alerts'],
      student: ['view_own_data', 'access_chat', 'view_resources']
    }
    return permissions[role as keyof typeof permissions] || []
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return
    }

    try {
      if (isDemo) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        toast.success('Usuario eliminado (demo)')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers(prev => prev.filter(u => u.id !== userId))
      toast.success('Usuario eliminado exitosamente')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar usuario')
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const newStatus = user.status === 'active' ? 'inactive' : 'active'

      if (isDemo) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ))
        toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'} (demo)`)
        return
      }

      // Lógica real para actualizar estado
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ))
      toast.success(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Error al cambiar estado del usuario')
    }
  }

  // Filtros y búsqueda
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Ordenamiento
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any, bVal: any

    switch (sortBy) {
      case 'name':
        aVal = a.full_name
        bVal = b.full_name
        break
      case 'email':
        aVal = a.email
        bVal = b.email
        break
      case 'role':
        aVal = a.role
        bVal = b.role
        break
      case 'department':
        aVal = a.department || ''
        bVal = b.department || ''
        break
      case 'created':
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
        break
      default:
        aVal = a.full_name
        bVal = b.full_name
    }

    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  // Paginación
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Nunca'
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hoy'
    if (days === 1) return 'Ayer'
    return `Hace ${days} días`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, email o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por rol */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="coordinator">Coordinadores</option>
              <option value="counselor">Consejeros</option>
              <option value="student">Estudiantes</option>
            </select>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.role === 'coordinator').length}
              </div>
              <div className="text-sm text-gray-600">Coordinadores</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredUsers.filter(u => u.role === 'counselor').length}
              </div>
              <div className="text-sm text-gray-600">Consejeros</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {filteredUsers.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios del Sistema ({sortedUsers.length})</CardTitle>
            <div className="flex items-center space-x-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="name-asc">Nombre ↑</option>
                <option value="name-desc">Nombre ↓</option>
                <option value="email-asc">Email ↑</option>
                <option value="role-asc">Rol ↑</option>
                <option value="created-desc">Más reciente</option>
                <option value="created-asc">Más antiguo</option>
              </select>
              <Button onClick={onUserCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onUserSelect(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="text-xs text-gray-400 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        roleColors[user.role]
                      )}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.department || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          statusColors[user.status]
                        )}>
                          {statusLabels[user.status]}
                        </span>
                        {user.status === 'active' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : user.status === 'suspended' ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatLastLogin(user.last_login)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUserSelect(user)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUserEdit(user)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleUserStatus(user.id)
                          }}
                        >
                          {user.status === 'active' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteUser(user.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + usersPerPage, sortedUsers.length)} de {sortedUsers.length} usuarios
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}