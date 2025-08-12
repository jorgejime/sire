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
  Eye, 
  Edit2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Target,
  MessageSquare,
  TrendingUp,
  Zap
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface Intervention {
  id: string
  student_id: string
  alert_id?: string
  assigned_to: string
  intervention_type: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: number // 1-5, donde 5 es urgente
  due_date: string | null
  completed_at: string | null
  results?: string
  effectiveness_score?: number // 1-5
  created_at: string
  updated_at: string
  student?: {
    student_code: string
    career: string
    profiles?: {
      full_name: string
    }
  }
  assigned_user?: {
    full_name: string
    role: string
  }
}

interface InterventionsTableProps {
  onInterventionSelect: (intervention: Intervention) => void
  onInterventionEdit: (intervention: Intervention) => void
  onCreateIntervention: () => void
}

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso', 
  completed: 'Completada',
  cancelled: 'Cancelada'
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
}

const priorityLabels = {
  1: 'Muy Baja',
  2: 'Baja', 
  3: 'Media',
  4: 'Alta',
  5: 'Crítica'
}

const priorityColors = {
  1: 'bg-gray-100 text-gray-800',
  2: 'bg-blue-100 text-blue-800', 
  3: 'bg-yellow-100 text-yellow-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-red-100 text-red-800'
}

const interventionTypes = [
  'Tutoría Académica',
  'Consejería Personal',
  'Apoyo Financiero',
  'Orientación Vocacional',
  'Seguimiento Psicológico',
  'Taller de Técnicas de Estudio',
  'Mentoring Peer',
  'Apoyo Tecnológico',
  'Intervención Familiar',
  'Plan de Recuperación'
]

export function InterventionsTable({ onInterventionSelect, onInterventionEdit, onCreateIntervention }: InterventionsTableProps) {
  const { profile, isDemo } = useAuth()
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [interventionsPerPage] = useState(12)

  useEffect(() => {
    fetchInterventions()
  }, [isDemo, profile])

  const fetchInterventions = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setInterventions(generateMockInterventions())
        return
      }

      let query = supabase
        .from('interventions')
        .select(`
          *,
          students(
            student_code,
            career,
            profiles(full_name)
          ),
          assigned_user:profiles!assigned_to(full_name, role)
        `)

      // Filtrar por usuario si es consejero (solo sus intervenciones)
      if (profile?.role === 'counselor') {
        query = query.eq('assigned_to', profile.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setInterventions(data || [])
    } catch (error) {
      console.error('Error fetching interventions:', error)
      toast.error('Error al cargar intervenciones')
    } finally {
      setLoading(false)
    }
  }

  const generateMockInterventions = (): Intervention[] => {
    const studentNames = [
      'Carlos Mendoza', 'María González', 'Ana Rodríguez', 'Luis Silva',
      'Carmen Torres', 'Diego Martínez', 'Sofía López', 'Miguel Castro',
      'Valentina Flores', 'Sebastián Morales', 'Isidora Vargas', 'Matías Rojas'
    ]

    const counselors = [
      'Dr. Patricia Vega', 'Psic. Roberto Luna', 'Lic. Andrea Silva', 'Dr. Fernando Ruiz'
    ]

    const careers = [
      'Ingeniería Civil Industrial', 'Ingeniería Informática', 'Ingeniería Comercial', 
      'Ingeniería Civil', 'Ingeniería Electrónica'
    ]

    const descriptions = {
      'Tutoría Académica': 'Sesiones de apoyo en materias específicas para mejorar rendimiento académico',
      'Consejería Personal': 'Apoyo emocional y orientación para manejo de estrés y ansiedad',
      'Apoyo Financiero': 'Orientación sobre becas, financiamiento y apoyo económico estudiantil',
      'Orientación Vocacional': 'Clarificación de objetivos profesionales y plan de carrera',
      'Seguimiento Psicológico': 'Atención especializada para temas de salud mental',
      'Taller de Técnicas de Estudio': 'Desarrollo de habilidades de aprendizaje y organización',
      'Mentoring Peer': 'Acompañamiento por estudiantes de semestres superiores',
      'Apoyo Tecnológico': 'Capacitación en herramientas digitales y plataformas académicas'
    }

    return Array.from({ length: 28 }, (_, index) => {
      const type = interventionTypes[index % interventionTypes.length]
      const status = ['pending', 'in_progress', 'completed', 'cancelled'][Math.floor(Math.random() * 4)] as any
      const priority = Math.floor(Math.random() * 5) + 1
      const studentName = studentNames[index % studentNames.length]
      const counselor = counselors[index % counselors.length]
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      const dueDate = new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)

      return {
        id: `demo-intervention-${index + 1}`,
        student_id: `demo-student-${index % studentNames.length + 1}`,
        alert_id: Math.random() > 0.5 ? `demo-alert-${index + 1}` : undefined,
        assigned_to: `demo-counselor-${index % counselors.length + 1}`,
        intervention_type: type,
        description: descriptions[type as keyof typeof descriptions] || 'Intervención personalizada',
        status,
        priority,
        due_date: status !== 'completed' ? dueDate.toISOString() : null,
        completed_at: status === 'completed' ? new Date(dueDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        results: status === 'completed' ? ['Exitosa - Mejoría notable', 'Parcial - Requiere seguimiento', 'Exitosa - Objetivos cumplidos'][Math.floor(Math.random() * 3)] : undefined,
        effectiveness_score: status === 'completed' ? Math.floor(Math.random() * 3) + 3 : undefined, // 3-5
        created_at: createdDate.toISOString(),
        updated_at: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        student: {
          student_code: `2019${23456 + (index % studentNames.length)}`,
          career: careers[index % careers.length],
          profiles: {
            full_name: studentName
          }
        },
        assigned_user: {
          full_name: counselor,
          role: 'counselor'
        }
      }
    })
  }

  const updateInterventionStatus = async (interventionId: string, newStatus: string) => {
    try {
      if (isDemo) {
        setInterventions(prev => prev.map(i => 
          i.id === interventionId 
            ? { 
                ...i, 
                status: newStatus as any,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null
              }
            : i
        ))
        toast.success('Estado actualizado (demo)')
        return
      }

      const updateData: any = { status: newStatus }
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('interventions')
        .update(updateData)
        .eq('id', interventionId)

      if (error) throw error

      setInterventions(prev => prev.map(i => 
        i.id === interventionId ? { ...i, ...updateData } : i
      ))
      toast.success('Estado de intervención actualizado')
    } catch (error: any) {
      console.error('Error updating intervention status:', error)
      toast.error('Error al actualizar estado')
    }
  }

  // Filtros y búsqueda
  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = 
      intervention.student?.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.intervention_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.student?.student_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || intervention.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || intervention.priority.toString() === priorityFilter
    const matchesType = typeFilter === 'all' || intervention.intervention_type === typeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  // Ordenamiento
  const sortedInterventions = [...filteredInterventions].sort((a, b) => {
    let aVal: any, bVal: any

    switch (sortBy) {
      case 'student':
        aVal = a.student?.profiles?.full_name || ''
        bVal = b.student?.profiles?.full_name || ''
        break
      case 'type':
        aVal = a.intervention_type
        bVal = b.intervention_type
        break
      case 'priority':
        aVal = a.priority
        bVal = b.priority
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      case 'due_date':
        aVal = a.due_date ? new Date(a.due_date).getTime() : 0
        bVal = b.due_date ? new Date(b.due_date).getTime() : 0
        break
      case 'created':
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
        break
      default:
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
    }

    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  // Paginación
  const totalPages = Math.ceil(sortedInterventions.length / interventionsPerPage)
  const startIndex = (currentPage - 1) * interventionsPerPage
  const paginatedInterventions = sortedInterventions.slice(startIndex, startIndex + interventionsPerPage)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDateString?: string | null) => {
    if (!dueDateString) return null
    const dueDate = new Date(dueDateString)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <Zap className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por estudiante, tipo o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>

            {/* Filtro por prioridad */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las prioridades</option>
              <option value="5">Crítica</option>
              <option value="4">Alta</option>
              <option value="3">Media</option>
              <option value="2">Baja</option>
              <option value="1">Muy Baja</option>
            </select>

            {/* Filtro por tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              {interventionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredInterventions.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredInterventions.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredInterventions.filter(i => i.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredInterventions.filter(i => i.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredInterventions.filter(i => i.priority >= 4).length}
              </div>
              <div className="text-sm text-gray-600">Alta Prioridad</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla/Grid de intervenciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Intervenciones ({sortedInterventions.length})</CardTitle>
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
                <option value="created-desc">Más reciente</option>
                <option value="created-asc">Más antiguo</option>
                <option value="priority-desc">Prioridad ↓</option>
                <option value="due_date-asc">Vence pronto</option>
                <option value="student-asc">Estudiante ↑</option>
                <option value="status-asc">Estado</option>
              </select>
              <Button onClick={onCreateIntervention}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Intervención
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
            {paginatedInterventions.map((intervention) => {
              const daysUntilDue = getDaysUntilDue(intervention.due_date)
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0
              const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0

              return (
                <Card 
                  key={intervention.id} 
                  className={clsx(
                    'transition-all hover:shadow-md cursor-pointer border',
                    isOverdue && intervention.status !== 'completed' && 'border-red-300 bg-red-50',
                    isDueSoon && intervention.status !== 'completed' && 'border-orange-300 bg-orange-50'
                  )}
                  onClick={() => onInterventionSelect(intervention)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header con estado y prioridad */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full border flex items-center space-x-1',
                            statusColors[intervention.status]
                          )}>
                            {getStatusIcon(intervention.status)}
                            <span>{statusLabels[intervention.status]}</span>
                          </span>
                        </div>
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          priorityColors[intervention.priority as keyof typeof priorityColors]
                        )}>
                          {priorityLabels[intervention.priority as keyof typeof priorityLabels]}
                        </span>
                      </div>

                      {/* Tipo de intervención */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {intervention.intervention_type}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {intervention.description}
                        </p>
                      </div>

                      {/* Información del estudiante */}
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="font-medium">
                            {intervention.student?.profiles?.full_name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({intervention.student?.student_code})
                          </span>
                        </div>
                      </div>

                      {/* Fecha de vencimiento */}
                      {intervention.due_date && intervention.status !== 'completed' && (
                        <div className={clsx(
                          'flex items-center space-x-2 text-sm',
                          isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-600'
                        )}>
                          <Calendar className="h-4 w-4" />
                          <span>
                            {isOverdue 
                              ? `Vencida hace ${Math.abs(daysUntilDue!)} días`
                              : isDueSoon
                              ? `Vence en ${daysUntilDue} días`
                              : `Vence: ${formatDate(intervention.due_date)}`
                            }
                          </span>
                        </div>
                      )}

                      {/* Fecha de completado */}
                      {intervention.completed_at && (
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completada: {formatDate(intervention.completed_at)}</span>
                        </div>
                      )}

                      {/* Asignado a */}
                      <div className="text-xs text-gray-500">
                        Asignado a: {intervention.assigned_user?.full_name}
                      </div>

                      {/* Acciones rápidas */}
                      <div className="flex items-center space-x-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onInterventionSelect(intervention)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onInterventionEdit(intervention)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        {intervention.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateInterventionStatus(intervention.id, 'in_progress')
                            }}
                          >
                            <Zap className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}

                        {intervention.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateInterventionStatus(intervention.id, 'completed')
                            }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + interventionsPerPage, sortedInterventions.length)} de {sortedInterventions.length} intervenciones
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