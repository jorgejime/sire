# SIRE - Sistema Inteligente de Retención Estudiantil

Sistema completo de retención estudiantil con inteligencia artificial para universidades, desarrollado con tecnologías modernas y enfoque en la experiencia del usuario.

## 🚀 Características Principales

### Para Estudiantes
- **Dashboard personalizado** con métricas académicas
- **Chatbot inteligente** con soporte emocional y académico 24/7
- **Sistema de alertas** personalizadas
- **Seguimiento de progreso** académico

### Para Coordinadores y Staff
- **Análisis predictivo** de riesgo de deserción con IA
- **Dashboard administrativo** con métricas en tiempo real
- **Sistema de alertas automáticas** para intervenciones tempranas
- **Gestión de intervenciones** y seguimiento
- **Reportes detallados** y analytics

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticación**: Supabase Auth + Row Level Security
- **IA**: Google Gemini API para análisis predictivo y chatbot
- **Tiempo Real**: Supabase Realtime para alertas y notificaciones
- **Visualizaciones**: Recharts para gráficos y métricas
- **UI/UX**: Lucide React icons + Headless UI

## 📊 Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Google AI     │
│   React + TS    │◄──►│   PostgreSQL    │◄──►│   Gemini API    │
│   Tailwind CSS  │    │   Edge Functions│    │   Análisis IA   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Estructura de Base de Datos

- **profiles**: Perfiles de usuarios (estudiantes, coordinadores, admin)
- **students**: Datos académicos detallados de estudiantes
- **alerts**: Sistema de alertas automáticas
- **predictions**: Predicciones de IA sobre riesgo de deserción
- **interventions**: Intervenciones y seguimientos
- **chat_conversations**: Historial de conversaciones con chatbot
- **audit_log**: Auditoría completa del sistema

## ⚡ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- Cuenta de Supabase
- Google Gemini API Key

### 1. Clonar el repositorio
```bash
git clone https://github.com/jorgejime/sire.git
cd sire
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 4. Configurar Supabase

#### Crear proyecto en Supabase
1. Crear nuevo proyecto en [supabase.com](https://supabase.com)
2. Ejecutar el schema SQL:
```bash
# Copiar contenido de supabase/schema.sql
# Pegarlo en el SQL Editor de Supabase
```

#### Configurar Edge Functions
```bash
# Instalar Supabase CLI
npm install -g @supabase/cli

# Desplegar funciones
supabase functions deploy risk-prediction
supabase functions deploy ai-chat

# Configurar secrets
supabase secrets set GEMINI_API_KEY=your_key_here
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🔐 Seguridad y Privacidad

### Row Level Security (RLS)
- Políticas granulares de acceso a datos
- Estudiantes solo ven su información
- Staff ve datos según permisos de rol

### Cumplimiento FERPA
- Encriptación de datos sensibles
- Logs de auditoría completos
- Controles de acceso estrictos
- Políticas de retención de datos

### Privacidad del Chat
- Conversaciones encriptadas
- Análisis de sentimiento para detectar crisis
- Escalamiento automático a profesionales

## 🤖 Funcionalidades de IA

### Análisis Predictivo
- **Score de riesgo** (0-100) basado en múltiples factores
- **Factores de riesgo** identificados automáticamente
- **Recomendaciones personalizadas** de intervención
- **Alertas automáticas** para casos de alto riesgo

### Chatbot Inteligente
- **Soporte 24/7** para estudiantes
- **Detección de crisis** emocional automática
- **Recursos académicos** contextualizados
- **Escalamiento inteligente** a consejeros

## 📈 Métricas y Analytics

### Dashboard Estudiantil
- GPA actual y tendencias
- Progreso por semestre
- Alertas activas
- Recursos recomendados

### Dashboard Staff
- Estudiantes por carrera
- Distribución de riesgo
- Alertas pendientes
- Tasa de retención
- Efectividad de intervenciones

## 🔄 Estados de Alertas

- **Pendiente**: Alerta creada, esperando acción
- **En Proceso**: Intervención iniciada
- **Resuelta**: Situación addressed satisfactoriamente
- **Escalada**: Requiere atención especializada

## 🚨 Sistema de Intervenciones

1. **Detección automática** de riesgo por IA
2. **Creación de alerta** con priorización
3. **Asignación** a coordinador/consejero
4. **Seguimiento** del progreso
5. **Evaluación** de efectividad

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Type checking
npm run typecheck
```

## 📱 Responsive Design

- **Mobile-first** approach
- **Adaptable** a tablets y desktop
- **Accesibilidad** WCAG 2.1 AA
- **Performance optimizado**

## 🌐 Deployment

### Supabase + Vercel (Recomendado)
1. **Conectar repositorio** a Vercel
2. **Configurar variables** de entorno
3. **Deploy automático** en cada push

### Variables de Entorno para Producción
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]
- **Email**: soporte@sire.com

---

**SIRE** - Transformando la retención estudiantil con inteligencia artificial 🎓✨