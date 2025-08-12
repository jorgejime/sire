import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface Alert {
  id: string
  student_id: string
  alert_type: 'academic' | 'attendance' | 'behavioral' | 'financial' | 'technical'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  is_resolved: boolean
  resolved_by: string | null
  resolved_at: string | null
  due_date: string | null
  metadata: any
  created_at: string
  updated_at: string
  students?: {
    student_code: string
    career: string
    profiles?: {
      full_name: string
    }
  }
}

const alertTypeLabels = {
  academic: 'Académico',
  attendance: 'Asistencia',
  behavioral: 'Comportamental',
  financial: 'Financiero',
  technical: 'Técnico'
}

const severityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

const severityLabels = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico'
}

export function AlertsList() {
  const { profile, user } = useAuth()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    fetchAlerts()
    subscribeToAlerts()
  }, [profile, filter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('alerts')
        .select(`
          *,
          students(
            student_code,
            career,
            profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false })

      // Filtrar por usuario si es estudiante
      if (profile?.role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user?.id)
          .single()

        if (studentData) {
          query = query.eq('student_id', studentData.id)
        }
      }

      // Aplicar filtros
      if (filter === 'unresolved') {
        query = query.eq('is_resolved', false)
      } else if (filter === 'resolved') {
        query = query.eq('is_resolved', true)
      }

      const { data, error } = await query

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Error al cargar las alertas')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToAlerts = () => {
    const subscription = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('Alert change:', payload)
          fetchAlerts() // Recargar alertas cuando hay cambios
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({
          is_resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error
      
      toast.success('Alerta resuelta')
      fetchAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('Error al resolver la alerta')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {profile?.role === 'student' ? 'Mis Alertas' : 'Alertas del Sistema'}
          </h2>
          <p className="text-gray-600">
            {profile?.role === 'student' 
              ? 'Notificaciones y alertas sobre tu progreso académico'
              : 'Gestiona las alertas de estudiantes en riesgo'
            }
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas</option>
            <option value="unresolved">Pendientes</option>
            <option value="resolved">Resueltas</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay alertas
            </h3>
            <p className="text-gray-600">
              {filter === 'unresolved' 
                ? 'No tienes alertas pendientes en este momento.'
                : 'No se encontraron alertas con los filtros seleccionados.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={clsx(
                'transition-all hover:shadow-md cursor-pointer',
                alert.is_resolved && 'opacity-75',
                alert.severity === 'critical' && !alert.is_resolved && 'border-red-300 bg-red-50'
              )}
              onClick={() => setSelectedAlert(alert)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={clsx(
                        'px-2 py-1 rounded-full text-xs font-medium border',
                        severityColors[alert.severity]
                      )}>
                        {severityLabels[alert.severity]}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {alertTypeLabels[alert.alert_type]}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {alert.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.is_resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {alert.message}
                </p>

                {/* Student Info (for staff) */}
                {profile?.role !== 'student' && alert.students && (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="text-sm">
                      <span className="font-medium">
                        {alert.students.profiles?.full_name || 'Estudiante'}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({alert.students.student_code})
                      </span>
                      <div className="text-xs text-gray-500">
                        {alert.students.career}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {alert.metadata?.risk_score && (
                  <div className="p-2 bg-blue-50 rounded-md">
                    <div className="text-xs text-blue-700">
                      Puntuación de riesgo: {alert.metadata.risk_score}%
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(alert.created_at)}</span>
                  </div>
                  {alert.due_date && !alert.is_resolved && (
                    <div className="text-orange-600">
                      Vence: {formatDate(alert.due_date)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {profile?.role !== 'student' && !alert.is_resolved && (
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        resolveAlert(alert.id)
                      }}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolver
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedAlert(alert)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedAlert.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium border',
                      severityColors[selectedAlert.severity]
                    )}>
                      {severityLabels[selectedAlert.severity]}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {alertTypeLabels[selectedAlert.alert_type]}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedAlert(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-gray-700">{selectedAlert.message}</p>
              </div>

              {selectedAlert.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Información adicional</h4>
                  <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Creada:</span>
                  <br />
                  {formatDate(selectedAlert.created_at)}
                </div>
                {selectedAlert.due_date && (
                  <div>
                    <span className="font-medium">Fecha límite:</span>
                    <br />
                    {formatDate(selectedAlert.due_date)}
                  </div>
                )}
              </div>

              {selectedAlert.is_resolved && selectedAlert.resolved_at && (
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Resuelta</span>
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    {formatDate(selectedAlert.resolved_at)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}