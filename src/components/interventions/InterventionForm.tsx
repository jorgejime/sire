import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Target, 
  User, 
  Calendar, 
  AlertTriangle, 
  X,
  Save,
  Search,
  Users,
  Clock,
  FileText
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
  priority: number
  due_date: string | null
  completed_at: string | null
  results?: string
  effectiveness_score?: number
  created_at: string
  updated_at: string
}

interface Student {
  id: string
  student_code: string
  career: string
  profiles?: {
    full_name: string
  }
}

interface InterventionFormProps {
  intervention?: Intervention | null
  onClose: () => void
  onSave: (interventionData: any) => void
  selectedStudentId?: string
}

const interventionSchema = z.object({
  student_id: z.string().min(1, 'Debe seleccionar un estudiante'),
  intervention_type: z.string().min(1, 'Debe seleccionar el tipo de intervención'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  priority: z.number().min(1).max(5),
  due_date: z.string().optional(),
  assigned_to: z.string().min(1, 'Debe asignar la intervención a alguien')
})

type InterventionFormData = z.infer<typeof interventionSchema>

const interventionTypes = [
  { value: 'Tutoría Académica', label: 'Tutoría Académica', description: 'Apoyo específico en materias con bajo rendimiento' },
  { value: 'Consejería Personal', label: 'Consejería Personal', description: 'Apoyo emocional y orientación personal' },
  { value: 'Apoyo Financiero', label: 'Apoyo Financiero', description: 'Orientación sobre becas y apoyo económico' },
  { value: 'Orientación Vocacional', label: 'Orientación Vocacional', description: 'Clarificación de objetivos profesionales' },
  { value: 'Seguimiento Psicológico', label: 'Seguimiento Psicológico', description: 'Atención de salud mental especializada' },
  { value: 'Taller de Técnicas de Estudio', label: 'Taller de Técnicas de Estudio', description: 'Desarrollo de habilidades de aprendizaje' },
  { value: 'Mentoring Peer', label: 'Mentoring Peer', description: 'Acompañamiento por estudiantes senior' },
  { value: 'Apoyo Tecnológico', label: 'Apoyo Tecnológico', description: 'Capacitación en herramientas digitales' },
  { value: 'Intervención Familiar', label: 'Intervención Familiar', description: 'Trabajo con el entorno familiar' },
  { value: 'Plan de Recuperación', label: 'Plan de Recuperación', description: 'Plan estructurado de mejora académica' }
]

const priorityOptions = [
  { value: 1, label: 'Muy Baja', color: 'text-gray-600' },
  { value: 2, label: 'Baja', color: 'text-blue-600' },
  { value: 3, label: 'Media', color: 'text-yellow-600' },
  { value: 4, label: 'Alta', color: 'text-orange-600' },
  { value: 5, label: 'Crítica', color: 'text-red-600' }
]

export function InterventionForm({ intervention, onClose, onSave, selectedStudentId }: InterventionFormProps) {
  const { profile, isDemo } = useAuth()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [counselors, setCounselors] = useState<any[]>([])
  const [searchStudent, setSearchStudent] = useState('')
  const [showStudentSearch, setShowStudentSearch] = useState(false)
  const isEditing = !!intervention

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: intervention ? {
      student_id: intervention.student_id,
      intervention_type: intervention.intervention_type,
      description: intervention.description,
      priority: intervention.priority,
      due_date: intervention.due_date ? intervention.due_date.split('T')[0] : '',
      assigned_to: intervention.assigned_to
    } : {
      student_id: selectedStudentId || '',
      intervention_type: '',
      description: '',
      priority: 3,
      due_date: '',
      assigned_to: profile?.id || ''
    }
  })

  const watchedStudentId = watch('student_id')
  const watchedType = watch('intervention_type')

  useEffect(() => {
    fetchStudents()
    fetchCounselors()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      setValue('student_id', selectedStudentId)
    }
  }, [selectedStudentId, setValue])

  const fetchStudents = async () => {
    try {
      if (isDemo) {
        setStudents(generateMockStudents())
        return
      }

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_code,
          career,
          profiles(full_name)
        `)
        .order('student_code')

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchCounselors = async () => {
    try {
      if (isDemo) {
        setCounselors([
          { id: 'demo-counselor-1', full_name: 'Dr. Patricia Vega', role: 'counselor' },
          { id: 'demo-counselor-2', full_name: 'Psic. Roberto Luna', role: 'counselor' },
          { id: 'demo-counselor-3', full_name: 'Lic. Andrea Silva', role: 'coordinator' },
          { id: 'demo-counselor-4', full_name: 'Dr. Fernando Ruiz', role: 'counselor' }
        ])
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['counselor', 'coordinator', 'admin'])
        .order('full_name')

      if (error) throw error
      setCounselors(data || [])
    } catch (error) {
      console.error('Error fetching counselors:', error)
    }
  }

  const generateMockStudents = (): Student[] => {
    const names = [
      'Carlos Mendoza', 'María González', 'Ana Rodríguez', 'Luis Silva',
      'Carmen Torres', 'Diego Martínez', 'Sofía López', 'Miguel Castro',
      'Valentina Flores', 'Sebastián Morales', 'Isidora Vargas', 'Matías Rojas'
    ]
    
    const careers = [
      'Ingeniería Civil Industrial', 'Ingeniería Informática', 'Ingeniería Comercial',
      'Ingeniería Civil', 'Ingeniería Electrónica'
    ]

    return names.map((name, index) => ({
      id: `demo-student-${index + 1}`,
      student_code: `2019${23456 + index}`,
      career: careers[index % careers.length],
      profiles: {
        full_name: name
      }
    }))
  }

  const getSelectedStudent = () => {
    return students.find(s => s.id === watchedStudentId)
  }

  const getTypeDescription = () => {
    const type = interventionTypes.find(t => t.value === watchedType)
    return type?.description || ''
  }

  const filteredStudents = students.filter(student =>
    student.profiles?.full_name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.student_code.toLowerCase().includes(searchStudent.toLowerCase()) ||
    student.career.toLowerCase().includes(searchStudent.toLowerCase())
  )

  const onSubmit = async (data: InterventionFormData) => {
    try {
      setLoading(true)
      
      const interventionData = {
        ...data,
        due_date: data.due_date || null,
        status: 'pending' as const
      }

      await onSave(interventionData)
      toast.success(isEditing ? 'Intervención actualizada exitosamente' : 'Intervención creada exitosamente')
      onClose()
    } catch (error: any) {
      console.error('Error saving intervention:', error)
      toast.error(error.message || 'Error al guardar intervención')
    } finally {
      setLoading(false)
    }
  }

  const selectedStudent = getSelectedStudent()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Editar Intervención' : 'Nueva Intervención'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Actualiza los detalles de la intervención' : 'Completa los datos para crear una nueva intervención'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Selección de estudiante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Estudiante</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStudent ? (
                <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedStudent.profiles?.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedStudent.student_code} • {selectedStudent.career}
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowStudentSearch(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Cambiar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowStudentSearch(true)}
                  className="w-full p-4 border-dashed border-2"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Seleccionar Estudiante
                </Button>
              )}

              {errors.student_id && (
                <p className="text-sm text-red-600">{errors.student_id.message}</p>
              )}

              {/* Modal de búsqueda de estudiantes */}
              {showStudentSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Seleccionar Estudiante</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowStudentSearch(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Buscar por nombre, código o carrera..."
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-96 p-4 space-y-2">
                      {filteredStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => {
                            setValue('student_id', student.id, { shouldDirty: true })
                            setShowStudentSearch(false)
                          }}
                          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border"
                        >
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {student.profiles?.full_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {student.student_code} • {student.career}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tipo de intervención */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Tipo de Intervención</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecciona el tipo de intervención
                </label>
                <select
                  {...register('intervention_type')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo...</option>
                  {interventionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.intervention_type && (
                  <p className="text-sm text-red-600 mt-1">{errors.intervention_type.message}</p>
                )}
              </div>

              {getTypeDescription() && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{getTypeDescription()}</p>
                </div>
              )}

              <div>
                <Input
                  {...register('description')}
                  label="Descripción"
                  placeholder="Describe los objetivos específicos y metodología de la intervención..."
                  error={errors.description?.message}
                  multiline
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Configuración</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    {...register('priority', { valueAsNumber: true })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value} - {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha de vencimiento */}
                <div>
                  <Input
                    {...register('due_date')}
                    type="date"
                    label="Fecha de Vencimiento"
                    error={errors.due_date?.message}
                  />
                </div>
              </div>

              {/* Asignación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar a
                </label>
                <select
                  {...register('assigned_to')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar responsable...</option>
                  {counselors.map(counselor => (
                    <option key={counselor.id} value={counselor.id}>
                      {counselor.full_name} ({counselor.role})
                    </option>
                  ))}
                </select>
                {errors.assigned_to && (
                  <p className="text-sm text-red-600 mt-1">{errors.assigned_to.message}</p>
                )}
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
                  : (isEditing ? 'Actualizar Intervención' : 'Crear Intervención')
                }
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}