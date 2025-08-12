import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  X,
  Save,
  CheckCircle
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

interface UserFormProps {
  user?: UserProfile | null // null para crear, UserProfile para editar
  onClose: () => void
  onSave: (userData: any) => void
}

const userSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.enum(['student', 'coordinator', 'admin', 'counselor']),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  permissions: z.array(z.string()).optional()
})

type UserFormData = z.infer<typeof userSchema>

const roleOptions = [
  { value: 'student', label: 'Estudiante', description: 'Acceso básico a recursos estudiantiles' },
  { value: 'coordinator', label: 'Coordinador', description: 'Gestiona estudiantes y ve análisis' },
  { value: 'counselor', label: 'Consejero', description: 'Crea intervenciones y accede al chat' },
  { value: 'admin', label: 'Administrador', description: 'Control total del sistema' }
]

const departmentOptions = [
  'Ingeniería',
  'Ciencias',
  'Administración', 
  'Servicios Estudiantiles',
  'Rectoría',
  'Vicerrectoría Académica',
  'Dirección de Asuntos Estudiantiles'
]

const allPermissions = {
  manage_users: 'Gestionar usuarios del sistema',
  manage_students: 'Gestionar estudiantes', 
  view_analytics: 'Ver análisis y métricas',
  manage_settings: 'Configurar sistema',
  export_data: 'Exportar datos',
  create_alerts: 'Crear alertas',
  manage_interventions: 'Gestionar intervenciones',
  view_students: 'Ver información de estudiantes',
  create_interventions: 'Crear intervenciones',
  access_chat: 'Acceso al sistema de chat',
  view_own_data: 'Ver datos propios',
  view_resources: 'Acceder a recursos'
}

const roleDefaultPermissions = {
  admin: ['manage_users', 'manage_students', 'view_analytics', 'manage_settings', 'export_data'],
  coordinator: ['manage_students', 'view_analytics', 'create_alerts', 'manage_interventions'],
  counselor: ['view_students', 'create_interventions', 'access_chat', 'create_alerts'],
  student: ['view_own_data', 'access_chat', 'view_resources']
}

export function UserForm({ user, onClose, onSave }: UserFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const isEditing = !!user

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
      status: user.status,
      permissions: user.permissions || []
    } : {
      full_name: '',
      email: '',
      phone: '',
      role: 'student',
      department: '',
      status: 'active',
      permissions: []
    }
  })

  const watchedRole = watch('role')

  useEffect(() => {
    // Actualizar permisos cuando cambia el rol
    if (!isEditing || selectedPermissions.length === 0) {
      const defaultPerms = roleDefaultPermissions[watchedRole as keyof typeof roleDefaultPermissions] || []
      setSelectedPermissions(defaultPerms)
      setValue('permissions', defaultPerms)
    }
  }, [watchedRole, isEditing, setValue])

  useEffect(() => {
    if (user?.permissions) {
      setSelectedPermissions(user.permissions)
    }
  }, [user])

  const handlePermissionToggle = (permission: string) => {
    const newPermissions = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission]
    
    setSelectedPermissions(newPermissions)
    setValue('permissions', newPermissions, { shouldDirty: true })
  }

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true)
      
      const userData = {
        ...data,
        permissions: selectedPermissions,
        phone: data.phone || null,
        department: data.department || null
      }

      await onSave(userData)
      toast.success(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente')
      onClose()
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Error al guardar usuario')
    } finally {
      setLoading(false)
    }
  }

  const getAvailablePermissions = () => {
    const role = watchedRole as keyof typeof roleDefaultPermissions
    const basePermissions = roleDefaultPermissions[role] || []
    
    return Object.entries(allPermissions).filter(([key]) => {
      // Mostrar permisos base del rol + permisos adicionales seleccionados
      return basePermissions.includes(key) || selectedPermissions.includes(key)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Actualiza la información del usuario' : 'Completa los datos para crear un nuevo usuario'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  {...register('full_name')}
                  label="Nombre Completo"
                  placeholder="Ej: Dr. Carlos Mendoza"
                  error={errors.full_name?.message}
                  required
                />

                <Input
                  {...register('email')}
                  type="email"
                  label="Email"
                  placeholder="usuario@usm.cl"
                  error={errors.email?.message}
                  required
                  disabled={isEditing} // No permitir cambiar email en edición
                />

                <Input
                  {...register('phone')}
                  type="tel"
                  label="Teléfono"
                  placeholder="+56 9 1234 5678"
                  error={errors.phone?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    {...register('department')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar departamento...</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rol y estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Rol y Estado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selección de rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rol del Usuario
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map(option => (
                      <label
                        key={option.value}
                        className={clsx(
                          'flex items-start p-3 border rounded-lg cursor-pointer transition-all',
                          watchedRole === option.value
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <input
                          {...register('role')}
                          type="radio"
                          value={option.value}
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estado
                  </label>
                  <select
                    {...register('status')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <strong>Activo:</strong> Usuario puede acceder normalmente<br/>
                      <strong>Inactivo:</strong> Usuario sin acceso temporal<br/>
                      <strong>Suspendido:</strong> Usuario bloqueado permanentemente
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permisos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Permisos de Acceso</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getAvailablePermissions().map(([key, label]) => (
                  <label
                    key={key}
                    className={clsx(
                      'flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all',
                      selectedPermissions.includes(key)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(key)}
                      onChange={() => handlePermissionToggle(key)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {label}
                      </div>
                    </div>
                    {selectedPermissions.includes(key) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Permisos seleccionados:</strong> {selectedPermissions.length}
                  <br />
                  Los permisos se asignan automáticamente según el rol, pero puedes personalizar según sea necesario.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {isDirty && '* Hay cambios sin guardar'}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                loading={loading}
                disabled={!isDirty && isEditing}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading 
                  ? (isEditing ? 'Actualizando...' : 'Creando...') 
                  : (isEditing ? 'Actualizar Usuario' : 'Crear Usuario')
                }
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}