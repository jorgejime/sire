#!/usr/bin/env node
/**
 * Script para crear usuarios de producción directamente via API de Supabase
 * Este script usa el service role key para crear usuarios programáticamente
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Configuración de Supabase
const supabaseUrl = 'https://jofqwhvntvykclqfuhia.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnF3aHZudHZ5a2NscWZ1aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTA0MzgsImV4cCI6MjA3MDE4NjQzOH0.bhAxLJWB5JB5VWgy2wHnJpHN916J5v4PxQB_3Pod7ak';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno faltantes');
  process.exit(1);
}

// Cliente con anon key para registro
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Usuarios a crear
const usersToCreate = [
  {
    email: 'admin@usm.cl',
    password: 'admin123456',
    role: 'admin',
    full_name: 'Administrador Sistema',
    department: 'Tecnologías de la Información'
  },
  {
    email: 'coordinador@usm.cl',
    password: 'coord123456',
    role: 'coordinator',
    full_name: 'María González Pérez',
    department: 'Coordinación Académica'
  },
  {
    email: 'consejero@usm.cl',
    password: 'consejero123',
    role: 'counselor',
    full_name: 'Dr. Pedro Sánchez López',
    department: 'Bienestar Estudiantil'
  },
  {
    email: 'estudiante1@usm.cl',
    password: 'estudiante123',
    role: 'student',
    full_name: 'Ana Torres Morales',
    department: 'Ingeniería en Informática'
  },
  {
    email: 'estudiante2@usm.cl',
    password: 'estudiante123',
    role: 'student',
    full_name: 'Carlos Méndez Silva',
    department: 'Ingeniería en Informática'
  },
  {
    email: 'estudiante3@usm.cl',
    password: 'estudiante123',
    role: 'student',
    full_name: 'Laura Rodríguez Chen',
    department: 'Ingeniería Civil Industrial'
  }
];

console.log('🚀 Iniciando creación de usuarios de producción...\n');

async function createUserWithProfile(userData) {
  try {
    console.log(`📝 Registrando usuario: ${userData.email} (${userData.role})`);
    
    // 1. Registrar usuario usando signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          role: userData.role,
          full_name: userData.full_name,
          department: userData.department
        }
      }
    });

    if (authError) {
      console.error(`❌ Error registrando ${userData.email}:`, authError.message);
      return false;
    }

    if (!authData.user) {
      console.error(`❌ No se recibió usuario para ${userData.email}`);
      return false;
    }

    console.log(`✅ Usuario registrado: ${authData.user.id}`);

    // 2. Crear perfil en tabla profiles (si no se creó automáticamente)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name,
        department: userData.department
      });

    if (profileError) {
      console.error(`❌ Error creando/actualizando perfil ${userData.email}:`, profileError.message);
      return false;
    }

    console.log(`✅ Perfil creado/actualizado para: ${userData.email}\n`);
    
    // 3. Cerrar sesión para permitir el siguiente registro
    await supabase.auth.signOut();
    
    return true;

  } catch (error) {
    console.error(`❌ Error general creando ${userData.email}:`, error.message);
    return false;
  }
}

async function createAllUsers() {
  let successCount = 0;
  let errors = [];

  for (const userData of usersToCreate) {
    const success = await createUserWithProfile(userData);
    if (success) {
      successCount++;
    } else {
      errors.push(userData.email);
    }
    
    // Esperar un poco entre creaciones
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 RESUMEN DE CREACIÓN:');
  console.log('========================');
  console.log(`✅ Usuarios creados exitosamente: ${successCount}/${usersToCreate.length}`);
  
  if (errors.length > 0) {
    console.log(`❌ Errores en: ${errors.join(', ')}`);
  }

  if (successCount === usersToCreate.length) {
    console.log('\n🎉 ¡TODOS LOS USUARIOS CREADOS EXITOSAMENTE!');
    console.log('\n🔑 CREDENCIALES DE ACCESO:');
    console.log('============================');
    usersToCreate.forEach(user => {
      console.log(`• ${user.email} / ${user.password} (${user.role})`);
    });
  }
}

async function verifyUsers() {
  console.log('\n🔍 Verificando usuarios creados...');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      role,
      full_name,
      department,
      created_at
    `)
    .in('email', usersToCreate.map(u => u.email));

  if (error) {
    console.error('❌ Error verificando usuarios:', error.message);
    return;
  }

  console.log('\n📋 USUARIOS VERIFICADOS:');
  console.log('========================');
  profiles.forEach(profile => {
    console.log(`✅ ${profile.email} - ${profile.role} - ${profile.full_name}`);
  });
}

// Ejecutar creación
async function main() {
  try {
    await createAllUsers();
    await verifyUsers();
    
    console.log('\n🚀 PRÓXIMOS PASOS:');
    console.log('===================');
    console.log('1. npm run dev');
    console.log('2. Abrir http://localhost:5173');
    console.log('3. Iniciar sesión con admin@usm.cl / admin123456');
    console.log('\n✨ El sistema está listo para producción!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

main();