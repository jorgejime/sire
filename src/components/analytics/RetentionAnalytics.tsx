import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend
} from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

interface RetentionData {
  period: string
  totalStudents: number
  retained: number
  dropped: number
  retentionRate: number
  dropoutRate: number
  newEnrollments: number
}

interface CareerRetention {
  career: string
  totalStudents: number
  retentionRate: number
  averageGPA: number
  riskStudents: number
}

interface RiskDistribution {
  riskLevel: string
  count: number
  percentage: number
  color: string
}

export function RetentionAnalytics() {
  const { isDemo } = useAuth()
  const [loading, setLoading] = useState(true)
  const [retentionData, setRetentionData] = useState<RetentionData[]>([])
  const [careerData, setCareerData] = useState<CareerRetention[]>([])
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution[]>([])
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '2y' | '5y'>('1y')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange, isDemo])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setRetentionData(generateRetentionData())
        setCareerData(generateCareerData())
        setRiskDistribution(generateRiskData())
        return
      }

      // Lógica real con Supabase
      // const data = await fetchRealAnalytics()
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRetentionData = (): RetentionData[] => {
    const periods = timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : timeRange === '2y' ? 24 : 60
    const data: RetentionData[] = []
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      
      const totalStudents = Math.floor(1200 + Math.random() * 100)
      const retentionRate = 85 + Math.random() * 10 // 85-95%
      const retained = Math.floor(totalStudents * (retentionRate / 100))
      const dropped = totalStudents - retained
      const newEnrollments = Math.floor(50 + Math.random() * 100)
      
      data.push({
        period: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        totalStudents,
        retained,
        dropped,
        retentionRate: Number(retentionRate.toFixed(1)),
        dropoutRate: Number((100 - retentionRate).toFixed(1)),
        newEnrollments
      })
    }
    
    return data
  }

  const generateCareerData = (): CareerRetention[] => {
    return [
      {
        career: 'Ing. Civil Industrial',
        totalStudents: 350,
        retentionRate: 89.2,
        averageGPA: 3.4,
        riskStudents: 12
      },
      {
        career: 'Ing. Informática',
        totalStudents: 280,
        retentionRate: 91.5,
        averageGPA: 3.6,
        riskStudents: 8
      },
      {
        career: 'Ing. Comercial',
        totalStudents: 220,
        retentionRate: 85.1,
        averageGPA: 3.2,
        riskStudents: 15
      },
      {
        career: 'Ing. Civil',
        totalStudents: 200,
        retentionRate: 87.8,
        averageGPA: 3.3,
        riskStudents: 10
      },
      {
        career: 'Ing. Electrónica',
        totalStudents: 197,
        retentionRate: 83.9,
        averageGPA: 3.1,
        riskStudents: 18
      }
    ]
  }

  const generateRiskData = (): RiskDistribution[] => {
    return [
      { riskLevel: 'Bajo', count: 890, percentage: 71.4, color: '#00C49F' },
      { riskLevel: 'Medio', count: 234, percentage: 18.8, color: '#FFBB28' },
      { riskLevel: 'Alto', count: 78, percentage: 6.3, color: '#FF8042' },
      { riskLevel: 'Crítico', count: 45, percentage: 3.6, color: '#FF4444' }
    ]
  }

  const calculateTrend = (data: RetentionData[]) => {
    if (data.length < 2) return { trend: 'neutral', value: 0 }
    
    const recent = data.slice(-3).reduce((sum, d) => sum + d.retentionRate, 0) / 3
    const previous = data.slice(-6, -3).reduce((sum, d) => sum + d.retentionRate, 0) / 3
    
    const change = recent - previous
    return {
      trend: change > 1 ? 'positive' : change < -1 ? 'negative' : 'neutral',
      value: change
    }
  }

  const trend = retentionData.length > 0 ? calculateTrend(retentionData) : { trend: 'neutral', value: 0 }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }, (_, i) => (
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
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análisis de Retención</h2>
          <p className="text-gray-600">
            Tendencias históricas y predictivas de retención estudiantil
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Período:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="6m">Últimos 6 meses</option>
            <option value="1y">Último año</option>
            <option value="2y">Últimos 2 años</option>
            <option value="5y">Últimos 5 años</option>
          </select>
        </div>
      </div>

      {/* Resumen de tendencia */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tendencia de Retención</h3>
              <div className="flex items-center space-x-2 mt-2">
                {trend.trend === 'positive' ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : trend.trend === 'negative' ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                )}
                <span className={`font-medium ${
                  trend.trend === 'positive' ? 'text-green-600' : 
                  trend.trend === 'negative' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {trend.trend === 'positive' ? 'Mejorando' : 
                   trend.trend === 'negative' ? 'Declinando' : 'Estable'}
                  {trend.value !== 0 && ` (${trend.value > 0 ? '+' : ''}${trend.value.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {retentionData.length > 0 && retentionData[retentionData.length - 1].retentionRate}%
              </div>
              <div className="text-sm text-gray-500">Retención actual</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico principal de retención */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Retención Histórica</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? `${value}${name.includes('Rate') ? '%' : ''}` : value,
                  name === 'retentionRate' ? 'Tasa de Retención' :
                  name === 'totalStudents' ? 'Total Estudiantes' :
                  name === 'newEnrollments' ? 'Nuevas Matrículas' : name
                ]}
              />
              <Legend />
              <Bar yAxisId="right" dataKey="totalStudents" fill="#8884d8" name="Total Estudiantes" opacity={0.6} />
              <Area yAxisId="left" dataKey="retentionRate" fill="#00C49F" stroke="#00C49F" name="Tasa de Retención %" />
              <Line yAxisId="right" type="monotone" dataKey="newEnrollments" stroke="#FF8042" name="Nuevas Matrículas" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid de análisis detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retención por carrera */}
        <Card>
          <CardHeader>
            <CardTitle>Retención por Carrera</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={careerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="career" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value}${name === 'retentionRate' ? '%' : name === 'averageGPA' ? '' : ''}`,
                    name === 'retentionRate' ? 'Tasa Retención' :
                    name === 'averageGPA' ? 'GPA Promedio' :
                    name === 'riskStudents' ? 'En Riesgo' : name
                  ]}
                />
                <Bar dataKey="retentionRate" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de riesgo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Riesgo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label={({ riskLevel, percentage }) => `${riskLevel}: ${percentage}%`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, 'Estudiantes']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {riskDistribution.map((item) => (
                <div key={item.riskLevel} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.riskLevel}</span>
                  <span className="text-sm text-gray-500">({item.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla detallada de carreras */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Carrera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Carrera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Estudiantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tasa Retención
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GPA Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    En Riesgo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {careerData.map((career) => (
                  <tr key={career.career} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {career.career}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {career.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {career.retentionRate}%
                        </span>
                        {career.retentionRate >= 90 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : career.retentionRate >= 85 ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {career.averageGPA.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        career.riskStudents <= 10 ? 'bg-green-100 text-green-800' :
                        career.riskStudents <= 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {career.riskStudents}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        career.retentionRate >= 90 ? 'bg-green-100 text-green-800' :
                        career.retentionRate >= 85 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {career.retentionRate >= 90 ? 'Excelente' :
                         career.retentionRate >= 85 ? 'Bueno' : 'Requiere Atención'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}