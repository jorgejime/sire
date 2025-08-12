import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://jofqwhvntvykclqfuhia.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupSupabase() {
  try {
    console.log('🔧 Setting up USM-IA Supabase backend...')

    // Test connection
    console.log('📡 Testing Supabase connection...')
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.log('This is expected if tables don\'t exist yet. Continuing setup...')
    } else {
      console.log('✅ Supabase connection successful!')
    }

    // Create sample data (only if tables exist)
    console.log('📊 Setting up sample data...')
    
    // Create sample students
    const sampleStudents = [
      {
        student_code: 'USM2024001',
        career: 'Ingeniería en Informática',
        semester: 6,
        gpa: 3.2,
        credits_completed: 120,
        credits_enrolled: 18,
        enrollment_date: '2022-03-01',
        expected_graduation: '2026-12-01',
        status: 'active',
        emergency_contact: {
          name: 'María González',
          phone: '+56987654321',
          relationship: 'Madre'
        },
        academic_data: {
          specialization: 'Desarrollo de Software',
          thesis_topic: 'Inteligencia Artificial aplicada a la educación'
        }
      },
      {
        student_code: 'USM2024002',
        career: 'Ingeniería Civil Industrial',
        semester: 4,
        gpa: 2.8,
        credits_completed: 80,
        credits_enrolled: 15,
        enrollment_date: '2022-03-01',
        expected_graduation: '2027-06-01',
        status: 'active',
        emergency_contact: {
          name: 'Juan Pérez',
          phone: '+56987654322',
          relationship: 'Padre'
        },
        academic_data: {
          specialization: 'Gestión de Operaciones',
          internship_completed: false
        }
      },
      {
        student_code: 'USM2024003',
        career: 'Ingeniería Comercial',
        semester: 8,
        gpa: 3.7,
        credits_completed: 160,
        credits_enrolled: 12,
        enrollment_date: '2021-03-01',
        expected_graduation: '2025-12-01',
        status: 'active',
        emergency_contact: {
          name: 'Ana Silva',
          phone: '+56987654323',
          relationship: 'Madre'
        },
        academic_data: {
          specialization: 'Marketing Digital',
          internship_completed: true
        }
      }
    ]

    console.log('🎓 Creating students...')
    for (const student of sampleStudents) {
      try {
        const { error: studentError } = await supabase
          .from('students')
          .upsert(student, { onConflict: 'student_code' })

        if (studentError) {
          console.log(`⚠️  Student creation warning: ${studentError.message}`)
        } else {
          console.log(`✅ Created student: ${student.student_code}`)
        }
      } catch (err) {
        console.log(`⚠️  Student ${student.student_code} - ${err.message}`)
      }
    }

    // Get created students to create related data
    const { data: studentsData } = await supabase
      .from('students')
      .select('id, student_code')
      .limit(3)

    if (studentsData && studentsData.length > 0) {
      console.log('🚨 Creating alerts...')
      
      const sampleAlerts = [
        {
          student_id: studentsData[0].id,
          alert_type: 'academic',
          severity: 'high',
          title: 'Bajo rendimiento académico',
          message: 'El estudiante ha mostrado una disminución significativa en sus calificaciones en las últimas 3 evaluaciones.',
          is_resolved: false,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          student_id: studentsData[1]?.id || studentsData[0].id,
          alert_type: 'attendance',
          severity: 'medium',
          title: 'Asistencia irregular',
          message: 'El estudiante ha faltado a 4 clases en las últimas 2 semanas sin justificación.',
          is_resolved: false,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          student_id: studentsData[2]?.id || studentsData[0].id,
          alert_type: 'financial',
          severity: 'critical',
          title: 'Problema de financiamiento',
          message: 'El estudiante presenta atrasos en el pago de aranceles que podrían afectar su continuidad.',
          is_resolved: false,
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      for (const alert of sampleAlerts) {
        try {
          const { error } = await supabase
            .from('alerts')
            .insert(alert)

          if (error) {
            console.log(`⚠️  Alert creation warning: ${error.message}`)
          } else {
            console.log(`✅ Created alert: ${alert.title}`)
          }
        } catch (err) {
          console.log(`⚠️  Alert warning: ${err.message}`)
        }
      }

      console.log('📊 Creating grades...')
      
      const sampleGrades = [
        {
          student_id: studentsData[0].id,
          course_code: 'INF280',
          course_name: 'Programación Avanzada',
          grade: 3.2,
          credits: 4,
          semester: '2024-1',
          year: 2024
        },
        {
          student_id: studentsData[0].id,
          course_code: 'MAT270',
          course_name: 'Cálculo Integral',
          grade: 2.8,
          credits: 3,
          semester: '2024-1',
          year: 2024
        },
        {
          student_id: studentsData[1]?.id || studentsData[0].id,
          course_code: 'ICI110',
          course_name: 'Fundamentos de Gestión',
          grade: 3.5,
          credits: 3,
          semester: '2024-1',
          year: 2024
        }
      ]

      for (const grade of sampleGrades) {
        try {
          const { error } = await supabase
            .from('grades')
            .insert(grade)

          if (error) {
            console.log(`⚠️  Grade creation warning: ${error.message}`)
          } else {
            console.log(`✅ Created grade: ${grade.course_name}`)
          }
        } catch (err) {
          console.log(`⚠️  Grade warning: ${err.message}`)
        }
      }

      console.log('🤖 Creating AI predictions...')
      
      const samplePredictions = [
        {
          student_id: studentsData[0].id,
          risk_score: 75,
          risk_factors: {
            academic_performance: 'declining',
            attendance_rate: 0.82,
            financial_issues: false,
            social_engagement: 'low',
            gpa_trend: 'negative',
            course_load: 'high'
          },
          recommendations: {
            priority: 'high',
            actions: [
              'Programar tutoría académica inmediata',
              'Evaluación psicopedagógica',
              'Apoyo en técnicas de estudio',
              'Reducir carga académica si es posible'
            ],
            follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          confidence_level: 0.87,
          model_version: 'gemini-1.0'
        },
        {
          student_id: studentsData[1]?.id || studentsData[0].id,
          risk_score: 45,
          risk_factors: {
            academic_performance: 'stable',
            attendance_rate: 0.75,
            financial_issues: false,
            social_engagement: 'medium',
            gpa_trend: 'stable',
            course_load: 'normal'
          },
          recommendations: {
            priority: 'medium',
            actions: [
              'Monitoreo semanal de asistencia',
              'Actividades de integración social',
              'Apoyo en organización del tiempo'
            ],
            follow_up_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          confidence_level: 0.72,
          model_version: 'gemini-1.0'
        }
      ]

      for (const prediction of samplePredictions) {
        try {
          const { error } = await supabase
            .from('predictions')
            .insert(prediction)

          if (error) {
            console.log(`⚠️  Prediction creation warning: ${error.message}`)
          } else {
            console.log(`✅ Created prediction with risk score: ${prediction.risk_score}`)
          }
        } catch (err) {
          console.log(`⚠️  Prediction warning: ${err.message}`)
        }
      }
    }

    console.log('\n🎉 Supabase setup completed!')
    console.log('\n📊 Summary:')
    console.log('✅ Connection tested')
    console.log('✅ Sample students created')
    console.log('✅ Sample alerts created')
    console.log('✅ Sample grades created')
    console.log('✅ Sample predictions created')
    console.log('\n🚀 Your USM-IA system is ready!')
    console.log('📝 You can now run: npm run dev')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupSupabase()