import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Zap,
  Eye,
  RefreshCw,
  Download
} from 'lucide-react'

interface PredictionModel {
  id: string
  name: string
  accuracy: number
  lastTrained: string
  predictions: number
  status: 'active' | 'training' | 'inactive'
}

interface RiskPrediction {
  studentId: string
  studentName: string
  currentSemester: number
  predictedRisk: number
  riskFactors: string[]
  interventionRecommended: boolean
  confidenceLevel: number
  timeToRisk: number // months
}

interface ModelPerformance {
  month: string
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  predictionsCount: number
}

interface FeatureImportance {
  feature: string
  importance: number
  description: string
}

export function PredictiveAnalytics() {
  const { isDemo } = useAuth()
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<PredictionModel[]>([])
  const [predictions, setPredictions] = useState<RiskPrediction[]>([])
  const [performance, setPerformance] = useState<ModelPerformance[]>([])
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('main-model')

  useEffect(() => {
    fetchPredictiveData()
  }, [selectedModel, isDemo])

  const fetchPredictiveData = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setModels(generateMockModels())
        setPredictions(generateMockPredictions())
        setPerformance(generateMockPerformance())
        setFeatureImportance(generateFeatureImportance())
        return
      }

      // Lógica real con Supabase
    } catch (error) {
      console.error('Error fetching predictive analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockModels = (): PredictionModel[] => [
    {
      id: 'main-model',
      name: 'Modelo Principal de Retención',
      accuracy: 87.3,
      lastTrained: '2024-01-15T10:30:00Z',
      predictions: 1247,
      status: 'active'
    },
    {
      id: 'early-detection',
      name: 'Detección Temprana (Primer Año)',
      accuracy: 82.1,
      lastTrained: '2024-01-10T14:20:00Z',
      predictions: 423,
      status: 'active'
    },
    {
      id: 'semester-transition',
      name: 'Transición entre Semestres',
      accuracy: 91.7,
      lastTrained: '2024-01-12T09:15:00Z',
      predictions: 678,
      status: 'training'
    }
  ]

  const generateMockPredictions = (): RiskPrediction[] => [
    {
      studentId: '1',
      studentName: 'Carlos Mendoza',
      currentSemester: 3,
      predictedRisk: 87,
      riskFactors: ['GPA bajo (2.1)', 'Asistencia irregular (65%)', 'No participación en tutorías'],
      interventionRecommended: true,
      confidenceLevel: 92,
      timeToRisk: 2
    },
    {
      studentId: '2',
      studentName: 'María González',
      currentSemester: 5,
      predictedRisk: 73,
      riskFactors: ['Carga académica alta (22 créditos)', 'Historial de materias reprobadas'],
      interventionRecommended: true,
      confidenceLevel: 85,
      timeToRisk: 4
    },
    {
      studentId: '3',
      studentName: 'Ana Rodríguez',
      currentSemester: 2,
      predictedRisk: 91,
      riskFactors: ['GPA crítico (1.8)', 'Múltiples faltas', 'Sin contacto con servicios de apoyo'],
      interventionRecommended: true,
      confidenceLevel: 96,
      timeToRisk: 1
    },
    {
      studentId: '4',
      studentName: 'Luis Silva',
      currentSemester: 6,
      predictedRisk: 68,
      riskFactors: ['Disminución gradual en calificaciones', 'Cambio de programa'],
      interventionRecommended: false,
      confidenceLevel: 78,
      timeToRisk: 6
    }
  ]

  const generateMockPerformance = (): ModelPerformance[] => {
    const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar']
    return months.map(month => ({
      month,
      accuracy: 85 + Math.random() * 6,
      precision: 82 + Math.random() * 8,
      recall: 79 + Math.random() * 9,
      f1Score: 80 + Math.random() * 7,
      predictionsCount: Math.floor(200 + Math.random() * 100)
    }))
  }

  const generateFeatureImportance = (): FeatureImportance[] => [
    { feature: 'GPA', importance: 0.28, description: 'Promedio de calificaciones acumulado' },
    { feature: 'Asistencia', importance: 0.22, description: 'Porcentaje de asistencia a clases' },
    { feature: 'Créditos Completados', importance: 0.18, description: 'Progreso académico vs tiempo' },
    { feature: 'Participación', importance: 0.12, description: 'Actividad en foros y tareas' },
    { feature: 'Uso de Servicios', importance: 0.10, description: 'Interacción con tutorías y apoyo' },
    { feature: 'Historial Familiar', importance: 0.06, description: 'Antecedentes educativos familiares' },
    { feature: 'Situación Socioeconómica', importance: 0.04, description: 'Indicadores económicos y sociales' }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'text-red-600 bg-red-100 border-red-200'
    if (risk >= 60) return 'text-orange-600 bg-orange-100 border-orange-200'
    if (risk >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    return 'text-green-600 bg-green-100 border-green-200'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <Brain className="h-7 w-7 text-purple-600" />
            <span>Análisis Predictivo</span>
          </h2>
          <p className="text-gray-600">
            Predicciones de riesgo y análisis de machine learning
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reentrenar
          </Button>
          
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Modelos Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map(model => (
          <Card key={model.id} className={`transition-all ${
            selectedModel === model.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  model.status === 'active' ? 'bg-green-100' :
                  model.status === 'training' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Zap className={`h-5 w-5 ${
                    model.status === 'active' ? 'text-green-600' :
                    model.status === 'training' ? 'text-yellow-600' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  model.status === 'active' ? 'bg-green-100 text-green-800' :
                  model.status === 'training' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {model.status === 'active' ? 'Activo' :
                   model.status === 'training' ? 'Entrenando' : 'Inactivo'}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{model.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precisión:</span>
                  <span className="font-medium">{model.accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Predicciones:</span>
                  <span className="font-medium">{model.predictions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actualizado:</span>
                  <span className="font-medium text-xs">
                    {formatDate(model.lastTrained)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance del modelo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento del Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[70, 100]} />
                <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, '']} />
                <Line type="monotone" dataKey="accuracy" stroke="#0088FE" name="Precisión" strokeWidth={2} />
                <Line type="monotone" dataKey="precision" stroke="#00C49F" name="Exactitud" strokeWidth={2} />
                <Line type="monotone" dataKey="recall" stroke="#FFBB28" name="Recall" strokeWidth={2} />
                <Line type="monotone" dataKey="f1Score" stroke="#FF8042" name="F1-Score" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Importancia de Características</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={featureImportance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="feature" />
                <PolarRadiusAxis domain={[0, 0.3]} tick={false} />
                <Radar
                  name="Importancia"
                  dataKey="importance"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Predicciones de alto riesgo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Predicciones de Alto Riesgo</span>
            </CardTitle>
            <div className="text-sm text-gray-500">
              {predictions.filter(p => p.predictedRisk >= 70).length} estudiantes identificados
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Riesgo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Confianza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tiempo Estimado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Factores Principales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {predictions
                  .sort((a, b) => b.predictedRisk - a.predictedRisk)
                  .slice(0, 10)
                  .map((prediction) => (
                  <tr key={prediction.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prediction.studentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Semestre {prediction.currentSemester}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        getRiskColor(prediction.predictedRisk)
                      }`}>
                        {prediction.predictedRisk}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.confidenceLevel}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prediction.timeToRisk} meses
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 max-w-xs">
                        {prediction.riskFactors.slice(0, 2).join(', ')}
                        {prediction.riskFactors.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {prediction.interventionRecommended && (
                          <Target className="h-4 w-4 text-orange-500" title="Intervención recomendada" />
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detalles de características */}
      <Card>
        <CardHeader>
          <CardTitle>Factores de Riesgo - Importancia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureImportance.map((feature, index) => (
              <div key={feature.feature} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium text-gray-900">
                  {feature.feature}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feature.importance * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {(feature.importance * 100).toFixed(1)}%
                </div>
                <div className="w-64 text-xs text-gray-500">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}