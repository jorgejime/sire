import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      await signIn(data.email, data.password)
    } catch (error) {
      // Error ya manejado en el contexto
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-blue-900">
          USM-IA
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Sistema Inteligente de Retención Estudiantil
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="tu@email.com"
            error={errors.email?.message}
          />

          <Input
            {...register('password')}
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            error={errors.password?.message}
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Primera vez aquí?{' '}
            <button className="text-blue-600 hover:underline font-medium">
              Contacta al administrador
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}