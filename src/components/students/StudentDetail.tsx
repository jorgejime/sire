import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Target,
  MessageSquare,
  FileText,
  X
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { clsx } from 'clsx'

interface Student {
  id: string
  user_id: string | null
  student_code: string
  career: string
  semester: number | null
  gpa: number | null
  credits_completed: number | null
  credits_enrolled: number | null
  enrollment_date: string
  expected_graduation: string | null
  status: 'active' | 'inactive' | 'graduated' | 'dropped'
  emergency_contact: any
  academic_data: any
  profiles?: {
    full_name: string
    email: string
    phone: string | null
    department?: string
  }
  predictions?: {
    risk_score: number
    risk_level: string
    risk_factors: any
    recommendations: any
  }[]
}

interface StudentDetailProps {
  student: Student
  onClose: () => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function StudentDetail({ student, onClose }: StudentDetailProps) {
  const { isDemo } = useAuth()
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])

  useEffect(() => {
    fetchStudentDetails()
  }, [student.id, isDemo])

  const fetchStudentDetails = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setAlerts(generateMockAlerts())
        setGrades(generateMockGrades())
        setAttendance(generateMockAttendance())
        setInterventions(generateMockInterventions())
        return
      }

      const [alertsData, gradesData, attendanceData, interventionsData] = await Promise.all([
        supabase.from('alerts').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
        supabase.from('grades').select('*').eq('student_id', student.id).order('year', { ascending: false }),
        supabase.from('attendance').select('*').eq('student_id', student.id).order('date', { ascending: false }).limit(30),
        supabase.from('interventions').select('*').eq('student_id', student.id).order('created_at', { ascending: false })
      ])

      setAlerts(alertsData.data || [])
      setGrades(gradesData.data || [])
      setAttendance(attendanceData.data || [])
      setInterventions(interventionsData.data || [])
    } catch (error) {
      console.error('Error fetching student details:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockAlerts = () => [
    {
      id: '1',
      alert_type: 'academic',
      severity: 'medium',
      title: 'Baja asistencia en Cálculo II',
      message: 'Asistencia menor al 70% en las últimas 3 semanas',
      created_at: '2024-01-15T10:30:00Z',
      is_resolved: false
    },
    {
      id: '2', 
      alert_type: 'behavioral',
      severity: 'low',
      title: 'Participación reducida en foros',
      message: 'Menor participación en discusiones online',
      created_at: '2024-01-10T14:20:00Z',
      is_resolved: true
    }
  ]

  const generateMockGrades = () => [
    { course_name: 'Cálculo I', grade: 3.2, credits: 4, semester: '2023-1' },
    { course_name: 'Física I', grade: 3.8, credits: 4, semester: '2023-1' },
    { course_name: 'Química General', grade: 3.0, credits: 3, semester: '2023-1' },
    { course_name: 'Cálculo II', grade: 2.8, credits: 4, semester: '2023-2' },
    { course_name: 'Física II', grade: 3.5, credits: 4, semester: '2023-2' },
    { course_name: 'Programación', grade: 4.0, credits: 3, semester: '2023-2' }
  ]

  const generateMockAttendance = () => 
    Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      present: Math.random() > 0.2,
      course_code: ['MAT101', 'FIS101', 'ING101'][Math.floor(Math.random() * 3)]
    }))

  const generateMockInterventions = () => [
    {
      id: '1',
      intervention_type: 'Tutoría Académica',
      description: 'Sesiones de apoyo en Cálculo II',
      status: 'in_progress',
      created_at: '2024-01-12T09:00:00Z',
      due_date: '2024-02-12T09:00:00Z'
    }
  ]

  const calculateAttendanceRate = () => {
    if (!attendance.length) return 0
    const presentCount = attendance.filter(a => a.present).length
    return Math.round((presentCount / attendance.length) * 100)
  }

  const getGradesTrend = () => {
    return grades.slice(0, 6).reverse().map((grade, index) => ({
      semester: grade.semester,
      gpa: grade.grade
    }))
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'crítico': return 'text-red-600 bg-red-100'
      case 'alto': return 'text-orange-600 bg-orange-100'
      case 'medio': return 'text-yellow-600 bg-yellow-100'
      case 'bajo': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {student.profiles?.full_name}
              </h2>
              <p className="text-sm text-gray-500">
                {student.student_code} • {student.career}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información personal y métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info personal */}
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
                  <span className="text-sm">{student.profiles?.email}</span>
                </div>
                {student.profiles?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{student.profiles.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Ingreso: {formatDate(student.enrollment_date)}
                  </span>
                </div>
                {student.expected_graduation && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Graduación: {formatDate(student.expected_graduation)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    student.status === 'active' ? 'bg-green-100 text-green-800' : 
                    student.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {student.status === 'active' ? 'Activo' :
                     student.status === 'inactive' ? 'Inactivo' : 'Retirado'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Métricas académicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Métricas Académicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {student.gpa?.toFixed(2) || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">GPA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {student.semester || 0}
                    </div>
                    <div className="text-xs text-gray-500">Semestre</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {student.credits_completed || 0}
                    </div>
                    <div className="text-xs text-gray-500">Créditos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {calculateAttendanceRate()}%
                    </div>
                    <div className="text-xs text-gray-500">Asistencia</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de riesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Análisis de Riesgo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.predictions?.length ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {student.predictions[0].risk_score}%
                      </div>
                      <span className={clsx(
                        'px-3 py-1 text-sm font-medium rounded-full',
                        getRiskColor(student.predictions[0].risk_level)
                      )}>
                        Riesgo {student.predictions[0].risk_level}
                      </span>
                    </div>
                    
                    {student.predictions[0].risk_factors && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Factores de riesgo:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {Object.entries(student.predictions[0].risk_factors).map(([factor, value]) => (
                            <li key={factor} className="flex items-center space-x-2">
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                              <span>{factor}: {String(value)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No hay análisis de riesgo disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gráficos y tendencias */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencia de calificaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getGradesTrend()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[1, 4]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución de calificaciones */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={grades.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course_name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Bar 
                      dataKey="grade" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alertas recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alertas Recientes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div 
                      key={alert.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={clsx(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            )}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {alert.alert_type}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(alert.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay alertas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Intervenciones */}
          {interventions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Intervenciones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interventions.map((intervention) => (
                    <div 
                      key={intervention.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={clsx(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              intervention.status === 'completed' ? 'bg-green-100 text-green-800' :
                              intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            )}>
                              {intervention.status}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900">{intervention.intervention_type}</h4>
                          <p className="text-sm text-gray-600 mt-1">{intervention.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar mensaje
                </Button>
                <Button variant="secondary" size="sm">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Crear alerta
                </Button>
                <Button variant="secondary" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar reporte
                </Button>
                <Button variant="secondary" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar cita
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}