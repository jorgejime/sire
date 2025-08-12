import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  MoreHorizontal
} from 'lucide-react'
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
  profiles?: {
    full_name: string
    email: string
    phone: string | null
  }
  predictions?: {
    risk_score: number
    risk_level: string
  }[]
  _alertsCount?: number
}

interface StudentsTableProps {
  onStudentSelect: (student: Student) => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-yellow-100 text-yellow-800',
  graduated: 'bg-blue-100 text-blue-800',
  dropped: 'bg-red-100 text-red-800'
}

const statusLabels = {
  active: 'Activo',
  inactive: 'Inactivo',
  graduated: 'Graduado',
  dropped: 'Retirado'
}

export function StudentsTable({ onStudentSelect }: StudentsTableProps) {
  const { isDemo } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [careerFilter, setCareerFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(10)

  useEffect(() => {
    fetchStudents()
  }, [isDemo])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setStudents(generateMockStudents())
        return
      }

      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          profiles(full_name, email, phone),
          predictions(risk_score)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Obtener conteo de alertas para cada estudiante
      const studentsWithAlerts = await Promise.all(
        (data || []).map(async (student) => {
          const { count } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id)
            .eq('is_resolved', false)

          return {
            ...student,
            _alertsCount: count || 0,
            predictions: student.predictions?.length ? [{
              risk_score: student.predictions[0].risk_score,
              risk_level: getRiskLevel(student.predictions[0].risk_score)
            }] : []
          }
        })
      )

      setStudents(studentsWithAlerts)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockStudents = (): Student[] => {
    const careers = [
      'Ingeniería Civil Industrial',
      'Ingeniería Informática',
      'Ingeniería Comercial',
      'Ingeniería Civil',
      'Ingeniería Electrónica'
    ]

    const names = [
      'María González', 'Carlos Mendoza', 'Ana Rodríguez', 'Luis Silva',
      'Carmen Torres', 'Diego Martínez', 'Sofía López', 'Miguel Castro',
      'Valentina Flores', 'Sebastián Morales', 'Isidora Vargas', 'Matías Rojas',
      'Fernanda Soto', 'Joaquín Herrera', 'Antonia Muñoz', 'Benjamín Pizarro'
    ]

    return names.map((name, index) => ({
      id: `demo-student-${index + 1}`,
      user_id: `demo-user-${index + 1}`,
      student_code: `2019${23456 + index}`,
      career: careers[index % careers.length],
      semester: Math.floor(Math.random() * 10) + 1,
      gpa: Math.round((Math.random() * 2 + 2) * 100) / 100, // 2.0 - 4.0
      credits_completed: Math.floor(Math.random() * 150) + 30,
      credits_enrolled: Math.floor(Math.random() * 25) + 15,
      enrollment_date: `2019-03-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      expected_graduation: '2024-12-15',
      status: ['active', 'active', 'active', 'inactive', 'graduated'][Math.floor(Math.random() * 5)] as any,
      profiles: {
        full_name: name,
        email: `${name.toLowerCase().replace(' ', '.')}@usm.cl`,
        phone: `+569${Math.floor(Math.random() * 90000000) + 10000000}`
      },
      predictions: [{
        risk_score: Math.floor(Math.random() * 100),
        risk_level: ''
      }],
      _alertsCount: Math.floor(Math.random() * 5)
    })).map(student => ({
      ...student,
      predictions: [{
        ...student.predictions![0],
        risk_level: getRiskLevel(student.predictions![0].risk_score)
      }]
    }))
  }

  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'crítico'
    if (score >= 60) return 'alto'
    if (score >= 30) return 'medio'
    return 'bajo'
  }

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'crítico': return 'text-red-600 bg-red-50'
      case 'alto': return 'text-orange-600 bg-orange-50'
      case 'medio': return 'text-yellow-600 bg-yellow-50'
      case 'bajo': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  // Filtros y búsqueda
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.career.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    const matchesCareer = careerFilter === 'all' || student.career === careerFilter
    
    let matchesRisk = true
    if (riskFilter !== 'all' && student.predictions?.length) {
      matchesRisk = student.predictions[0].risk_level === riskFilter
    }

    return matchesSearch && matchesStatus && matchesCareer && matchesRisk
  })

  // Ordenamiento
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal: any, bVal: any

    switch (sortBy) {
      case 'name':
        aVal = a.profiles?.full_name || ''
        bVal = b.profiles?.full_name || ''
        break
      case 'gpa':
        aVal = a.gpa || 0
        bVal = b.gpa || 0
        break
      case 'risk':
        aVal = a.predictions?.[0]?.risk_score || 0
        bVal = b.predictions?.[0]?.risk_score || 0
        break
      case 'semester':
        aVal = a.semester || 0
        bVal = b.semester || 0
        break
      default:
        aVal = a.student_code
        bVal = b.student_code
    }

    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  // Paginación
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + studentsPerPage)

  const uniqueCareers = [...new Set(students.map(s => s.career))]

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
                  placeholder="Buscar por nombre, código o carrera..."
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
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="graduated">Graduados</option>
              <option value="dropped">Retirados</option>
            </select>

            {/* Filtro por carrera */}
            <select
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las carreras</option>
              {uniqueCareers.map(career => (
                <option key={career} value={career}>{career}</option>
              ))}
            </select>

            {/* Filtro por riesgo */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los riesgos</option>
              <option value="crítico">Crítico</option>
              <option value="alto">Alto</option>
              <option value="medio">Medio</option>
              <option value="bajo">Bajo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resumen estadístico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredStudents.length}</div>
              <div className="text-sm text-gray-600">Total filtrado</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredStudents.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredStudents.filter(s => s.predictions?.[0]?.risk_level === 'crítico').length}
              </div>
              <div className="text-sm text-gray-600">Riesgo crítico</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(filteredStudents.reduce((sum, s) => sum + (s.gpa || 0), 0) / filteredStudents.length * 100) / 100}
              </div>
              <div className="text-sm text-gray-600">GPA promedio</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de estudiantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estudiantes ({sortedStudents.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
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
                <option value="gpa-desc">GPA ↓</option>
                <option value="gpa-asc">GPA ↑</option>
                <option value="risk-desc">Riesgo ↓</option>
                <option value="risk-asc">Riesgo ↑</option>
                <option value="semester-desc">Semestre ↓</option>
                <option value="semester-asc">Semestre ↑</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Carrera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Semestre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Riesgo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alertas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onStudentSelect(student)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.profiles?.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.student_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.career}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.semester}º</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">
                          {student.gpa?.toFixed(2)}
                        </span>
                        {student.gpa && student.gpa >= 3.5 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : student.gpa && student.gpa < 2.5 ? (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.predictions?.length ? (
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          getRiskColor(student.predictions[0].risk_level)
                        )}>
                          {student.predictions[0].risk_level} ({student.predictions[0].risk_score}%)
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No evaluado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {(student._alertsCount || 0) > 0 ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-600">
                              {student._alertsCount}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">0</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        statusColors[student.status]
                      )}>
                        {statusLabels[student.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onStudentSelect(student)
                          }}
                        >
                          <Eye className="h-4 w-4" />
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
                  Mostrando {startIndex + 1} a {Math.min(startIndex + studentsPerPage, sortedStudents.length)} de {sortedStudents.length} estudiantes
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