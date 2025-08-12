#!/usr/bin/env node

/**
 * Authentication Diagnostic Script
 * This script diagnoses authentication issues in the Supabase project
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

// Test users that should exist
const testUsers = [
  { email: 'admin@usm.cl', password: 'admin123456', role: 'admin' },
  { email: 'coordinador@usm.cl', password: 'coord123456', role: 'coordinator' },
  { email: 'consejero@usm.cl', password: 'consejero123', role: 'counselor' },
  { email: 'estudiante1@usm.cl', password: 'estudiante123', role: 'student' }
];

async function main() {
  logHeader('SUPABASE AUTHENTICATION DIAGNOSTICS');
  
  try {
    // 1. Load environment variables
    logHeader('1. Environment Configuration Check');
    const envVars = loadEnvVars();
    
    const supabaseUrl = envVars.VITE_SUPABASE_URL;
    const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logError('Missing Supabase environment variables');
      logInfo('VITE_SUPABASE_URL: ' + (supabaseUrl ? 'Found' : 'Missing'));
      logInfo('VITE_SUPABASE_ANON_KEY: ' + (supabaseAnonKey ? 'Found' : 'Missing'));
      process.exit(1);
    }
    
    logSuccess('Environment variables found');
    logInfo(`Supabase URL: ${supabaseUrl}`);
    logInfo(`Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
    
    // 2. Initialize Supabase client
    logHeader('2. Supabase Client Connection Test');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      logSuccess('Supabase client connection successful');
    } catch (error) {
      logError(`Supabase client connection failed: ${error.message}`);
      throw error;
    }
    
    // 3. Database Schema Check
    logHeader('3. Database Schema Verification');
    
    // Check if profiles table exists and has correct structure
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        logError('profiles table does not exist');
      } else if (error) {
        logError(`Error accessing profiles table: ${error.message}`);
      } else {
        logSuccess('profiles table exists and is accessible');
      }
    } catch (error) {
      logError(`Database schema check failed: ${error.message}`);
    }
    
    // Check RLS policies
    try {
      const { data, error } = await supabase
        .rpc('get_table_policies', { table_name: 'profiles' })
        .single();
      
      if (error) {
        logWarning(`Could not check RLS policies: ${error.message}`);
      } else {
        logInfo('RLS policies check completed');
      }
    } catch (error) {
      logWarning(`RLS policy check failed: ${error.message}`);
    }
    
    // 4. Authentication Configuration Check
    logHeader('4. Authentication Configuration');
    
    // This requires service role key for full auth admin access
    logWarning('Authentication settings check requires service role key (not available in client)');
    logInfo('Manual check required in Supabase Dashboard > Authentication > Settings');
    logInfo('Recommended settings:');
    logInfo('- Confirm email: DISABLED for testing');
    logInfo('- Email confirmation redirect: Set appropriately');
    logInfo('- Site URL: Match your application URL');
    
    // 5. User Existence Check
    logHeader('5. User Authentication Tests');
    
    let loginResults = [];
    
    for (const testUser of testUsers) {
      logInfo(`Testing login for ${testUser.email}...`);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password
        });
        
        if (error) {
          logError(`Login failed for ${testUser.email}: ${error.message}`);
          loginResults.push({
            email: testUser.email,
            status: 'failed',
            error: error.message,
            code: error.status || 'unknown'
          });
        } else if (data.user) {
          logSuccess(`Login successful for ${testUser.email}`);
          loginResults.push({
            email: testUser.email,
            status: 'success',
            userId: data.user.id
          });
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (profileError) {
            logWarning(`Profile not found for ${testUser.email}: ${profileError.message}`);
          } else {
            logSuccess(`Profile found for ${testUser.email} - Role: ${profile.role}`);
          }
          
          // Sign out after test
          await supabase.auth.signOut();
        }
      } catch (error) {
        logError(`Login test failed for ${testUser.email}: ${error.message}`);
        loginResults.push({
          email: testUser.email,
          status: 'error',
          error: error.message
        });
      }
    }
    
    // 6. Results Summary
    logHeader('6. DIAGNOSTIC RESULTS SUMMARY');
    
    const successfulLogins = loginResults.filter(r => r.status === 'success');
    const failedLogins = loginResults.filter(r => r.status === 'failed');
    const errorLogins = loginResults.filter(r => r.status === 'error');
    
    logInfo(`Successful logins: ${successfulLogins.length}/${testUsers.length}`);
    logInfo(`Failed logins: ${failedLogins.length}/${testUsers.length}`);
    logInfo(`Error logins: ${errorLogins.length}/${testUsers.length}`);
    
    if (failedLogins.length > 0) {
      logHeader('FAILED LOGIN DETAILS');
      failedLogins.forEach(result => {
        logError(`${result.email}: ${result.error} (Code: ${result.code})`);
      });
    }
    
    if (errorLogins.length > 0) {
      logHeader('ERROR LOGIN DETAILS');
      errorLogins.forEach(result => {
        logError(`${result.email}: ${result.error}`);
      });
    }
    
    // 7. Recommendations
    logHeader('7. RECOMMENDATIONS');
    
    if (successfulLogins.length === testUsers.length) {
      logSuccess('All users can login successfully! No action needed.');
    } else {
      logWarning('Some users cannot login. Here are the likely issues and solutions:');
      
      const commonErrors = {};
      [...failedLogins, ...errorLogins].forEach(result => {
        const errorKey = result.error?.toLowerCase() || 'unknown';
        commonErrors[errorKey] = (commonErrors[errorKey] || 0) + 1;
      });
      
      Object.entries(commonErrors).forEach(([error, count]) => {
        logInfo(`${count} user(s) with error: "${error}"`);
        
        if (error.includes('invalid login credentials') || error.includes('invalid_credentials')) {
          logInfo('  → Users likely not created in auth.users table');
          logInfo('  → Run the fix script to create missing users');
        }
        
        if (error.includes('email not confirmed')) {
          logInfo('  → Email confirmation required but not completed');
          logInfo('  → Disable email confirmation in Supabase Dashboard or run fix script');
        }
        
        if (error.includes('signup disabled')) {
          logInfo('  → User registration is disabled');
          logInfo('  → Enable user registration in Supabase Dashboard');
        }
        
        if (error.includes('rate limit')) {
          logInfo('  → Rate limiting is blocking requests');
          logInfo('  → Wait a moment and try again');
        }
      });
      
      logInfo('\nNext steps:');
      logInfo('1. Run: node fix-auth.js');
      logInfo('2. Check Supabase Dashboard > Authentication > Settings');
      logInfo('3. Verify users exist in Authentication > Users');
      logInfo('4. Check RLS policies are not blocking access');
    }
    
  } catch (error) {
    logError(`Diagnostic failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);