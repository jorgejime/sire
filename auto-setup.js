import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabaseUrl = 'https://jofqwhvntvykclqfuhia.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function executeSQL(sql) {
  try {
    // Try to execute via RPC if available, otherwise skip
    console.log('🔄 Attempting to execute SQL...')
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ query: sql })
    })

    if (response.ok) {
      console.log('✅ SQL executed successfully')
      return true
    } else {
      console.log('⚠️  SQL execution via API not available, manual execution required')
      return false
    }
  } catch (error) {
    console.log('⚠️  SQL execution via API not available, manual execution required')
    return false
  }
}

async function setupComplete() {
  console.log('🚀 USM-IA Supabase Backend Setup')
  console.log('================================\n')

  // Test connection
  console.log('1️⃣  Testing Supabase connection...')
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (!error) {
      console.log('✅ Connection successful - Tables exist!')
      await setupSampleData()
      return
    }
  } catch (err) {
    console.log('⚠️  Tables do not exist yet')
  }

  // Try to execute schema automatically
  console.log('\n2️⃣  Attempting automatic schema setup...')
  try {
    const schema = readFileSync('execute-schema.sql', 'utf8')
    const executed = await executeSQL(schema)
    
    if (!executed) {
      console.log('\n📋 MANUAL SETUP REQUIRED')
      console.log('======================')
      console.log('Please follow these steps:')
      console.log('1. Go to https://supabase.com/dashboard/project/jofqwhvntvykclqfuhia')
      console.log('2. Click on "SQL Editor" in the left sidebar')
      console.log('3. Click "New Query"')
      console.log('4. Copy the contents of execute-schema.sql file')
      console.log('5. Paste it in the SQL editor')
      console.log('6. Click "Run" to execute the schema')
      console.log('7. After execution, run: npm run setup:data')
      console.log('\n📁 File location: C:\\Users\\DELL\\usm-ia\\execute-schema.sql')
      return
    }
  } catch (error) {
    console.log('❌ Could not read schema file')
  }

  // Setup sample data
  console.log('\n3️⃣  Setting up sample data...')
  await setupSampleData()
}

async function setupSampleData() {
  try {
    console.log('📊 Creating sample data...')
    
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
      const { error } = await supabase
        .from('students')
        .upsert(student, { onConflict: 'student_code' })

      if (error && !error.message.includes('duplicate')) {
        console.log(`⚠️  ${student.student_code}: ${error.message}`)
      } else {
        console.log(`✅ Created/Updated: ${student.student_code}`)
      }
    }

    // Get student IDs for related data
    const { data: studentsData } = await supabase
      .from('students')
      .select('id, student_code')

    if (studentsData && studentsData.length > 0) {
      // Create alerts
      console.log('🚨 Creating alerts...')
      const sampleAlerts = [
        {
          student_id: studentsData[0].id,
          alert_type: 'academic',
          severity: 'high',
          title: 'Bajo rendimiento académico',
          message: 'El estudiante ha mostrado una disminución significativa en sus calificaciones.',
          is_resolved: false,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          student_id: studentsData[1]?.id || studentsData[0].id,
          alert_type: 'attendance',
          severity: 'medium',
          title: 'Asistencia irregular',
          message: 'Faltas frecuentes sin justificación en las últimas semanas.',
          is_resolved: false,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      for (const alert of sampleAlerts) {
        const { error } = await supabase.from('alerts').insert(alert)
        if (error) {
          console.log(`⚠️  Alert: ${error.message}`)
        } else {
          console.log(`✅ Created alert: ${alert.title}`)
        }
      }

      // Create grades
      console.log('📚 Creating grades...')
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
        }
      ]

      for (const grade of sampleGrades) {
        const { error } = await supabase.from('grades').insert(grade)
        if (error) {
          console.log(`⚠️  Grade: ${error.message}`)
        } else {
          console.log(`✅ Created grade: ${grade.course_name}`)
        }
      }

      // Create predictions
      console.log('🤖 Creating AI predictions...')
      const samplePredictions = [
        {
          student_id: studentsData[0].id,
          risk_score: 75,
          risk_factors: {
            academic_performance: 'declining',
            attendance_rate: 0.82,
            financial_issues: false,
            social_engagement: 'low'
          },
          recommendations: {
            priority: 'high',
            actions: [
              'Tutoría académica',
              'Evaluación psicopedagógica',
              'Apoyo en técnicas de estudio'
            ]
          },
          confidence_level: 0.87,
          model_version: 'gemini-1.0'
        }
      ]

      for (const prediction of samplePredictions) {
        const { error } = await supabase.from('predictions').insert(prediction)
        if (error) {
          console.log(`⚠️  Prediction: ${error.message}`)
        } else {
          console.log(`✅ Created prediction with risk score: ${prediction.risk_score}`)
        }
      }
    }

    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`✅ ${studentsData?.length || 0} students created`)
    console.log('✅ Sample alerts created')
    console.log('✅ Sample grades created')
    console.log('✅ Sample predictions created')
    console.log('\n🚀 You can now run: npm run dev')

  } catch (error) {
    console.error('❌ Error in sample data setup:', error.message)
  }
}

// Add package.json type module check
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  if (!packageJson.type || packageJson.type !== 'module') {
    console.log('📦 Adding module type to package.json...')
    packageJson.type = 'module'
    import('fs').then(fs => {
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
    })
  }
} catch (err) {
  console.log('⚠️  Could not update package.json')
}

// Run setup
setupComplete()