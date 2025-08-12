#!/usr/bin/env node

/**
 * Authentication Fix Script with Service Role
 * This script uses admin functions to create users and fix authentication issues.
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
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

async function createUserWithServiceRole(supabase, userData) {
  logInfo(`Creating user with admin privileges: ${userData.email}`);
  
  try {
    // Create user with admin.createUser
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        logWarning(`User ${userData.email} already exists`);
        
        // Try to get the existing user
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        if (!listError) {
          const existingUser = users.users.find(u => u.email === userData.email);
          if (existingUser) {
            // Update the user's password and metadata
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              existingUser.id,
              {
                password: userData.password,
                user_metadata: {
                  full_name: userData.fullName,
                  role: userData.role
                },
                email_confirm: true
              }
            );
            
            if (updateError) {
              logError(`Failed to update existing user ${userData.email}: ${updateError.message}`);
              return { success: false, userId: null };
            }
            
            logSuccess(`Updated existing user: ${userData.email}`);
            await createOrUpdateProfile(supabase, existingUser.id, userData);
            return { success: true, userId: existingUser.id };
          }
        }
      } else {
        logError(`Failed to create user ${userData.email}: ${error.message}`);
        return { success: false, userId: null };
      }
    } else if (data.user) {
      logSuccess(`Created user: ${userData.email} (ID: ${data.user.id})`);
      
      // Create profile
      await createOrUpdateProfile(supabase, data.user.id, userData);
      return { success: true, userId: data.user.id };
    }
  } catch (error) {
    logError(`Error creating user ${userData.email}: ${error.message}`);
    return { success: false, userId: null };
  }
  
  return { success: false, userId: null };
}

async function createOrUpdateProfile(supabase, userId, userData) {
  try {
    // First try to get existing profile
    const { data: existingProfile } = await supabase
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

async function testUserLogin(regularSupabase, userData) {
  try {
    const { data, error } = await regularSupabase.auth.signInWithPassword({
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
      const { data: profile, error: profileError } = await regularSupabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        logWarning(`Profile not found for ${userData.email}`);
      } else {
        logSuccess(`Profile verified for ${userData.email} - Role: ${profile.role}`);
      }
      
      await regularSupabase.auth.signOut();
      return true;
    }
  } catch (error) {
    logError(`Login test error for ${userData.email}: ${error.message}`);
  }
  
  return false;
}

async function main() {
  logHeader('SUPABASE AUTHENTICATION FIX WITH SERVICE ROLE');
  
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
    
    // 2. Get service role key
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      logWarning('Service role key not found in environment variables');
      logInfo('The service role key is needed to create users with admin privileges');
      logInfo('You can find it in your Supabase Dashboard > Settings > API');
      logInfo('It should start with: eyJ...');
      
      serviceRoleKey = await askQuestion('Please enter your Supabase service role key: ');
      
      if (!serviceRoleKey || serviceRoleKey.trim() === '') {
        logError('Service role key is required to proceed');
        rl.close();
        process.exit(1);
      }
    }
    
    logSuccess('Configuration loaded successfully');
    
    // 3. Initialize Supabase clients
    logHeader('2. Initializing Supabase Clients');
    
    // Admin client with service role
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Regular client with anon key for testing
    const regularSupabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test admin connection
    try {
      const { data: users, error } = await adminSupabase.auth.admin.listUsers();
      if (error) throw error;
      logSuccess(`Admin client initialized successfully (${users.users.length} existing users)`);
    } catch (error) {
      logError(`Admin client connection failed: ${error.message}`);
      logError('Please check your service role key');
      rl.close();
      process.exit(1);
    }
    
    // Test regular connection
    try {
      const { data, error } = await regularSupabase.auth.getSession();
      if (error) throw error;
      logSuccess('Regular client initialized successfully');
    } catch (error) {
      logError(`Regular client connection failed: ${error.message}`);
      throw error;
    }
    
    // 4. Create or update users
    logHeader('3. Creating/Updating Users with Admin Privileges');
    
    const results = [];
    for (const userData of usersToCreate) {
      const result = await createUserWithServiceRole(adminSupabase, userData);
      results.push({ ...userData, ...result });
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
    
    // 5. Test all logins with regular client
    logHeader('4. Testing User Logins');
    
    const loginResults = [];
    for (const userData of usersToCreate) {
      const loginSuccess = await testUserLogin(regularSupabase, userData);
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
    
    // 6. Final summary
    logHeader('5. RESULTS SUMMARY');
    
    if (successfulLogins.length === usersToCreate.length) {
      logSuccess('🎉 ALL USERS CAN NOW LOGIN SUCCESSFULLY!');
      logInfo('\nUser credentials:');
      usersToCreate.forEach(user => {
        logInfo(`${user.email} / ${user.password} (${user.role})`);
      });
      
      logInfo('\nNext steps:');
      logInfo('1. Test the application login page');
      logInfo('2. Verify all user roles work correctly');
      logInfo('3. Update passwords in production');
      logInfo('4. Remove service role key from this script/environment');
    } else {
      logWarning('Some users still cannot login. Additional troubleshooting needed.');
      logInfo('Run the diagnostic script for more details: node diagnose-auth.js');
    }
    
    rl.close();
    
  } catch (error) {
    logError(`Fix script failed: ${error.message}`);
    logError(error.stack);
    rl.close();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  rl.close();
});