import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  GraduationCap,
  BookOpen,
  Calendar,
  Target
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface DashboardStats {
  totalStudents: number
  activeAlerts: number
  highRiskStudents: number
  interventionsActive: number
  retentionRate: number
  gpaAverage: number
}

interface StudentData {
  id: string
  student_code: string
  career: string
  gpa: number | null
  semester: number | null
  risk_score?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeAlerts: 0,
    highRiskStudents: 0,
    interventionsActive: 0,
    retentionRate: 0,
    gpaAverage: 0
  })
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentData[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [profile])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (profile?.role === 'student') {
        await fetchStudentDashboard()
      } else {
        await fetchStaffDashboard()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentDashboard = async () => {
    const { isDemo } = useAuth()
    
    if (isDemo) {
      // Datos mock para estudiante demo
      const mockStudent = {
        id: 'demo-student-1',
        student_code: '201923456',
        career: 'Ingeniería Civil Industrial',
        gpa: 3.1,
        semester: 6,
        status: 'active'
      }
      
      setStats({
        totalStudents: 1,
        activeAlerts: 2,
        highRiskStudents: 0,
        interventionsActive: 0,
        retentionRate: 95,
        gpaAverage: 3.1
      })

      setStudentData([mockStudent])
      return
    }

    // Para estudiantes, mostrar sus propios datos
    const { data: studentData } = await supabase
      .from('students')
      .select('*, predictions(*)')
      .eq('user_id', profile?.id)
      .single()

    if (studentData) {
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*')
        .eq('student_id', studentData.id)
        .eq('is_resolved', false)

      setStats({
        totalStudents: 1,
        activeAlerts: alertsData?.length || 0,
        highRiskStudents: studentData.predictions?.[0]?.risk_score > 70 ? 1 : 0,
        interventionsActive: 0,
        retentionRate: 95,
        gpaAverage: studentData.gpa || 0
      })

      setStudentData([studentData])
    }
  }

  const fetchStaffDashboard = async () => {
    const { isDemo } = useAuth()
    
    if (isDemo) {
      // Datos mock para el demo
      setStats({
        totalStudents: 1247,
        activeAlerts: 23,
        highRiskStudents: 45,
        interventionsActive: 12,
        retentionRate: 87.5,
        gpaAverage: 3.2
      })

      const mockChartData = [
        { career: 'Ing. Civil Industrial', count: 350 },
        { career: 'Ing. Informática', count: 280 },
        { career: 'Ing. Comercial', count: 220 },
        { career: 'Ing. Civil', count: 200 },
        { career: 'Otras Carreras', count: 197 }
      ]
      setChartData(mockChartData)
      return
    }

    // Obtener estadísticas generales
    const [
      { data: studentsData },
      { data: alertsData },
      { data: predictionsData },
      { data: interventionsData }
    ] = await Promise.all([
      supabase.from('students').select('*').eq('status', 'active'),
      supabase.from('alerts').select('*').eq('is_resolved', false),
      supabase.from('predictions').select('*').gt('risk_score', 70),
      supabase.from('interventions').select('*').eq('status', 'in_progress')
    ])

    const gpaAverage = studentsData?.reduce((sum, student) => sum + (student.gpa || 0), 0) / (studentsData?.length || 1)

    setStats({
      totalStudents: studentsData?.length || 0,
      activeAlerts: alertsData?.length || 0,
      highRiskStudents: predictionsData?.length || 0,
      interventionsActive: interventionsData?.length || 0,
      retentionRate: 87.5,
      gpaAverage: Number(gpaAverage.toFixed(2))
    })

    setStudentData(studentsData || [])

    // Datos para gráficos
    const careerData = studentsData?.reduce((acc: any, student) => {
      acc[student.career] = (acc[student.career] || 0) + 1
      return acc
    }, {})

    const chartData = Object.entries(careerData || {}).map(([career, count]) => ({
      career,
      count
    }))

    setChartData(chartData)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (profile?.role === 'student') {
    return <StudentDashboard stats={stats} studentData={studentData[0]} />
  }

  return <StaffDashboard stats={stats} chartData={chartData} />
}

function StudentDashboard({ stats, studentData }: { stats: DashboardStats, studentData?: StudentData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA Actual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gpaAverage}</div>
            <p className="text-xs text-muted-foreground">
              Promedio académico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semestre</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData?.semester || 0}</div>
            <p className="text-xs text-muted-foreground">
              Semestre actual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carrera</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{studentData?.career}</div>
            <p className="text-xs text-muted-foreground">
              Programa académico
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progreso Académico</CardTitle>
          <CardDescription>
            Tu rendimiento y progreso durante el semestre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-8">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Conecta con tu coordinador para ver métricas detalladas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StaffDashboard({ stats, chartData }: { stats: DashboardStats, chartData: any[] }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Riesgo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highRiskStudents}</div>
            <p className="text-xs text-muted-foreground">
              Estudiantes en riesgo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retención</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Tasa de retención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes por Carrera</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ career, count }) => `${career}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { mes: 'Ene', retention: 85 },
                  { mes: 'Feb', retention: 87 },
                  { mes: 'Mar', retention: 86 },
                  { mes: 'Abr', retention: 88 },
                  { mes: 'May', retention: 89 },
                  { mes: 'Jun', retention: 87 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}