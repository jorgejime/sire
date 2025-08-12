import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { InterventionsTable } from '../components/interventions/InterventionsTable'
import { InterventionDetail } from '../components/interventions/InterventionDetail'
import { InterventionForm } from '../components/interventions/InterventionForm'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

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

export function InterventionsPage() {
  const { profile } = useAuth()
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null)
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>()

  const handleInterventionSave = async (interventionData: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingIntervention) {
        console.log('Updating intervention:', interventionData)
      } else {
        console.log('Creating intervention:', interventionData)
      }
    } catch (error) {
      throw error
    }
  }

  const handleStatusUpdate = async (interventionId: string, newStatus: string) => {
    try {
      console.log(`Updating intervention ${interventionId} to status: ${newStatus}`)
      toast.success('Estado actualizado correctamente')
    } catch (error) {
      toast.error('Error al actualizar el estado')
    }
  }

  const handleCloseModals = () => {
    setSelectedIntervention(null)
    setEditingIntervention(null)
    setShowCreateForm(false)
    setSelectedStudentId(undefined)
  }

  const handleCreateFromStudent = (studentId: string) => {
    setSelectedStudentId(studentId)
    setShowCreateForm(true)
  }

  const handleExportInterventions = () => {
    toast.success('Funcionalidad de exportación próximamente')
  }

  const handleGenerateReport = () => {
    toast.success('Funcionalidad de reportes próximamente')
  }

  const canCreateInterventions = profile?.role === 'admin' || profile?.role === 'coordinator' || profile?.role === 'counselor'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Target className="h-8 w-8 text-blue-600" />
            <span>Intervenciones</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {profile?.role === 'counselor' 
              ? 'Gestiona tus intervenciones asignadas y crea nuevas'
              : 'Sistema integral de intervenciones académicas y de apoyo estudiantil'
            }
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
          
          <Button variant="secondary" size="sm" onClick={handleExportInterventions}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          {canCreateInterventions && (
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Intervención
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">28</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">5</div>
              <div className="text-sm text-gray-600">Alta Prioridad</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Vencidas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">Efectividad Alta</h3>
                <p className="text-sm text-green-700 mt-1">
                  Las tutorías académicas muestran un 89% de efectividad en mejora de calificaciones
                </p>
                <div className="mt-3 text-xs text-green-600">
                  +15% vs mes anterior
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Cobertura Óptima</h3>
                <p className="text-sm text-blue-700 mt-1">
                  67% de estudiantes de riesgo tienen intervenciones activas
                </p>
                <div className="mt-3 text-xs text-blue-600">
                  Meta: 80%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Tiempo Promedio</h3>
                <p className="text-sm text-orange-700 mt-1">
                  14 días promedio de duración por intervención completada
                </p>
                <div className="mt-3 text-xs text-orange-600">
                  -2 días vs mes anterior
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Information */}
      {profile?.role === 'counselor' && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Target className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-purple-900">Panel del Consejero</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Como consejero, puedes ver y gestionar tus intervenciones asignadas, actualizar el progreso 
                  y crear nuevas intervenciones para estudiantes que requieren apoyo especializado.
                </p>
                <div className="mt-3 flex items-center space-x-4 text-xs text-purple-600">
                  <span>✓ Crear intervenciones</span>
                  <span>✓ Actualizar progreso</span>
                  <span>✓ Registrar resultados</span>
                  <span>✓ Generar reportes</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interventions Management */}
      <InterventionsTable
        onInterventionSelect={setSelectedIntervention}
        onInterventionEdit={setEditingIntervention}
        onCreateIntervention={() => setShowCreateForm(true)}
      />

      {/* Intervention Detail Modal */}
      {selectedIntervention && (
        <InterventionDetail
          intervention={selectedIntervention}
          onClose={handleCloseModals}
          onEdit={(intervention) => {
            setSelectedIntervention(null)
            setEditingIntervention(intervention)
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Intervention Edit Form */}
      {editingIntervention && (
        <InterventionForm
          intervention={editingIntervention}
          onClose={handleCloseModals}
          onSave={handleInterventionSave}
        />
      )}

      {/* Intervention Create Form */}
      {showCreateForm && (
        <InterventionForm
          intervention={null}
          onClose={handleCloseModals}
          onSave={handleInterventionSave}
          selectedStudentId={selectedStudentId}
        />
      )}
    </div>
  )
}