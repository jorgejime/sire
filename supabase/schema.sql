-- USM-IA: Sistema Inteligente de Retención Estudiantil
-- Esquema de base de datos PostgreSQL para Supabase

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos de datos personalizados
CREATE TYPE user_role AS ENUM ('student', 'coordinator', 'admin', 'counselor');
CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'dropped');
CREATE TYPE alert_type AS ENUM ('academic', 'attendance', 'behavioral', 'financial', 'technical');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE intervention_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
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
CREATE TABLE students (
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
CREATE TABLE attendance (
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
CREATE TABLE grades (
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
CREATE TABLE alerts (
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
CREATE TABLE predictions (
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
CREATE TABLE interventions (
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
CREATE TABLE chat_conversations (
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
CREATE TABLE audit_log (
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
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_alerts_student_id ON alerts(student_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_unresolved ON alerts(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_predictions_student_id ON predictions(student_id);
CREATE INDEX idx_predictions_risk_score ON predictions(risk_score);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_grades_student_semester ON grades(student_id, semester, year);

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
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Estudiantes: estudiantes ven sus datos, staff ve según permisos
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Alertas: solo staff autorizado puede gestionar
CREATE POLICY "Staff can manage alerts" ON alerts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Predicciones: solo staff puede ver predicciones
CREATE POLICY "Staff can view predictions" ON predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
        )
    );

-- Chat: estudiantes pueden ver sus conversaciones, staff puede ver todas
CREATE POLICY "Chat access policy" ON chat_conversations
    FOR ALL USING (
        (EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'counselor')
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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER audit_profiles_trigger AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_alerts_trigger AFTER INSERT OR UPDATE OR DELETE ON alerts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_interventions_trigger AFTER INSERT OR UPDATE OR DELETE ON interventions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();