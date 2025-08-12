#!/usr/bin/env node

/**
 * Simple Login Test Script
 * This script tests login functionality for all users
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
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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
    log('Could not load .env file', 'red');
    throw error;
  }
}

// Test users
const testUsers = [
  { email: 'admin@usm.cl', password: 'admin123456', role: 'admin' },
  { email: 'coordinador@usm.cl', password: 'coord123456', role: 'coordinator' },
  { email: 'consejero@usm.cl', password: 'consejero123', role: 'counselor' },
  { email: 'estudiante1@usm.cl', password: 'estudiante123', role: 'student' }
];

async function testLogin(supabase, userData) {
  try {
    log(`Testing login for ${userData.email}...`, 'blue');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: userData.password
    });
    
    if (error) {
      log(`❌ Login failed: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      log(`✅ Login successful!`, 'green');
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        log(`⚠️  Profile not found: ${profileError.message}`, 'yellow');
      } else {
        log(`   Profile: ${profile.full_name} (${profile.role})`, 'cyan');
      }
      
      // Sign out
      await supabase.auth.signOut();
      return { success: true, profile };
    }
  } catch (error) {
    log(`❌ Test error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
  
  return { success: false, error: 'Unknown error' };
}

async function main() {
  console.log('='.repeat(50));
  log('USM-IA LOGIN TEST', 'cyan');
  console.log('='.repeat(50));
  
  try {
    // Load configuration
    const envVars = loadEnvVars();
    const supabaseUrl = envVars.VITE_SUPABASE_URL;
    const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      log('Missing Supabase environment variables', 'red');
      process.exit(1);
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    log(`Testing ${testUsers.length} users...`, 'blue');
    console.log('');
    
    const results = [];
    for (const user of testUsers) {
      const result = await testLogin(supabase, user);
      results.push({ ...user, ...result });
      console.log('');
    }
    
    // Summary
    console.log('='.repeat(50));
    log('RESULTS SUMMARY', 'cyan');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    log(`Successful logins: ${successful.length}/${testUsers.length}`, successful.length === testUsers.length ? 'green' : 'yellow');
    log(`Failed logins: ${failed.length}/${testUsers.length}`, failed.length === 0 ? 'green' : 'red');
    
    if (successful.length === testUsers.length) {
      console.log('');
      log('🎉 ALL USERS CAN LOGIN SUCCESSFULLY!', 'green');
      console.log('');
      log('Your application is ready to use with these credentials:', 'cyan');
      testUsers.forEach(user => {
        log(`   ${user.email} / ${user.password}`, 'blue');
      });
    } else {
      console.log('');
      log('Some users cannot login. Run the fix script:', 'yellow');
      log('   node fix-auth.js', 'blue');
      log('   or', 'yellow');
      log('   node fix-auth-service.js', 'blue');
    }
    
  } catch (error) {
    log(`Test failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

main().catch(console.error);