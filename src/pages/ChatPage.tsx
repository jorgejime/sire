import { ChatBot } from '../components/chat/ChatBot'

export function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Asistente de Apoyo Estudiantil
        </h1>
        <p className="text-gray-600 mt-2">
          Conversa con nuestro asistente inteligente disponible 24/7 para apoyo académico y emocional.
          Si necesitas ayuda urgente, será escalado automáticamente a un consejero profesional.
        </p>
      </div>

      <div className="h-[600px]">
        <ChatBot />
      </div>

      {/* Resources */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            🎓 Apoyo Académico
          </h3>
          <p className="text-blue-700 text-sm">
            Técnicas de estudio, planificación académica, y estrategias de aprendizaje
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">
            💚 Bienestar Emocional
          </h3>
          <p className="text-green-700 text-sm">
            Manejo del estrés, equilibrio vida-estudio, y recursos de salud mental
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">
            🔗 Conexión con Servicios
          </h3>
          <p className="text-purple-700 text-sm">
            Enlaces directos con consejería, tutorías, y servicios universitarios
          </p>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-2">
          🚨 Contactos de Emergencia
        </h3>
        <div className="text-red-700 text-sm space-y-1">
          <p><strong>Crisis/Emergencia:</strong> 911</p>
          <p><strong>Consejería Estudiantil:</strong> +56 2 2303 1234 (24/7)</p>
          <p><strong>Salud Mental:</strong> línea@saludmental.usm.cl</p>
        </div>
      </div>
    </div>
  )
}