import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  FileBarChart,
  Clock,
  CheckCircle,
  Mail,
  Printer,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'academic' | 'interventions' | 'analytics' | 'administrative'
  icon: any
  frequency: 'weekly' | 'monthly' | 'semester' | 'annual' | 'on-demand'
  lastGenerated?: string
  size: string
  format: 'PDF' | 'Excel' | 'CSV'
}

export function ReportsPage() {
  const { profile } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'student-retention-summary',
      name: 'Resumen de Retención Estudiantil',
      description: 'Análisis completo de tasas de retención, deserción y factores de riesgo por programa académico',
      category: 'academic',
      icon: TrendingUp,
      frequency: 'monthly',
      lastGenerated: '2024-01-15',
      size: '2.3 MB',
      format: 'PDF'
    },
    {
      id: 'interventions-effectiveness',
      name: 'Efectividad de Intervenciones',
      description: 'Evaluación del impacto de las intervenciones en el rendimiento académico y bienestar estudiantil',
      category: 'interventions',
      icon: Target,
      frequency: 'monthly',
      lastGenerated: '2024-01-10',
      size: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 'risk-prediction-analysis',
      name: 'Análisis de Predicción de Riesgo',
      description: 'Modelo predictivo de estudiantes en riesgo académico con recomendaciones de intervención',
      category: 'analytics',
      icon: AlertTriangle,
      frequency: 'weekly',
      lastGenerated: '2024-01-18',
      size: '3.1 MB',
      format: 'Excel'
    },
    {
      id: 'demographic-trends',
      name: 'Tendencias Demográficas',
      description: 'Análisis de patrones demográficos y su correlación con el rendimiento académico',
      category: 'analytics',
      icon: Users,
      frequency: 'semester',
      lastGenerated: '2024-01-01',
      size: '4.2 MB',
      format: 'PDF'
    },
    {
      id: 'counseling-workload',
      name: 'Carga de Trabajo de Consejería',
      description: 'Distribución de casos por consejero, tiempos de respuesta y eficiencia operativa',
      category: 'administrative',
      icon: Users,
      frequency: 'monthly',
      lastGenerated: '2024-01-12',
      size: '1.5 MB',
      format: 'Excel'
    },
    {
      id: 'academic-performance-trends',
      name: 'Tendencias de Rendimiento Académico',
      description: 'Evolución del rendimiento académico por cohorte, carrera y período académico',
      category: 'academic',
      icon: BarChart3,
      frequency: 'semester',
      lastGenerated: '2024-01-05',
      size: '2.8 MB',
      format: 'PDF'
    },
    {
      id: 'alert-system-performance',
      name: 'Rendimiento del Sistema de Alertas',
      description: 'Efectividad de las alertas automáticas, falsos positivos y tiempo de respuesta',
      category: 'analytics',
      icon: AlertTriangle,
      frequency: 'monthly',
      lastGenerated: '2024-01-14',
      size: '1.2 MB',
      format: 'CSV'
    },
    {
      id: 'financial-aid-impact',
      name: 'Impacto de Ayuda Financiera',
      description: 'Correlación entre ayuda financiera y retención estudiantil, análisis de ROI',
      category: 'administrative',
      icon: TrendingUp,
      frequency: 'annual',
      lastGenerated: '2023-12-20',
      size: '3.5 MB',
      format: 'PDF'
    }
  ]

  const categories = [
    { value: 'all', label: 'Todos los Reportes', count: reportTemplates.length },
    { value: 'academic', label: 'Académico', count: reportTemplates.filter(r => r.category === 'academic').length },
    { value: 'interventions', label: 'Intervenciones', count: reportTemplates.filter(r => r.category === 'interventions').length },
    { value: 'analytics', label: 'Análisis', count: reportTemplates.filter(r => r.category === 'analytics').length },
    { value: 'administrative', label: 'Administrativo', count: reportTemplates.filter(r => r.category === 'administrative').length }
  ]

  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGeneratingReport(reportId)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const report = reportTemplates.find(r => r.id === reportId)
      toast.success(`Reporte "${report?.name}" generado exitosamente`)
      
      // Simular descarga
      setTimeout(() => {
        toast.success('Descarga iniciada automáticamente')
      }, 500)
    } catch (error) {
      toast.error('Error al generar el reporte')
    } finally {
      setGeneratingReport(null)
    }
  }

  const handlePreviewReport = (reportId: string) => {
    toast.success('Vista previa próximamente disponible')
  }

  const handleScheduleReport = (reportId: string) => {
    toast.success('Programación de reportes próximamente')
  }

  const handleCustomReport = () => {
    toast.success('Constructor de reportes personalizados próximamente')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <BarChart3 className="h-4 w-4" />
      case 'interventions': return <Target className="h-4 w-4" />
      case 'analytics': return <PieChart className="h-4 w-4" />
      case 'administrative': return <Users className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-blue-100 text-blue-800'
      case 'semester': return 'bg-purple-100 text-purple-800'
      case 'annual': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <span>Reportes y Análisis</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Genera reportes detallados sobre retención estudiantil, intervenciones y análisis institucional
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={handleCustomReport}>
            <Settings className="h-4 w-4 mr-2" />
            Reporte Personalizado
          </Button>
          
          <Button variant="secondary" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Programar Envío
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileBarChart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">24</div>
                <div className="text-sm text-gray-600">Reportes Disponibles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">156</div>
                <div className="text-sm text-gray-600">Generados Este Mes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">8</div>
                <div className="text-sm text-gray-600">Programados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Download className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">2.3 GB</div>
                <div className="text-sm text-gray-600">Datos Procesados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Input
                type="date"
                label="Fecha Inicio"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>

            <div>
              <Input
                type="date"
                label="Fecha Fin"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
              selectedCategory === category.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            )}
          >
            {getCategoryIcon(category.value)}
            <span>{category.label}</span>
            <span className={clsx(
              'px-2 py-0.5 text-xs rounded-full',
              selectedCategory === category.value
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            )}>
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map(report => {
          const Icon = report.icon
          const isGenerating = generatingReport === report.id
          
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={clsx(
                            'px-2 py-0.5 text-xs font-medium rounded-full',
                            getFrequencyColor(report.frequency)
                          )}>
                            {report.frequency}
                          </span>
                          <span className="text-xs text-gray-500">{report.format}</span>
                          <span className="text-xs text-gray-500">{report.size}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {report.description}
                  </p>

                  {/* Last Generated */}
                  {report.lastGenerated && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Último: {new Date(report.lastGenerated).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(report.id)}
                      loading={isGenerating}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isGenerating ? 'Generando...' : 'Generar'}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePreviewReport(report.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleScheduleReport(report.id)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Usage Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Sistema de Reportes Inteligente</h3>
              <p className="text-blue-700 mt-2">
                Nuestro sistema genera reportes automáticamente usando datos en tiempo real del sistema USM-IA. 
                Todos los reportes incluyen visualizaciones interactivas, recomendaciones basadas en IA y 
                cumplimiento con estándares FERPA de privacidad estudiantil.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Datos en tiempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Análisis predictivo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Visualizaciones interactivas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Cumplimiento FERPA</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}