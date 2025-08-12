import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  BookOpen,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Filter,
  Search,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface StudentProgress {
  id: string
  student_code: string
  full_name: string
  career: string
  semester: number
  gpa_current: number
  gpa_previous: number
  credits_completed: number
  credits_total: number
  attendance_rate: number
  risk_score: number
  interventions_active: number
  interventions_completed: number
  last_activity: string
  trends: {
    academic: 'improving' | 'stable' | 'declining'
    attendance: 'improving' | 'stable' | 'declining'
    engagement: 'improving' | 'stable' | 'declining'
  }
  milestones: {
    id: string
    title: string
    completed: boolean
    date?: string
  }[]
  recent_activities: {
    type: 'grade' | 'attendance' | 'intervention' | 'milestone'
    description: string
    date: string
    impact: 'positive' | 'neutral' | 'negative'
  }[]
}

export function ProgressPage() {
  const { profile } = useAuth()
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('risk_score')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const mockStudentsProgress: StudentProgress[] = [
    {
      id: '1',
      student_code: '201923456',
      full_name: 'Carlos Mendoza',
      career: 'Ingeniería Civil Industrial',
      semester: 6,
      gpa_current: 3.2,
      gpa_previous: 2.8,
      credits_completed: 120,
      credits_total: 240,
      attendance_rate: 0.78,
      risk_score: 0.75,
      interventions_active: 2,
      interventions_completed: 3,
      last_activity: '2024-01-18T10:30:00',
      trends: {
        academic: 'improving',
        attendance: 'stable',
        engagement: 'improving'
      },
      milestones: [
        { id: '1', title: 'Completar 50% de créditos', completed: true, date: '2023-12-15' },
        { id: '2', title: 'GPA superior a 3.0', completed: true, date: '2024-01-10' },
        { id: '3', title: 'Asistencia superior a 80%', completed: false },
        { id: '4', title: 'Completar práctica profesional', completed: false }
      ],
      recent_activities: [
        { type: 'grade', description: 'Mejoró calificación en Cálculo III', date: '2024-01-18', impact: 'positive' },
        { type: 'intervention', description: 'Completó tutoría académica', date: '2024-01-17', impact: 'positive' },
        { type: 'attendance', description: 'Faltó a 2 clases esta semana', date: '2024-01-15', impact: 'negative' }
      ]
    },
    {
      id: '2',
      student_code: '201923457',
      full_name: 'María González',
      career: 'Ingeniería Informática',
      semester: 8,
      gpa_current: 4.1,
      gpa_previous: 4.0,
      credits_completed: 200,
      credits_total: 250,
      attendance_rate: 0.95,
      risk_score: 0.15,
      interventions_active: 0,
      interventions_completed: 1,
      last_activity: '2024-01-18T14:20:00',
      trends: {
        academic: 'stable',
        attendance: 'stable',
        engagement: 'improving'
      },
      milestones: [
        { id: '1', title: 'Completar 80% de créditos', completed: true, date: '2024-01-05' },
        { id: '2', title: 'GPA superior a 4.0', completed: true, date: '2023-11-20' },
        { id: '3', title: 'Completar tesis', completed: false },
        { id: '4', title: 'Defender tesis', completed: false }
      ],
      recent_activities: [
        { type: 'milestone', description: 'Alcanzó 80% de créditos completados', date: '2024-01-05', impact: 'positive' },
        { type: 'grade', description: 'Excelente calificación en proyecto final', date: '2024-01-03', impact: 'positive' }
      ]
    },
    {
      id: '3',
      student_code: '201923458',
      full_name: 'Ana Rodríguez',
      career: 'Ingeniería Comercial',
      semester: 4,
      gpa_current: 2.3,
      gpa_previous: 2.7,
      credits_completed: 80,
      credits_total: 220,
      attendance_rate: 0.65,
      risk_score: 0.85,
      interventions_active: 3,
      interventions_completed: 2,
      last_activity: '2024-01-17T16:45:00',
      trends: {
        academic: 'declining',
        attendance: 'declining',
        engagement: 'stable'
      },
      milestones: [
        { id: '1', title: 'Completar primer año', completed: true, date: '2021-12-15' },
        { id: '2', title: 'GPA superior a 3.0', completed: false },
        { id: '3', title: 'Asistencia superior a 75%', completed: false }
      ],
      recent_activities: [
        { type: 'intervention', description: 'Inició consejería personal', date: '2024-01-16', impact: 'positive' },
        { type: 'grade', description: 'Calificación baja en Microeconomía', date: '2024-01-14', impact: 'negative' },
        { type: 'attendance', description: 'Bajo rendimiento en asistencia', date: '2024-01-12', impact: 'negative' }
      ]
    }
  ]

  const filteredStudents = mockStudentsProgress.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_code.includes(searchTerm) ||
                         student.career.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRisk = riskFilter === 'all' || 
                       (riskFilter === 'high' && student.risk_score >= 0.7) ||
                       (riskFilter === 'medium' && student.risk_score >= 0.4 && student.risk_score < 0.7) ||
                       (riskFilter === 'low' && student.risk_score < 0.4)
    
    return matchesSearch && matchesRisk
  })

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return { level: 'Alto', color: 'text-red-600 bg-red-100' }
    if (score >= 0.4) return { level: 'Medio', color: 'text-orange-600 bg-orange-100' }
    return { level: 'Bajo', color: 'text-green-600 bg-green-100' }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgressPercentage = (student: StudentProgress) => {
    return Math.round((student.credits_completed / student.credits_total) * 100)
  }

  const handleExportProgress = () => {
    toast.success('Exportando datos de progreso...')
  }

  const handleRefreshData = () => {
    toast.success('Datos actualizados')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span>Progreso Estudiantil</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Seguimiento detallado del progreso académico y desarrollo de competencias
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button variant="secondary" size="sm" onClick={handleExportProgress}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">247</div>
              <div className="text-sm text-gray-600">Estudiantes Activos</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">68%</div>
              <div className="text-sm text-gray-600">En Progreso Normal</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">23%</div>
              <div className="text-sm text-gray-600">Requieren Atención</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">9%</div>
              <div className="text-sm text-gray-600">Alto Riesgo</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3.4</div>
              <div className="text-sm text-gray-600">GPA Promedio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar estudiantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los niveles de riesgo</option>
              <option value="high">Alto riesgo</option>
              <option value="medium">Riesgo medio</option>
              <option value="low">Bajo riesgo</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="risk_score">Ordenar por riesgo</option>
              <option value="gpa_current">Ordenar por GPA</option>
              <option value="full_name">Ordenar por nombre</option>
              <option value="progress">Ordenar por progreso</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Students Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const risk = getRiskLevel(student.risk_score)
          const progressPercentage = getProgressPercentage(student)
          
          return (
            <Card 
              key={student.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                        <p className="text-sm text-gray-600">{student.student_code}</p>
                      </div>
                    </div>
                    <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', risk.color)}>
                      {risk.level}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso Académico</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">GPA</span>
                      </div>
                      <div className="font-semibold">{student.gpa_current}</div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Asistencia</span>
                      </div>
                      <div className="font-semibold">{Math.round(student.attendance_rate * 100)}%</div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Semestre</span>
                      </div>
                      <div className="font-semibold">{student.semester}°</div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Intervenciones</span>
                      </div>
                      <div className="font-semibold">{student.interventions_active}</div>
                    </div>
                  </div>

                  {/* Trends */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">Académico:</span>
                      {getTrendIcon(student.trends.academic)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">Asistencia:</span>
                      {getTrendIcon(student.trends.attendance)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">Participación:</span>
                      {getTrendIcon(student.trends.engagement)}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  {student.recent_activities.length > 0 && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Última actividad:</strong> {student.recent_activities[0].description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Progreso Detallado - {selectedStudent.full_name}
                  </h2>
                  <p className="text-gray-600">{selectedStudent.student_code} • {selectedStudent.career}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedStudent(null)}>
                  ×
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Milestones */}
                <div>
                  <h3 className="font-semibold mb-4">Hitos Académicos</h3>
                  <div className="space-y-3">
                    {selectedStudent.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center space-x-3">
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <span className={milestone.completed ? 'text-gray-900' : 'text-gray-600'}>
                            {milestone.title}
                          </span>
                          {milestone.date && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({new Date(milestone.date).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="font-semibold mb-4">Actividad Reciente</h3>
                  <div className="space-y-3">
                    {selectedStudent.recent_activities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                        <div className={clsx(
                          'p-1 rounded-full',
                          activity.impact === 'positive' ? 'bg-green-100' :
                          activity.impact === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                        )}>
                          <Activity className={clsx(
                            'h-3 w-3',
                            activity.impact === 'positive' ? 'text-green-600' :
                            activity.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}