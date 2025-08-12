import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatRequest {
  student_id: string
  message: string
  conversation_history: ChatMessage[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { student_id, message, conversation_history }: ChatRequest = await req.json()

    // Obtener información del estudiante para contexto
    const { data: studentData } = await supabaseClient
      .from('students')
      .select(`
        *,
        profiles(full_name, email),
        predictions(risk_score, risk_factors, recommendations),
        alerts(id, alert_type, severity, title, is_resolved)
      `)
      .eq('id', student_id)
      .single()

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Construir contexto del estudiante
    const studentContext = `
    Información del estudiante:
    - Nombre: ${studentData?.profiles?.full_name || 'No disponible'}
    - Carrera: ${studentData?.career || 'No disponible'}
    - Semestre: ${studentData?.semester || 'No disponible'}
    - GPA: ${studentData?.gpa || 'No disponible'}
    - Estado: ${studentData?.status || 'activo'}
    - Riesgo actual: ${studentData?.predictions?.[0]?.risk_score || 'No evaluado'}
    - Alertas activas: ${studentData?.alerts?.filter((a: any) => !a.is_resolved).length || 0}
    `

    // Sistema prompt para el chatbot
    const systemPrompt = `
    Eres un asistente de apoyo estudiantil inteligente del sistema USM-IA. Tu función es:

    1. PROPORCIONAR APOYO EMOCIONAL Y ACADÉMICO:
    - Ofrecer escucha empática
    - Proporcionar recursos de apoyo
    - Motivar y orientar al estudiante

    2. DETECTAR SITUACIONES DE RIESGO:
    - Identificar señales de estrés, ansiedad o depresión
    - Reconocer problemas académicos o personales graves
    - Activar protocolo de escalamiento si es necesario

    3. OFRECER RECURSOS CONCRETOS:
    - Información sobre servicios universitarios
    - Técnicas de estudio y manejo del tiempo
    - Estrategias de bienestar mental

    4. MANTENER LÍMITES APROPIADOS:
    - No eres un terapeuta profesional
    - Deriva a especialistas cuando sea necesario
    - Mantén confidencialidad apropiada

    DIRECTRICES:
    - Sé empático pero profesional
    - Usa un tono cercano pero respetuoso
    - Proporciona respuestas útiles y específicas
    - Si detectas crisis o riesgo alto, recomienda contactar inmediatamente con un consejero

    CONTEXTO DEL ESTUDIANTE:
    ${studentContext}

    Responde en español de manera natural y útil.
    `

    // Construir historial de conversación para el modelo
    const conversationContext = conversation_history
      .slice(-10) // Solo las últimas 10 interacciones
      .map(msg => `${msg.role === 'user' ? 'Estudiante' : 'Asistente'}: ${msg.content}`)
      .join('\n')

    const fullPrompt = `
    ${systemPrompt}

    HISTORIAL DE CONVERSACIÓN:
    ${conversationContext}

    MENSAJE ACTUAL DEL ESTUDIANTE:
    ${message}

    Por favor, responde de manera útil y empática:
    `

    const result = await model.generateContent(fullPrompt)
    const assistantResponse = result.response.text()

    // Analizar sentimiento y detectar alertas en el mensaje del usuario
    const sentimentAnalysis = await analyzeSentimentAndRisk(model, message, conversationContext)

    // Actualizar conversación en la base de datos
    const updatedMessages = [
      ...conversation_history,
      {
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        role: 'assistant' as const,
        content: assistantResponse,
        timestamp: new Date().toISOString()
      }
    ]

    // Guardar/actualizar conversación
    const { data: existingConversation } = await supabaseClient
      .from('chat_conversations')
      .select('id')
      .eq('student_id', student_id)
      .single()

    if (existingConversation) {
      await supabaseClient
        .from('chat_conversations')
        .update({
          messages: updatedMessages,
          sentiment_score: sentimentAnalysis.sentiment_score,
          last_activity: new Date().toISOString(),
          is_escalated: sentimentAnalysis.needs_escalation
        })
        .eq('id', existingConversation.id)
    } else {
      await supabaseClient
        .from('chat_conversations')
        .insert({
          student_id: student_id,
          messages: updatedMessages,
          sentiment_score: sentimentAnalysis.sentiment_score,
          last_activity: new Date().toISOString(),
          is_escalated: sentimentAnalysis.needs_escalation
        })
    }

    // Crear alerta si se detecta riesgo alto
    if (sentimentAnalysis.needs_escalation) {
      await createChatEscalationAlert(supabaseClient, student_id, sentimentAnalysis)
    }

    return new Response(JSON.stringify({
      response: assistantResponse,
      sentiment_analysis: sentimentAnalysis,
      conversation_id: existingConversation?.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error procesando el mensaje',
        response: 'Lo siento, tengo problemas técnicos. Por favor contacta directamente con un consejero estudiantil.'
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function analyzeSentimentAndRisk(model: any, message: string, context: string) {
  try {
    const analysisPrompt = `
    Analiza el siguiente mensaje de un estudiante universitario para detectar:
    1. Estado emocional/sentimiento
    2. Nivel de riesgo o crisis
    3. Necesidad de escalamiento a un profesional

    MENSAJE: ${message}
    CONTEXTO: ${context}

    Responde SOLO en formato JSON:
    {
      "sentiment_score": [número del -1 a 1, donde -1 es muy negativo y 1 muy positivo],
      "emotional_state": ["positivo" | "neutral" | "preocupante" | "crisis"],
      "risk_indicators": [array de indicadores de riesgo detectados],
      "needs_escalation": [true/false - si requiere atención inmediata de un profesional],
      "escalation_reason": "razón específica si needs_escalation es true"
    }

    INDICADORES DE ESCALAMIENTO:
    - Pensamientos suicidas o autolesión
    - Crisis emocional severa
    - Menciones de abuso de sustancias
    - Situaciones de emergencia familiar/personal graves
    - Estados depresivos severos
    `

    const result = await model.generateContent(analysisPrompt)
    const responseText = result.response.text()

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // Fallback analysis
    return {
      sentiment_score: 0,
      emotional_state: 'neutral',
      risk_indicators: [],
      needs_escalation: false,
      escalation_reason: ''
    }

  } catch (error) {
    console.error('Error in sentiment analysis:', error)
    return {
      sentiment_score: 0,
      emotional_state: 'neutral',
      risk_indicators: ['error_in_analysis'],
      needs_escalation: false,
      escalation_reason: ''
    }
  }
}

async function createChatEscalationAlert(supabaseClient: any, studentId: string, analysis: any) {
  try {
    await supabaseClient
      .from('alerts')
      .insert({
        student_id: studentId,
        alert_type: 'behavioral',
        severity: 'critical',
        title: 'Escalamiento requerido - Chat de apoyo',
        message: `El estudiante requiere atención inmediata de un profesional. Razón: ${analysis.escalation_reason}. Estado emocional: ${analysis.emotional_state}`,
        metadata: {
          source: 'ai_chat',
          sentiment_score: analysis.sentiment_score,
          risk_indicators: analysis.risk_indicators,
          escalation_timestamp: new Date().toISOString()
        }
      })
  } catch (error) {
    console.error('Error creating escalation alert:', error)
  }
}