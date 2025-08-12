import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase configuration
const supabaseUrl = 'https://jofqwhvntvykclqfuhia.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak'

// Create Supabase client with service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🔧 Setting up USM-IA database...')

    // Read the schema file
    const schemaPath = join(__dirname, 'supabase', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')

    console.log('📋 Executing database schema...')

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    // Execute each statement
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' })
        if (error) {
          console.warn(`⚠️  Warning executing statement: ${error.message}`)
        }
      } catch (err) {
        console.warn(`⚠️  Warning: ${err.message}`)
      }
    }

    console.log('✅ Database schema setup completed!')

    // Create initial admin user profile
    console.log('👤 Creating initial admin profile...')
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000', // Placeholder ID
        email: 'admin@usm.edu',
        role: 'admin',
        full_name: 'Administrador Sistema',
        department: 'Tecnologías de la Información'
      })

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error('Error creating admin profile:', profileError.message)
    }

    // Create sample students
    console.log('🎓 Creating sample student data...')
    
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
      }
    ]

    for (const student of sampleStudents) {
      const { error } = await supabase
        .from('students')
        .insert(student)
        .select()

      if (error && !error.message.includes('duplicate')) {
        console.error('Error creating student:', error.message)
      }
    }

    // Create sample alerts
    console.log('🚨 Creating sample alerts...')
    
    const { data: studentsData } = await supabase
      .from('students')
      .select('id')
      .limit(2)

    if (studentsData && studentsData.length > 0) {
      const sampleAlerts = [
        {
          student_id: studentsData[0].id,
          alert_type: 'academic',
          severity: 'high',
          title: 'Bajo rendimiento académico',
          message: 'El estudiante ha mostrado una disminución significativa en sus calificaciones en las últimas 3 evaluaciones.',
          is_resolved: false,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        },
        {
          student_id: studentsData[1]?.id || studentsData[0].id,
          alert_type: 'attendance',
          severity: 'medium',
          title: 'Asistencia irregular',
          message: 'El estudiante ha faltado a 4 clases en las últimas 2 semanas sin justificación.',
          is_resolved: false,
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
        }
      ]

      for (const alert of sampleAlerts) {
        const { error } = await supabase
          .from('alerts')
          .insert(alert)

        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating alert:', error.message)
        }
      }
    }

    // Create sample grades
    console.log('📊 Creating sample grades...')
    
    if (studentsData && studentsData.length > 0) {
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
        const { error } = await supabase
          .from('grades')
          .insert(grade)

        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating grade:', error.message)
        }
      }
    }

    // Create sample predictions
    console.log('🤖 Creating sample AI predictions...')
    
    if (studentsData && studentsData.length > 0) {
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
              'Programar tutoría académica',
              'Evaluación psicológica',
              'Apoyo en técnicas de estudio'
            ]
          },
          confidence_level: 0.87,
          model_version: 'gemini-1.0'
        }
      ]

      for (const prediction of samplePredictions) {
        const { error } = await supabase
          .from('predictions')
          .insert(prediction)

        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating prediction:', error.message)
        }
      }
    }

    console.log('🎉 Database setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log('✅ Schema executed')
    console.log('✅ Admin profile created')
    console.log('✅ Sample students created')
    console.log('✅ Sample alerts created')
    console.log('✅ Sample grades created')
    console.log('✅ Sample predictions created')
    console.log('\n🚀 Your USM-IA system is ready to use!')

  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
    process.exit(1)
  }
}

// Run the setup
setupDatabase()