#!/usr/bin/env node

/**
 * Authentication Fix Script
 * This script fixes common authentication issues by:
 * 1. Creating missing users in auth.users table
 * 2. Setting up proper profiles
 * 3. Configuring authentication settings
 * 4. Testing the fixes
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logError(message) {
  log(`❌ ERROR: ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ SUCCESS: ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  WARNING: ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  INFO: ${message}`, 'blue');
}

// Load environment variables
function loadEnvVars() {
  try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    logError('Could not load .env file');
    throw error;
  }
}

// Users to create
const usersToCreate = [
  { 
    email: 'admin@usm.cl', 
    password: 'admin123456', 
    role: 'admin',
    fullName: 'Administrador Sistema',
    department: 'TI'
  },
  { 
    email: 'coordinador@usm.cl', 
    password: 'coord123456', 
    role: 'coordinator',
    fullName: 'Coordinador Académico',
    department: 'Ingeniería'
  },
  { 
    email: 'consejero@usm.cl', 
    password: 'consejero123', 
    role: 'counselor',
    fullName: 'Consejero Estudiantil',
    department: 'Bienestar Estudiantil'
  },
  { 
    email: 'estudiante1@usm.cl', 
    password: 'estudiante123', 
    role: 'student',
    fullName: 'Estudiante Ejemplo',
    department: null
  }
];

async function createUserWithProfile(supabase, userData) {
  logInfo(`Creating user: ${userData.email}`);
  
  try {
    // First, try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: userData.fullName
      }
    });
    
    if (signUpError) {
      // If user already exists, try to update
      if (signUpError.message.includes('already registered')) {
        logWarning(`User ${userData.email} already exists, attempting to update...`);
        
        // Try to sign in to get user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: userData.password
        });
        
        if (signInError) {
          logError(`Could not sign in existing user ${userData.email}: ${signInError.message}`);
          return false;
        }
        
        if (signInData.user) {
          // Update or create profile
          await createOrUpdateProfile(supabase, signInData.user.id, userData);
          await supabase.auth.signOut();
          logSuccess(`Updated existing user: ${userData.email}`);
          return true;
        }
      } else {
        logError(`Failed to create user ${userData.email}: ${signUpError.message}`);
        return false;
      }
    } else if (signUpData.user) {
      logSuccess(`Created user: ${userData.email} (ID: ${signUpData.user.id})`);
      
      // Create profile
      await createOrUpdateProfile(supabase, signUpData.user.id, userData);
      return true;
    }
  } catch (error) {
    logError(`Error creating user ${userData.email}: ${error.message}`);
    return false;
  }
  
  return false;
}

async function createOrUpdateProfile(supabase, userId, userData) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    const profileData = {
      id: userId,
      email: userData.email,
      full_name: userData.fullName,
      role: userData.role,
      department: userData.department,
      updated_at: new Date().toISOString()
    };
    
    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId);
      
      if (updateError) {
        logError(`Failed to update profile for ${userData.email}: ${updateError.message}`);
      } else {
        logSuccess(`Updated profile for ${userData.email}`);
      }
    } else {
      // Create new profile
      profileData.created_at = new Date().toISOString();
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileData);
      
      if (insertError) {
        logError(`Failed to create profile for ${userData.email}: ${insertError.message}`);
      } else {
        logSuccess(`Created profile for ${userData.email}`);
      }
    }
  } catch (error) {
    logError(`Error managing profile for ${userData.email}: ${error.message}`);
  }
}

async function testUserLogin(supabase, userData) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password
    });
    
    if (error) {
      logError(`Login test failed for ${userData.email}: ${error.message}`);
      return false;
    }
    
    if (data.user) {
      logSuccess(`Login test successful for ${userData.email}`);
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        logWarning(`Profile not found for ${userData.email}`);
      } else {
        logSuccess(`Profile verified for ${userData.email} - Role: ${profile.role}`);
      }
      
      await supabase.auth.signOut();
      return true;
    }
  } catch (error) {
    logError(`Login test error for ${userData.email}: ${error.message}`);
  }
  
  return false;
}

async function setupRLSPolicies(supabase) {
  logInfo('Setting up RLS policies...');
  
  const policies = [
    // Profiles table policies
    `
    -- Enable RLS on profiles
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to read their own profile
    CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
    
    -- Policy for users to update their own profile
    CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
    
    -- Policy for admins to read all profiles
    CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    -- Policy for admins to update all profiles
    CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
    
    -- Policy for coordinators to read profiles
    CREATE POLICY "Coordinators can read profiles" ON profiles
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'coordinator')
      )
    );
    `,
    
    // Students table policies (if exists)
    `
    -- Enable RLS on students (if exists)
    DO $$ BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students') THEN
        ALTER TABLE students ENABLE ROW LEVEL SECURITY;
        
        -- Policy for coordinators and counselors to manage students
        CREATE POLICY "Staff can manage students" ON students
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'counselor')
          )
        );
        
        -- Policy for students to read their own data
        CREATE POLICY "Students can read own data" ON students
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND email = students.email
          )
        );
      END IF;
    END $$;
    `,
    
    // Interventions table policies (if exists)
    `
    -- Enable RLS on interventions (if exists)
    DO $$ BEGIN
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'interventions') THEN
        ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
        
        -- Policy for staff to manage interventions
        CREATE POLICY "Staff can manage interventions" ON interventions
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'coordinator', 'counselor')
          )
        );
      END IF;
    END $$;
    `
  ];
  
  for (const policy of policies) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy });
      if (error) {
        logWarning(`Policy setup warning: ${error.message}`);
      }
    } catch (error) {
      logWarning(`Could not set up some policies: ${error.message}`);
    }
  }
  
  logSuccess('RLS policies setup completed');
}

async function main() {
  logHeader('SUPABASE AUTHENTICATION FIX SCRIPT');
  
  try {
    // 1. Load environment variables
    logHeader('1. Loading Configuration');
    const envVars = loadEnvVars();
    
    const supabaseUrl = envVars.VITE_SUPABASE_URL;
    const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logError('Missing Supabase environment variables');
      process.exit(1);
    }
    
    logSuccess('Configuration loaded successfully');
    
    // 2. Initialize Supabase client
    logHeader('2. Initializing Supabase Client');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      logSuccess('Supabase client initialized successfully');
    } catch (error) {
      logError(`Supabase client connection failed: ${error.message}`);
      throw error;
    }
    
    // 3. Create or update users
    logHeader('3. Creating/Updating Users');
    
    const results = [];
    for (const userData of usersToCreate) {
      const success = await createUserWithProfile(supabase, userData);
      results.push({ ...userData, success });
    }
    
    const successfulUsers = results.filter(r => r.success);
    const failedUsers = results.filter(r => !r.success);
    
    logInfo(`Successfully processed: ${successfulUsers.length}/${usersToCreate.length} users`);
    if (failedUsers.length > 0) {
      logWarning(`Failed to process: ${failedUsers.length} users`);
      failedUsers.forEach(user => {
        logError(`Failed: ${user.email}`);
      });
    }
    
    // 4. Setup RLS Policies
    logHeader('4. Setting Up Security Policies');
    await setupRLSPolicies(supabase);
    
    // 5. Test all logins
    logHeader('5. Testing User Logins');
    
    const loginResults = [];
    for (const userData of usersToCreate) {
      const loginSuccess = await testUserLogin(supabase, userData);
      loginResults.push({ ...userData, loginSuccess });
    }
    
    const successfulLogins = loginResults.filter(r => r.loginSuccess);
    const failedLogins = loginResults.filter(r => !r.loginSuccess);
    
    logInfo(`Successful logins: ${successfulLogins.length}/${usersToCreate.length}`);
    if (failedLogins.length > 0) {
      logWarning(`Failed logins: ${failedLogins.length}`);
      failedLogins.forEach(user => {
        logError(`Login failed: ${user.email}`);
      });
    }
    
    // 6. Final summary and recommendations
    logHeader('6. RESULTS SUMMARY');
    
    if (successfulLogins.length === usersToCreate.length) {
      logSuccess('🎉 ALL USERS CAN NOW LOGIN SUCCESSFULLY!');
      logInfo('\nUser credentials:');
      usersToCreate.forEach(user => {
        logInfo(`${user.email} / ${user.password} (${user.role})`);
      });
      
      logInfo('\nNext steps:');
      logInfo('1. Test the application login page');
      logInfo('2. Verify all user roles work correctly');
      logInfo('3. Check that RLS policies are working');
      logInfo('4. Update passwords in production');
    } else {
      logWarning('Some users still cannot login. Additional steps may be needed:');
      logInfo('1. Check Supabase Dashboard > Authentication > Settings');
      logInfo('2. Ensure "Enable email confirmations" is disabled for testing');
      logInfo('3. Check "Site URL" matches your application URL');
      logInfo('4. Verify service role key permissions if using auth admin functions');
      logInfo('5. Run the diagnostic script again: node diagnose-auth.js');
    }
    
  } catch (error) {
    logError(`Fix script failed: ${error.message}`);
    logError('Stack trace:', error.stack);
    process.exit(1);
  }
}

main().catch(console.error);