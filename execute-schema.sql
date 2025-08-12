-- USM-IA: Sistema Inteligente de Retención Estudiantil
-- Esquema de base de datos PostgreSQL para Supabase
-- Execute this SQL in the Supabase SQL Editor

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos de datos personalizados
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'coordinator', 'admin', 'counselor');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_status') THEN
        CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'dropped');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
        CREATE TYPE alert_type AS ENUM ('academic', 'attendance', 'behavioral', 'financial', 'technical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_level') THEN
        CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intervention_status') THEN
        CREATE TYPE intervention_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    END IF;
END
$$;

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name VARCHAR NOT NULL,
    department VARCHAR,
    phone VARCHAR,
    avatar_url VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) UNIQUE,
    student_code VARCHAR UNIQUE NOT NULL,
    career VARCHAR NOT NULL,
    semester INTEGER CHECK (semester >= 1 AND semester <= 12),
    gpa DECIMAL(3,2) CHECK (gpa >= 0 AND gpa <= 4.0),
    credits_completed INTEGER DEFAULT 0,
    credits_enrolled INTEGER DEFAULT 0,
    enrollment_date DATE NOT NULL,
    expected_graduation DATE,
    status student_status DEFAULT 'active',
    emergency_contact JSONB,
    academic_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_code VARCHAR NOT NULL,
    date DATE NOT NULL,
    present BOOLEAN NOT NULL DEFAULT FALSE,
    late_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_code VARCHAR NOT NULL,
    course_name VARCHAR NOT NULL,
    grade DECIMAL(3,2) CHECK (grade >= 0 AND grade <= 4.0),
    credits INTEGER DEFAULT 3,
    semester VARCHAR NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    alert_type alert_type NOT NULL,
    severity severity_level NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de predicciones de IA
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB,
    recommendations JSONB,
    confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
    model_version VARCHAR DEFAULT 'gemini-1.0',
    prediction_date TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Tabla de intervenciones
CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES alerts(id),
    assigned_to UUID REFERENCES profiles(id),
    intervention_type VARCHAR NOT NULL,
    description TEXT NOT NULL,
    status intervention_status DEFAULT 'pending',
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    results TEXT,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de conversaciones del chatbot
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]',
    sentiment_score DECIMAL(3,2) DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR NOT NULL,
    table_name VARCHAR NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_alerts_student_id ON alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_predictions_student_id ON predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_score ON predictions(risk_score);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_grades_student_semester ON grades(student_id, semester, year);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad RLS
-- Perfiles: usuarios pueden ver y editar su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Permitir inserción de perfiles para nuevos usuarios
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Estudiantes: estudiantes ven sus datos, staff ve según permisos
DROP POLICY IF EXISTS "Students can view own data" ON students;
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Staff puede insertar y actualizar estudiantes
DROP POLICY IF EXISTS "Staff can manage students" ON students;
CREATE POLICY "Staff can manage students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Alertas: solo staff autorizado puede gestionar
DROP POLICY IF EXISTS "Staff can manage alerts" ON alerts;
CREATE POLICY "Staff can manage alerts" ON alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Predicciones: solo staff puede ver predicciones
DROP POLICY IF EXISTS "Staff can view predictions" ON predictions;
CREATE POLICY "Staff can view predictions" ON predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

DROP POLICY IF EXISTS "Staff can manage predictions" ON predictions;
CREATE POLICY "Staff can manage predictions" ON predictions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Chat: estudiantes pueden ver sus conversaciones, staff puede ver todas
DROP POLICY IF EXISTS "Chat access policy" ON chat_conversations;
CREATE POLICY "Chat access policy" ON chat_conversations
    FOR ALL USING (
        (EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Calificaciones: estudiantes ven sus calificaciones, staff puede gestionar todas
DROP POLICY IF EXISTS "Students can view own grades" ON grades;
CREATE POLICY "Students can view own grades" ON grades
    FOR SELECT USING (
        (EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

DROP POLICY IF EXISTS "Staff can manage grades" ON grades;
CREATE POLICY "Staff can manage grades" ON grades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Asistencia: similar a calificaciones
DROP POLICY IF EXISTS "Students can view own attendance" ON attendance;
CREATE POLICY "Students can view own attendance" ON attendance
    FOR SELECT USING (
        (EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

DROP POLICY IF EXISTS "Staff can manage attendance" ON attendance;
CREATE POLICY "Staff can manage attendance" ON attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Intervenciones: solo staff puede gestionar
DROP POLICY IF EXISTS "Staff can manage interventions" ON interventions;
CREATE POLICY "Staff can manage interventions" ON interventions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Auditoría: solo admin puede ver logs
DROP POLICY IF EXISTS "Admin can view audit_log" ON audit_log;
CREATE POLICY "Admin can view audit_log" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Funciones auxiliares
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interventions_updated_at ON interventions;
CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para auditoría automática
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id, action, table_name, record_id, old_values, new_values
    ) VALUES (
        auth.uid(), 
        TG_OP, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), 
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar auditoría a tablas críticas
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_alerts_trigger ON alerts;
CREATE TRIGGER audit_alerts_trigger AFTER INSERT OR UPDATE OR DELETE ON alerts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

DROP TRIGGER IF EXISTS audit_interventions_trigger ON interventions;
CREATE TRIGGER audit_interventions_trigger AFTER INSERT OR UPDATE OR DELETE ON interventions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();