/**
 * Configuration file for Supabase setup
 * This file contains all the necessary configuration for automated setup
 */

export const SUPABASE_CONFIG = {
  // Project Configuration
  url: 'https://jofqwhvntvykclqfuhia.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak',
  
  // Default users to create
  defaultUsers: [
    {
      email: 'admin@usm.cl',
      password: 'admin123456',
      role: 'admin',
      full_name: 'Administrador Sistema',
      department: 'Tecnologías de la Información',
      phone: '+56912345678'
    },
    {
      email: 'coordinador@usm.cl',
      password: 'coord123456',
      role: 'coordinator',
      full_name: 'María González Pérez',
      department: 'Coordinación Académica',
      phone: '+56987654321'
    },
    {
      email: 'consejero@usm.cl',
      password: 'consejero123',
      role: 'counselor',
      full_name: 'Dr. Pedro Sánchez López',
      department: 'Bienestar Estudiantil',
      phone: '+56956789012'
    },
    {
      email: 'estudiante1@usm.cl',
      password: 'estudiante123',
      role: 'student',
      full_name: 'Ana Torres Morales',
      department: 'Ingeniería en Informática',
      phone: '+56923456789'
    },
    {
      email: 'estudiante2@usm.cl',
      password: 'estudiante123',
      role: 'student',
      full_name: 'Carlos Méndez Silva',
      department: 'Ingeniería en Informática',
      phone: '+56934567890'
    },
    {
      email: 'estudiante3@usm.cl',
      password: 'estudiante123',
      role: 'student',
      full_name: 'Isabella Rodriguez',
      department: 'Ingeniería Civil',
      phone: '+56945678901'
    }
  ],

  // Sample courses for data generation
  sampleCourses: [
    { code: 'INF-280', name: 'Estructuras de Datos', credits: 4 },
    { code: 'MAT-021', name: 'Cálculo I', credits: 6 },
    { code: 'FIS-100', name: 'Física I', credits: 4 },
    { code: 'INF-134', name: 'Programación', credits: 4 },
    { code: 'ELO-320', name: 'Sistemas Digitales', credits: 3 },
    { code: 'INF-225', name: 'Bases de Datos', credits: 4 },
    { code: 'MAT-022', name: 'Cálculo II', credits: 6 },
    { code: 'INF-239', name: 'Redes de Computadores', credits: 4 }
  ],

  // Career options
  careers: [
    'Ingeniería en Informática',
    'Ingeniería Civil',
    'Ingeniería Industrial',
    'Ingeniería Comercial',
    'Arquitectura'
  ],

  // Auth settings to configure
  authSettings: {
    site_url: 'http://localhost:5173',
    jwt_expiry: 3600,
    refresh_token_rotation_enabled: true,
    double_confirm_email_change_enabled: true,
    enable_signup: true,
    password_min_length: 8
  }
};

export const DATABASE_FUNCTIONS = {
  // Custom SQL functions to create
  functions: [
    {
      name: 'get_student_risk_score',
      sql: `
        CREATE OR REPLACE FUNCTION get_student_risk_score(student_uuid UUID)
        RETURNS INTEGER AS $$
        DECLARE
            risk_score INTEGER := 0;
            avg_gpa DECIMAL;
            attendance_rate DECIMAL;
            alert_count INTEGER;
        BEGIN
            -- Get student GPA
            SELECT gpa INTO avg_gpa FROM students WHERE id = student_uuid;
            
            -- Calculate attendance rate (last 30 days)
            SELECT 
                COALESCE(AVG(CASE WHEN present THEN 1 ELSE 0 END) * 100, 90)
            INTO attendance_rate
            FROM attendance 
            WHERE student_id = student_uuid 
            AND date >= NOW() - INTERVAL '30 days';
            
            -- Count unresolved alerts
            SELECT COUNT(*) INTO alert_count
            FROM alerts 
            WHERE student_id = student_uuid AND is_resolved = FALSE;
            
            -- Calculate risk score
            risk_score := 
                CASE 
                    WHEN avg_gpa < 2.0 THEN 40
                    WHEN avg_gpa < 2.5 THEN 25
                    WHEN avg_gpa < 3.0 THEN 15
                    ELSE 5
                END +
                CASE 
                    WHEN attendance_rate < 70 THEN 30
                    WHEN attendance_rate < 80 THEN 20
                    WHEN attendance_rate < 90 THEN 10
                    ELSE 0
                END +
                (alert_count * 10);
            
            RETURN LEAST(risk_score, 100);
        END;
        $$ LANGUAGE plpgsql;
      `
    },
    {
      name: 'update_student_predictions',
      sql: `
        CREATE OR REPLACE FUNCTION update_student_predictions()
        RETURNS void AS $$
        DECLARE
            student_record RECORD;
            calculated_risk INTEGER;
            risk_factors JSONB;
            recommendations JSONB;
        BEGIN
            FOR student_record IN SELECT * FROM students WHERE status = 'active' LOOP
                -- Calculate risk score
                calculated_risk := get_student_risk_score(student_record.id);
                
                -- Build risk factors
                risk_factors := json_build_object(
                    'gpa', CASE 
                        WHEN student_record.gpa < 2.0 THEN 'high'
                        WHEN student_record.gpa < 2.5 THEN 'medium'
                        ELSE 'low'
                    END,
                    'attendance', CASE 
                        WHEN calculated_risk > 50 THEN 'high'
                        WHEN calculated_risk > 25 THEN 'medium'
                        ELSE 'low'
                    END
                );
                
                -- Build recommendations
                recommendations := json_build_object(
                    'tutoring', calculated_risk > 40,
                    'counseling', calculated_risk > 60,
                    'academic_support', calculated_risk > 30,
                    'financial_aid', calculated_risk > 70
                );
                
                -- Insert or update prediction
                INSERT INTO predictions (
                    student_id, risk_score, risk_factors, recommendations, confidence_level
                ) VALUES (
                    student_record.id, calculated_risk, risk_factors, recommendations, 0.85
                )
                ON CONFLICT (student_id) 
                DO UPDATE SET
                    risk_score = EXCLUDED.risk_score,
                    risk_factors = EXCLUDED.risk_factors,
                    recommendations = EXCLUDED.recommendations,
                    confidence_level = EXCLUDED.confidence_level,
                    prediction_date = NOW(),
                    expires_at = NOW() + INTERVAL '30 days';
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
      `
    }
  ]
};