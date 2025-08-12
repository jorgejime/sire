import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import toast from 'react-hot-toast'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatBotProps {
  studentId?: string
}

export function ChatBot({ studentId }: ChatBotProps) {
  const { profile, user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const effectiveStudentId = studentId || (profile?.role === 'student' ? user?.id : null)

  useEffect(() => {
    if (effectiveStudentId) {
      loadConversationHistory()
    }
  }, [effectiveStudentId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversationHistory = async () => {
    try {
      if (!effectiveStudentId) return

      // Buscar el estudiante por user_id si es necesario
      let studentRecord = effectiveStudentId
      if (profile?.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user?.id)
          .single()
        
        if (student) {
          studentRecord = student.id
        }
      }

      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('student_id', studentRecord)
        .single()

      if (conversation) {
        setConversationId(conversation.id)
        setMessages(conversation.messages || [])
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !effectiveStudentId) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Determinar el ID del estudiante correcto
      let studentRecord = effectiveStudentId
      if (profile?.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user?.id)
          .single()
        
        if (student) {
          studentRecord = student.id
        } else {
          throw new Error('No se encontró el registro de estudiante')
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          student_id: studentRecord,
          message: userMessage.content,
          conversation_history: messages
        }
      })

      if (error) throw error

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Mostrar alerta si hay escalamiento
      if (data.sentiment_analysis?.needs_escalation) {
        toast.error('Se ha notificado a un consejero para contactarte pronto', {
          duration: 5000,
        })
      }

      setConversationId(data.conversation_id)

    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar mensaje')
      
      // Agregar mensaje de error
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, estoy teniendo problemas técnicos. Por favor contacta directamente con un consejero estudiantil si necesitas ayuda urgente.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!effectiveStudentId) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Chat no disponible. Por favor contacta al administrador.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Asistente de Apoyo Estudiantil</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Estoy aquí para apoyarte académica y emocionalmente 24/7
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.length === 0 && (
            <div className="text-center text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2 text-blue-400" />
              <p className="text-sm">
                ¡Hola! Soy tu asistente de apoyo estudiantil. 
                Puedes hablar conmigo sobre tus estudios, preocupaciones o cualquier cosa que necesites.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-xs lg:max-w-md ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-blue-500 ml-2' : 'bg-gray-300 mr-2'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Escribiendo...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Si necesitas ayuda urgente, contacta directamente con consejería estudiantil
          </p>
        </div>
      </CardContent>
    </Card>
  )
}