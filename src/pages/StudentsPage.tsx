import { useState } from 'react'
import { StudentsTable } from '../components/students/StudentsTable'
import { StudentDetail } from '../components/students/StudentDetail'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  GraduationCap, 
  Plus, 
  Download, 
  Upload,
  Filter,
  BarChart3
} from 'lucide-react'

export function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span>Gestión de Estudiantes</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Administra y supervisa el progreso académico de todos los estudiantes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">1,247</div>
                <div className="text-sm text-gray-600">Total Estudiantes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">87.2%</div>
                <div className="text-sm text-gray-600">Tasa Retención</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Filter className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">45</div>
                <div className="text-sm text-gray-600">Alto Riesgo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3.21</div>
                <div className="text-sm text-gray-600">GPA Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <StudentsTable onStudentSelect={setSelectedStudent} />

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  )
}