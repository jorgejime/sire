import { useState } from 'react'
import { MetricsOverview } from '../components/analytics/MetricsOverview'
import { RetentionAnalytics } from '../components/analytics/RetentionAnalytics'
import { PredictiveAnalytics } from '../components/analytics/PredictiveAnalytics'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Target,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react'
import { clsx } from 'clsx'

type AnalyticsTab = 'overview' | 'retention' | 'predictive'

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const tabs = [
    {
      id: 'overview' as AnalyticsTab,
      name: 'Métricas Generales',
      icon: BarChart3,
      description: 'KPIs principales del sistema'
    },
    {
      id: 'retention' as AnalyticsTab,
      name: 'Análisis de Retención',
      icon: TrendingUp,
      description: 'Tendencias históricas y por carrera'
    },
    {
      id: 'predictive' as AnalyticsTab,
      name: 'Análisis Predictivo',
      icon: Brain,
      description: 'Machine Learning y predicciones'
    }
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simular actualización de datos
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MetricsOverview />
      case 'retention':
        return <RetentionAnalytics />
      case 'predictive':
        return <PredictiveAnalytics />
      default:
        return <MetricsOverview />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <span>Centro de Análisis</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Insights avanzados y métricas de retención estudiantil
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {}}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Programar Reporte
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => {}}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>

          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={clsx("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>

          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">87.3%</div>
                <div className="text-xs text-gray-600">Retención Global</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">+2.4%</div>
                <div className="text-xs text-gray-600">Mejora Mensual</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Brain className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">45</div>
                <div className="text-xs text-gray-600">Riesgo Alto</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">91.2%</div>
                <div className="text-xs text-gray-600">Precisión IA</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className={clsx(
                      'mr-2 h-5 w-5',
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )} />
                    <div className="text-left">
                      <div>{tab.name}</div>
                      <div className="text-xs text-gray-400 font-normal">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {renderTabContent()}
      </div>

      {/* Footer info */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Sistema en línea</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Actualizando datos</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}