import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { AlertCircle, User, Settings, GraduationCap, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface DemoLoginProps {
  onLogin: (role: string, name: string) => void
}

export function DemoLogin({ onLogin }: DemoLoginProps) {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [showRealLogin, setShowRealLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const demoUsers = [
    {
      role: 'student',
      name: 'María González',
      email: 'maria.gonzalez@usm.cl',
      description: 'Estudiante de Ingeniería Civil Industrial',
      icon: GraduationCap,
      color: 'bg-blue-500'
    },
    {
      role: 'coordinator',
      name: 'Dr. Carlos Mendoza',
      email: 'carlos.mendoza@usm.cl',
      description: 'Coordinador Académico de Ingeniería',
      icon: User,
      color: 'bg-green-500'
    },
    {
      role: 'admin',
      name: 'Ana Rodríguez',
      email: 'ana.rodriguez@usm.cl',
      description: 'Administrador del Sistema',
      icon: Settings,
      color: 'bg-purple-500'
    }
  ]

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      toast.success('Login exitoso!')
      // El AuthContext se encargará de manejar el usuario
      
    } catch (error: any) {
      toast.error(error.message || 'Error en el login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900 mb-2">
            🎓 USM-IA Demo
          </CardTitle>
          <p className="text-gray-600">
            Sistema Inteligente de Retención Estudiantil
          </p>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Sistema de Producción</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Sistema completo con base de datos real. Elige modo demo o inicia sesión real.
            </p>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => setShowRealLogin(!showRealLogin)}
              variant={showRealLogin ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login Real
            </Button>
            <Button
              onClick={() => setShowRealLogin(false)}
              variant={!showRealLogin ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Modo Demo
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {showRealLogin ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Iniciar Sesión Real
              </h3>
              
              <form onSubmit={handleRealLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Email (ej: admin@usm.cl)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Credenciales de prueba:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• admin@usm.cl / admin123456</div>
                  <div>• coordinador@usm.cl / coord123456</div>
                  <div>• estudiante1@usm.cl / estudiante123</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selecciona un perfil para explorar:
              </h3>

            {demoUsers.map((user) => {
              const Icon = user.icon
              return (
                <div
                  key={user.role}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === user.role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRole(user.role)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${user.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500 mt-1">{user.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            <Button
              onClick={() => {
                const user = demoUsers.find(u => u.role === selectedRole)
                if (user) {
                  onLogin(user.role, user.name)
                }
              }}
              disabled={!selectedRole}
              className="w-full mt-6"
              size="lg"
            >
              Entrar como {selectedRole ? demoUsers.find(u => u.role === selectedRole)?.name : 'Usuario'}
            </Button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Para usar la versión completa:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Crear proyecto en <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline">Supabase</a></li>
              <li>2. Ejecutar el schema SQL (supabase/schema.sql)</li>
              <li>3. Configurar variables en .env</li>
              <li>4. Obtener API key de Google Gemini</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}