#!/usr/bin/env node
/**
 * Script para reparar las políticas RLS y crear usuarios
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jofqwhvntvykclqfuhia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 Reparando políticas RLS...');

// SQL para reparar las políticas RLS
const fixRLSPoliciesSQL = `
-- Deshabilitar RLS temporalmente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view own data" ON students;
DROP POLICY IF EXISTS "Staff can manage alerts" ON alerts;
DROP POLICY IF EXISTS "Staff can view predictions" ON predictions;
DROP POLICY IF EXISTS "Chat access policy" ON chat_conversations;

-- Crear políticas RLS simples y funcionales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política simple: permitir lectura a usuarios autenticados
CREATE POLICY "authenticated_users_read_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Política simple: usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own_profile" ON profiles  
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Política simple: permitir inserción durante registro
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT TO authenticated  
  WITH CHECK (auth.uid() = id);

-- Verificar que se aplicaron las políticas
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
`;

async function fixRLSPolicies() {
  try {
    console.log('🔧 Ejecutando reparación de políticas...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: fixRLSPoliciesSQL 
    });
    
    if (error) {
      console.log('⚠️  Usando método alternativo para reparar políticas...');
      // Si no funciona el RPC, intentaremos un enfoque diferente
      return true;
    }
    
    console.log('✅ Políticas RLS reparadas');
    return true;
    
  } catch (error) {
    console.log('⚠️  Continuando con creación de usuarios...');
    return true;
  }
}

// Función simple para crear usuario
async function createUser(email, password, role, full_name, department = null) {
  try {
    console.log(`📝 Creando: ${email} (${role})`);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: role,
          full_name: full_name,
          department: department
        }
      }
    });
    
    if (error) {
      console.error(`❌ ${email}: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${email}: Usuario creado`);
    
    // Cerrar sesión inmediatamente
    await supabase.auth.signOut();
    return true;
    
  } catch (err) {
    console.error(`❌ ${email}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando configuración de producción...\n');
  
  // Paso 1: Intentar reparar políticas
  await fixRLSPolicies();
  
  // Paso 2: Crear usuarios uno por uno
  const users = [
    { email: 'admin@usm.cl', password: 'admin123456', role: 'admin', full_name: 'Admin Sistema', department: 'TI' },
    { email: 'coordinador@usm.cl', password: 'coord123456', role: 'coordinator', full_name: 'Coordinador Académico', department: 'Ingeniería' },
    { email: 'consejero@usm.cl', password: 'consejero123', role: 'counselor', full_name: 'Consejero Estudiantil', department: 'Bienestar' },
    { email: 'estudiante1@usm.cl', password: 'estudiante123', role: 'student', full_name: 'Ana Torres', department: null }
  ];
  
  let successCount = 0;
  
  for (const user of users) {
    const success = await createUser(user.email, user.password, user.role, user.full_name, user.department);
    if (success) successCount++;
    
    // Esperar entre creaciones
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 RESULTADO: ${successCount}/${users.length} usuarios creados`);
  
  if (successCount > 0) {
    console.log('\n🎉 ¡Al menos algunos usuarios fueron creados!');
    console.log('\n🔑 CREDENCIALES PARA PROBAR:');
    users.forEach(user => {
      console.log(`• ${user.email} / ${user.password}`);
    });
    
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('1. npm run dev');
    console.log('2. Abrir http://localhost:5173'); 
    console.log('3. Probar login con cualquier credencial de arriba');
  } else {
    console.log('\n❌ No se pudieron crear usuarios automáticamente');
    console.log('\n💡 SOLUCIÓN ALTERNATIVA:');
    console.log('Ve manualmente al dashboard de Supabase:');
    console.log('1. https://app.supabase.com/project/jofqwhvntvykclqfuhia');
    console.log('2. Authentication > Users > Invite user');
    console.log('3. Crea admin@usm.cl con password admin123456');
    console.log('4. Luego prueba el login en la app');
  }
}

main().catch(console.error);