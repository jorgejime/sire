import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit2,
  X,
  MessageSquare,
  Target,
  TrendingUp,
  FileText,
  Star,
  Zap,
  Award
} from 'lucide-react'
import { clsx } from 'clsx'

interface Intervention {
  id: string
  student_id: string
  alert_id?: string
  assigned_to: string
  intervention_type: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: number
  due_date: string | null
  completed_at: string | null
  results?: string
  effectiveness_score?: number
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

interface InterventionDetailProps {
  intervention: Intervention
  onClose: () => void
  onEdit: (intervention: Intervention) => void
  onStatusUpdate: (id: string, status: string) => void
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

export function InterventionDetail({ intervention, onClose, onEdit, onStatusUpdate }: InterventionDetailProps) {
  const [showNotes, setShowNotes] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getDuration = () => {
    const start = new Date(intervention.created_at)
    const end = intervention.completed_at ? new Date(intervention.completed_at) : new Date()
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const generateTimeline = () => [
    {
      date: intervention.created_at,
      event: 'Intervención creada',
      description: `Se asignó a ${intervention.assigned_user?.full_name}`,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      date: intervention.updated_at,
      event: 'Última actualización',
      description: 'Se modificaron los detalles de la intervención',
      icon: Edit2,
      color: 'text-gray-600'
    },
    ...(intervention.completed_at ? [{
      date: intervention.completed_at,
      event: 'Intervención completada',
      description: intervention.results || 'Sin resultados registrados',
      icon: CheckCircle,
      color: 'text-green-600'
    }] : [])
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />
      case 'in_progress':
        return <Zap className="h-5 w-5" />
      case 'completed':
        return <CheckCircle className="h-5 w-5" />
      case 'cancelled':
        return <XCircle className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getNextActions = () => {
    switch (intervention.status) {
      case 'pending':
        return ['Iniciar intervención', 'Contactar estudiante', 'Programar primera sesión']
      case 'in_progress':
        return ['Registrar progreso', 'Programar seguimiento', 'Evaluar efectividad']
      case 'completed':
        return ['Programar seguimiento', 'Evaluar impacto a largo plazo', 'Compartir mejores prácticas']
      default:
        return []
    }
  }

  const daysUntilDue = getDaysUntilDue(intervention.due_date)
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0
  const timeline = generateTimeline()
  const duration = getDuration()
  const nextActions = getNextActions()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className={clsx(
              'p-2 rounded-lg',
              intervention.status === 'completed' ? 'bg-green-100' :
              intervention.status === 'in_progress' ? 'bg-blue-100' :
              intervention.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
            )}>
              {getStatusIcon(intervention.status)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {intervention.intervention_type}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  statusColors[intervention.status]
                )}>
                  {statusLabels[intervention.status]}
                </span>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  priorityColors[intervention.priority as keyof typeof priorityColors]
                )}>
                  {priorityLabels[intervention.priority as keyof typeof priorityLabels]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(intervention)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detalles de la intervención */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Detalles de la Intervención</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                  <p className="text-gray-700">{intervention.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Duración</h4>
                    <p className="text-sm text-gray-600">{duration} días</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Creada</h4>
                    <p className="text-sm text-gray-600">{formatDate(intervention.created_at)}</p>
                  </div>
                </div>

                {intervention.due_date && (
                  <div className={clsx(
                    'p-3 rounded-lg border',
                    isOverdue ? 'bg-red-50 border-red-200' :
                    isDueSoon ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  )}>
                    <div className="flex items-center space-x-2">
                      <Calendar className={clsx(
                        'h-4 w-4',
                        isOverdue ? 'text-red-600' :
                        isDueSoon ? 'text-orange-600' : 'text-blue-600'
                      )} />
                      <span className={clsx(
                        'font-medium text-sm',
                        isOverdue ? 'text-red-800' :
                        isDueSoon ? 'text-orange-800' : 'text-blue-800'
                      )}>
                        {isOverdue 
                          ? `Vencida hace ${Math.abs(daysUntilDue!)} días`
                          : isDueSoon
                          ? `Vence en ${daysUntilDue} días`
                          : `Vence: ${formatDate(intervention.due_date)}`
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del estudiante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Estudiante</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {intervention.student?.profiles?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {intervention.student?.student_code}
                    </p>
                    <p className="text-sm text-gray-500">
                      {intervention.student?.career}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Asignado a</h4>
                  <p className="text-gray-700">{intervention.assigned_user?.full_name}</p>
                  <p className="text-sm text-gray-500 capitalize">{intervention.assigned_user?.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados y efectividad */}
          {intervention.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Resultados y Efectividad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {intervention.results && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Resultados</h4>
                    <p className="text-gray-700">{intervention.results}</p>
                  </div>
                )}

                {intervention.effectiveness_score && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Puntuación de Efectividad</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={clsx(
                              'h-5 w-5',
                              i < intervention.effectiveness_score!
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {intervention.effectiveness_score}/5
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Completada el</h4>
                  <p className="text-gray-700">{formatDate(intervention.completed_at!)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Línea de tiempo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Línea de Tiempo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={clsx('p-2 rounded-full bg-white border-2', 
                        item.color === 'text-blue-600' ? 'border-blue-200' :
                        item.color === 'text-green-600' ? 'border-green-200' :
                        'border-gray-200'
                      )}>
                        <Icon className={clsx('h-4 w-4', item.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{item.event}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Próximas acciones */}
          {nextActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Próximas Acciones Sugeridas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {nextActions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {intervention.status === 'pending' && (
                  <Button 
                    onClick={() => onStatusUpdate(intervention.id, 'in_progress')}
                    className="flex items-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Iniciar Intervención</span>
                  </Button>
                )}

                {intervention.status === 'in_progress' && (
                  <Button 
                    onClick={() => onStatusUpdate(intervention.id, 'completed')}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Marcar como Completada</span>
                  </Button>
                )}

                <Button variant="secondary">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar Estudiante
                </Button>

                <Button variant="secondary">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>

                <Button variant="secondary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar Seguimiento
                </Button>

                {intervention.status !== 'cancelled' && (
                  <Button 
                    variant="danger"
                    onClick={() => onStatusUpdate(intervention.id, 'cancelled')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Intervención
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