import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  GraduationCap,
  Target,
  BookOpen,
  Clock,
  Award,
  Activity
} from 'lucide-react'
import { clsx } from 'clsx'

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  description: string
}

export function MetricsOverview() {
  const { isDemo } = useAuth()
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    fetchMetrics()
  }, [timeframe, isDemo])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      
      if (isDemo) {
        setMetrics(generateMockMetrics())
        return
      }

      // Aquí iría la lógica real para obtener métricas de Supabase
      const metricsData = await fetchRealMetrics()
      setMetrics(metricsData)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockMetrics = (): MetricCard[] => {
    const baseMetrics = [
      {
        id: 'retention_rate',
        title: 'Tasa de Retención',
        value: '87.3%',
        change: 2.4,
        changeType: 'positive' as const,
        icon: Target,
        color: 'text-green-600 bg-green-100',
        description: 'Estudiantes que continúan matriculados'
      },
      {
        id: 'at_risk_students',
        title: 'Estudiantes en Riesgo',
        value: 45,
        change: -8.2,
        changeType: 'positive' as const,
        icon: AlertTriangle,
        color: 'text-orange-600 bg-orange-100',
        description: 'Predicción de riesgo alto/crítico'
      },
      {
        id: 'avg_gpa',
        title: 'GPA Promedio',
        value: 3.21,
        change: 0.15,
        changeType: 'positive' as const,
        icon: Award,
        color: 'text-blue-600 bg-blue-100',
        description: 'Rendimiento académico general'
      },
      {
        id: 'total_students',
        title: 'Total Estudiantes',
        value: 1247,
        change: 3.2,
        changeType: 'positive' as const,
        icon: Users,
        color: 'text-purple-600 bg-purple-100',
        description: 'Matrícula activa actual'
      },
      {
        id: 'graduation_rate',
        title: 'Tasa de Graduación',
        value: '78.9%',
        change: 1.8,
        changeType: 'positive' as const,
        icon: GraduationCap,
        color: 'text-indigo-600 bg-indigo-100',
        description: 'Estudiantes que se gradúan a tiempo'
      },
      {
        id: 'avg_credits',
        title: 'Créditos Promedio',
        value: 18.5,
        change: -0.8,
        changeType: 'negative' as const,
        icon: BookOpen,
        color: 'text-cyan-600 bg-cyan-100',
        description: 'Carga académica por semestre'
      },
      {
        id: 'response_time',
        title: 'Tiempo de Respuesta',
        value: '2.4h',
        change: -15.3,
        changeType: 'positive' as const,
        icon: Clock,
        color: 'text-pink-600 bg-pink-100',
        description: 'Tiempo promedio de intervención'
      },
      {
        id: 'engagement_score',
        title: 'Score de Participación',
        value: 72.8,
        change: 4.1,
        changeType: 'positive' as const,
        icon: Activity,
        color: 'text-teal-600 bg-teal-100',
        description: 'Nivel de participación estudiantil'
      }
    ]

    // Simular variaciones según el timeframe
    const timeframeMultipliers = {
      '7d': 0.3,
      '30d': 1,
      '90d': 2.1,
      '1y': 4.5
    }

    return baseMetrics.map(metric => ({
      ...metric,
      change: metric.change * timeframeMultipliers[timeframe]
    }))
  }

  const fetchRealMetrics = async (): Promise<MetricCard[]> => {
    // Implementación real con Supabase
    // Por ahora retorna datos mock
    return generateMockMetrics()
  }

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  const getTimeframeName = (tf: string): string => {
    const names = {
      '7d': '7 días',
      '30d': '30 días', 
      '90d': '90 días',
      '1y': '1 año'
    }
    return names[tf as keyof typeof names] || tf
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-200 rounded-lg w-12 h-12"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros de tiempo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas Clave</h2>
          <p className="text-gray-600">
            Indicadores principales del sistema de retención estudiantil
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Período:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.id} className="transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={clsx('p-3 rounded-lg', metric.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {metric.title}
                    </p>
                    <div className="flex items-end space-x-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {metric.value}
                      </p>
                      <div className={clsx(
                        'flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full',
                        metric.changeType === 'positive' 
                          ? 'text-green-700 bg-green-100' 
                          : metric.changeType === 'negative'
                          ? 'text-red-700 bg-red-100'
                          : 'text-gray-700 bg-gray-100'
                      )}>
                        {metric.changeType === 'positive' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : metric.changeType === 'negative' ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : null}
                        {formatChange(metric.change)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resumen de tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Tendencias ({getTimeframeName(timeframe)})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-600">Mejorando</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.filter(m => m.changeType === 'positive').length}
              </div>
              <div className="text-sm text-gray-600">Métricas</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-600">Declinando</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.filter(m => m.changeType === 'negative').length}
              </div>
              <div className="text-sm text-gray-600">Métricas</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-600">Estables</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metrics.filter(m => m.changeType === 'neutral').length}
              </div>
              <div className="text-sm text-gray-600">Métricas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}