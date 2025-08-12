# USM-IA Supabase Setup Instructions

## 🚀 Complete Backend Configuration Guide

This document provides step-by-step instructions to set up the complete Supabase backend for the USM-IA Student Retention System.

## 📋 Prerequisites

- Node.js and npm installed
- Access to the Supabase project: https://supabase.com/dashboard/project/jofqwhvntvykclqfuhia

## ⚡ Quick Setup (2 steps)

### Step 1: Execute Database Schema

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/jofqwhvntvykclqfuhia/sql)
2. Click "New Query"
3. Copy the entire contents of `execute-schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute

### Step 2: Create Sample Data

Run the following command in your terminal:

```bash
npm run setup:data
```

## 🔧 What Has Been Configured

### 1. Environment Variables (✅ Complete)

The `.env` file has been updated with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://jofqwhvntvykclqfuhia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak
```

### 2. Supabase Client Configuration (✅ Complete)

- Updated `src/lib/supabase.ts` with proper client configuration
- Added TypeScript types in `src/lib/database.types.ts`
- Removed mock client functionality
- Added helper functions for authentication

### 3. Database Schema (⚠️ Manual Step Required)

The `execute-schema.sql` file contains the complete database schema with:

#### Tables Created:
- `profiles` - User profiles with role-based access
- `students` - Student records with academic data
- `alerts` - Risk alerts and notifications
- `attendance` - Attendance tracking records
- `grades` - Academic grades and performance
- `predictions` - AI risk predictions
- `interventions` - Academic interventions
- `chat_conversations` - Chatbot conversations
- `audit_log` - System audit trail

#### Security Features:
- Row Level Security (RLS) policies for all tables
- Role-based access control (student, coordinator, admin, counselor)
- Automatic audit logging for critical operations
- Data validation constraints and indexes

#### Custom Functions:
- Automatic profile creation on user registration
- Updated timestamp triggers
- Audit trail triggers

### 4. Sample Data (🔄 Automated)

After schema execution, the system will create:

- **3 Sample Students** with different risk profiles:
  - USM2024001 (High Risk - Informática)
  - USM2024002 (Medium Risk - Civil Industrial)  
  - USM2024003 (Low Risk - Comercial)

- **Risk Alerts** for different scenarios:
  - Academic performance alerts
  - Attendance issues
  - Financial problems

- **Academic Records**:
  - Sample grades across multiple courses
  - GPA calculations and trends

- **AI Predictions** with:
  - Risk scores (0-100)
  - Risk factors analysis
  - Personalized recommendations

## 🎯 Available NPM Scripts

```bash
# Start development server
npm run dev

# Complete setup (requires manual schema execution first)
npm run setup:complete

# Create sample data only
npm run setup:data

# Build for production
npm run build
```

## 🔐 Authentication Setup

The system supports multiple authentication methods:

### Email/Password Authentication
```javascript
import { signInWithEmail, signUpWithEmail } from './lib/supabase'

// Sign up new user
await signUpWithEmail('user@email.com', 'password', 'Full Name')

// Sign in existing user
await signInWithEmail('user@email.com', 'password')
```

### User Roles

- **student**: Can view own data and chat with AI
- **counselor**: Can view student data and manage interventions
- **coordinator**: Can manage students and alerts
- **admin**: Full system access including audit logs

## 📊 Database Features

### Real-time Subscriptions

```javascript
// Listen to new alerts
supabase
  .channel('alerts')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => console.log('New alert:', payload)
  )
  .subscribe()
```

### AI Integration

The system integrates with Google Gemini AI for:
- Risk score predictions
- Personalized recommendations
- Chatbot conversations
- Sentiment analysis

### Data Analytics

Pre-built queries for:
- Student retention rates
- Risk factor analysis
- Intervention effectiveness
- Performance trends

## 🚨 Troubleshooting

### Connection Issues

If you see "Could not find the table" errors:
1. Ensure you executed the schema in Supabase SQL Editor
2. Check that all tables are created in the `public` schema
3. Verify RLS policies are enabled

### Authentication Issues

If authentication fails:
1. Check that the Supabase URL and key are correct
2. Ensure the `profiles` table exists
3. Verify the trigger for automatic profile creation is working

### Permission Errors

If you get permission denied errors:
1. Check the user's role in the `profiles` table
2. Verify RLS policies allow the operation
3. Ensure the user is properly authenticated

## 🎓 Usage Examples

### Query Students with Risk Scores

```javascript
const { data: students } = await supabase
  .from('students')
  .select(`
    *,
    predictions:predictions(risk_score, risk_factors),
    alerts:alerts(count)
  `)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
```

### Create New Alert

```javascript
const { data: alert } = await supabase
  .from('alerts')
  .insert({
    student_id: 'uuid-here',
    alert_type: 'academic',
    severity: 'high',
    title: 'Low GPA Warning',
    message: 'Student GPA has dropped below 2.0',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  })
  .select()
  .single()
```

## 📈 Next Steps

After completing the setup:

1. **Deploy Edge Functions** for AI chat and risk prediction
2. **Configure real-time subscriptions** for live updates  
3. **Set up monitoring** and alerting
4. **Add data visualization** dashboards
5. **Implement backup strategies**

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify the Supabase project status
3. Ensure all environment variables are set correctly
4. Check the network tab for failed API requests

---

**🎉 Once setup is complete, your USM-IA Student Retention System will be fully operational with real-time data, AI predictions, and comprehensive student tracking capabilities.**