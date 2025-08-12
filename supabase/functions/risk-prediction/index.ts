import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StudentRiskData {
  student_id: string
  gpa: number
  attendance_rate: number
  credits_completed: number
  credits_enrolled: number
  semester: number
  recent_grades: number[]
  behavioral_indicators: any
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

    const { studentData }: { studentData: StudentRiskData } = await req.json()

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Construir prompt para análisis de riesgo
    const prompt = `
    Analiza los siguientes datos de un estudiante universitario y predice su riesgo de deserción académica.
    
    Datos del estudiante:
    - GPA actual: ${studentData.gpa}
    - Tasa de asistencia: ${studentData.attendance_rate}%
    - Créditos completados: ${studentData.credits_completed}
    - Créditos inscritos: ${studentData.credits_enrolled}
    - Semestre actual: ${studentData.semester}
    - Calificaciones recientes: ${JSON.stringify(studentData.recent_grades)}
    - Indicadores comportamentales: ${JSON.stringify(studentData.behavioral_indicators)}

    Por favor, proporciona un análisis en formato JSON con la siguiente estructura:
    {
      "risk_score": [número del 0-100, donde 100 es alto riesgo],
      "risk_level": ["bajo" | "medio" | "alto" | "crítico"],
      "confidence": [número del 0-1 indicando confianza en la predicción],
      "primary_factors": [array de factores principales de riesgo],
      "protective_factors": [array de factores protectores],
      "recommendations": [array de recomendaciones específicas],
      "intervention_priority": [número del 1-5, donde 5 es urgente],
      "explanation": "breve explicación del análisis"
    }

    Considera estos criterios:
    - GPA < 2.0 = alto riesgo
    - Asistencia < 70% = factor de riesgo significativo
    - Tendencia decreciente en calificaciones = preocupante
    - Ratio créditos completados/inscritos bajo = posible sobrecarga
    - Semestres altos con bajo progreso = riesgo de abandono
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Intentar parsear la respuesta JSON
    let analysisResult
    try {
      // Extraer JSON del texto de respuesta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Si falla el parsing, crear una respuesta de fallback
      analysisResult = {
        risk_score: calculateBasicRiskScore(studentData),
        risk_level: getRiskLevel(calculateBasicRiskScore(studentData)),
        confidence: 0.7,
        primary_factors: determinePrimaryFactors(studentData),
        protective_factors: determineProtectiveFactors(studentData),
        recommendations: generateBasicRecommendations(studentData),
        intervention_priority: getInterventionPriority(calculateBasicRiskScore(studentData)),
        explanation: 'Análisis basado en algoritmo de fallback debido a error en parsing de IA'
      }
    }

    // Guardar predicción en la base de datos
    const { error: insertError } = await supabaseClient
      .from('predictions')
      .insert({
        student_id: studentData.student_id,
        risk_score: analysisResult.risk_score,
        risk_factors: {
          primary_factors: analysisResult.primary_factors,
          protective_factors: analysisResult.protective_factors,
          risk_level: analysisResult.risk_level
        },
        recommendations: analysisResult.recommendations,
        confidence_level: analysisResult.confidence,
        model_version: 'gemini-1.5-flash'
      })

    if (insertError) {
      console.error('Error saving prediction:', insertError)
    }

    // Crear alerta automática si el riesgo es alto
    if (analysisResult.risk_score >= 70) {
      await createHighRiskAlert(supabaseClient, studentData.student_id, analysisResult)
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in risk-prediction function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function calculateBasicRiskScore(data: StudentRiskData): number {
  let score = 0
  
  // Factor GPA (40% del score)
  if (data.gpa < 2.0) score += 40
  else if (data.gpa < 2.5) score += 30
  else if (data.gpa < 3.0) score += 15
  
  // Factor asistencia (30% del score)
  if (data.attendance_rate < 60) score += 30
  else if (data.attendance_rate < 70) score += 20
  else if (data.attendance_rate < 80) score += 10
  
  // Factor progreso académico (30% del score)
  const completionRate = data.credits_completed / (data.semester * 15) // Asumiendo 15 créditos por semestre
  if (completionRate < 0.6) score += 30
  else if (completionRate < 0.8) score += 15
  
  return Math.min(score, 100)
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'crítico'
  if (score >= 60) return 'alto'
  if (score >= 30) return 'medio'
  return 'bajo'
}

function determinePrimaryFactors(data: StudentRiskData): string[] {
  const factors = []
  
  if (data.gpa < 2.5) factors.push('GPA bajo')
  if (data.attendance_rate < 70) factors.push('Asistencia irregular')
  if (data.credits_completed < data.semester * 12) factors.push('Progreso académico lento')
  if (data.recent_grades.some(g => g < 2.0)) factors.push('Calificaciones recientes bajas')
  
  return factors
}

function determineProtectiveFactors(data: StudentRiskData): string[] {
  const factors = []
  
  if (data.gpa >= 3.0) factors.push('GPA satisfactorio')
  if (data.attendance_rate >= 85) factors.push('Asistencia regular')
  if (data.credits_completed >= data.semester * 15) factors.push('Progreso académico adecuado')
  
  return factors
}

function generateBasicRecommendations(data: StudentRiskData): string[] {
  const recommendations = []
  
  if (data.gpa < 2.5) {
    recommendations.push('Programa de tutoría académica')
    recommendations.push('Evaluación de técnicas de estudio')
  }
  
  if (data.attendance_rate < 80) {
    recommendations.push('Seguimiento de asistencia')
    recommendations.push('Identificar barreras para la asistencia')
  }
  
  if (data.credits_enrolled > data.credits_completed * 1.3) {
    recommendations.push('Revisar carga académica')
    recommendations.push('Planificación académica personalizada')
  }
  
  return recommendations
}

function getInterventionPriority(score: number): number {
  if (score >= 80) return 5
  if (score >= 60) return 4
  if (score >= 40) return 3
  if (score >= 20) return 2
  return 1
}

async function createHighRiskAlert(supabaseClient: any, studentId: string, analysis: any) {
  try {
    await supabaseClient
      .from('alerts')
      .insert({
        student_id: studentId,
        alert_type: 'academic',
        severity: analysis.risk_level === 'crítico' ? 'critical' : 'high',
        title: `Estudiante en riesgo ${analysis.risk_level}`,
        message: `El análisis predictivo indica un riesgo ${analysis.risk_level} de deserción (${analysis.risk_score}%). Factores principales: ${analysis.primary_factors.join(', ')}`,
        metadata: {
          risk_score: analysis.risk_score,
          analysis_date: new Date().toISOString(),
          recommendations: analysis.recommendations
        }
      })
  } catch (error) {
    console.error('Error creating high risk alert:', error)
  }
}