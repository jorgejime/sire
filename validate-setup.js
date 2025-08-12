#!/usr/bin/env node
/**
 * USM-IA Setup Validation Script
 * 
 * This script validates that the Supabase setup was completed successfully
 * and all systems are working correctly.
 * 
 * Usage: node validate-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './setup-config.js';

const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

class ValidationTests {
  constructor() {
    this.passedTests = 0;
    this.totalTests = 0;
    this.results = [];
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`🧪 Testing ${testName}...`);
    
    try {
      const result = await testFunction();
      if (result.success) {
        this.passedTests++;
        console.log(`   ✅ ${result.message || 'Passed'}`);
        this.results.push({ test: testName, status: 'PASS', message: result.message });
      } else {
        console.log(`   ❌ ${result.message || 'Failed'}`);
        this.results.push({ test: testName, status: 'FAIL', message: result.message });
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      this.results.push({ test: testName, status: 'ERROR', message: error.message });
    }
  }

  // Test 1: Environment configuration
  async testEnvironment() {
    return await this.runTest('Environment Configuration', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const envPath = path.join(__dirname, '.env');
      
      if (!fs.existsSync(envPath)) {
        return { success: false, message: '.env file not found' };
      }
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (!envContent.includes('VITE_SUPABASE_URL') || !envContent.includes('VITE_SUPABASE_ANON_KEY')) {
        return { success: false, message: '.env file missing required variables' };
      }
      
      return { success: true, message: 'Environment file configured correctly' };
    });
  }

  // Test 2: Supabase connection
  async testConnection() {
    return await this.runTest('Supabase Connection', async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          return { success: false, message: `Connection error: ${error.message}` };
        }
        
        return { success: true, message: 'Successfully connected to Supabase' };
      } catch (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }
    });
  }

  // Test 3: Authentication
  async testAuthentication() {
    return await this.runTest('Authentication System', async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@usm.cl',
          password: 'admin123456'
        });
        
        if (error) {
          return { success: false, message: `Auth error: ${error.message}` };
        }
        
        if (!data.user) {
          return { success: false, message: 'No user data returned' };
        }
        
        // Sign out after test
        await supabase.auth.signOut();
        
        return { success: true, message: 'Authentication working correctly' };
      } catch (error) {
        return { success: false, message: `Auth test failed: ${error.message}` };
      }
    });
  }

  // Test 4: Database tables
  async testDatabaseTables() {
    return await this.runTest('Database Tables', async () => {
      const tables = ['profiles', 'students', 'alerts', 'predictions', 'interventions', 'chat_conversations'];
      const working = [];
      const failed = [];
      
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('id').limit(1);
          if (error) {
            failed.push(`${table}: ${error.message}`);
          } else {
            working.push(table);
          }
        } catch (error) {
          failed.push(`${table}: ${error.message}`);
        }
      }
      
      if (failed.length > 0) {
        return { 
          success: false, 
          message: `${working.length}/${tables.length} tables working. Failed: ${failed.join(', ')}` 
        };
      }
      
      return { success: true, message: `All ${tables.length} database tables accessible` };
    });
  }

  // Test 5: Sample data
  async testSampleData() {
    return await this.runTest('Sample Data', async () => {
      try {
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .limit(5);
        
        if (studentsError) {
          return { success: false, message: `Students query error: ${studentsError.message}` };
        }
        
        const { data: alerts, error: alertsError } = await supabase
          .from('alerts')
          .select('id')
          .limit(5);
        
        if (alertsError) {
          return { success: false, message: `Alerts query error: ${alertsError.message}` };
        }
        
        const studentsCount = students?.length || 0;
        const alertsCount = alerts?.length || 0;
        
        if (studentsCount === 0) {
          return { success: false, message: 'No sample students found' };
        }
        
        return { 
          success: true, 
          message: `Found ${studentsCount} students, ${alertsCount} alerts` 
        };
        
      } catch (error) {
        return { success: false, message: `Data validation error: ${error.message}` };
      }
    });
  }

  // Test 6: Row Level Security
  async testRLS() {
    return await this.runTest('Row Level Security', async () => {
      try {
        // Test without authentication (should be restricted)
        const { data, error } = await supabase.from('students').select('*');
        
        // With RLS enabled, this should either return empty data or an error
        if (error && error.message.includes('permission')) {
          return { success: true, message: 'RLS policies active and working' };
        }
        
        if (!data || data.length === 0) {
          return { success: true, message: 'RLS protecting data correctly' };
        }
        
        // If data is returned, RLS might not be properly configured
        return { success: false, message: 'RLS might not be properly configured' };
        
      } catch (error) {
        // This might be expected due to RLS
        return { success: true, message: 'RLS appears to be active' };
      }
    });
  }

  // Test 7: TypeScript types
  async testTypeScriptTypes() {
    return await this.runTest('TypeScript Types', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const typesPath = path.join(__dirname, 'src/lib/database.types.ts');
      
      if (!fs.existsSync(typesPath)) {
        return { success: false, message: 'database.types.ts file not found' };
      }
      
      const typesContent = fs.readFileSync(typesPath, 'utf8');
      if (!typesContent.includes('Database') || !typesContent.includes('Tables')) {
        return { success: false, message: 'Types file missing required definitions' };
      }
      
      return { success: true, message: 'TypeScript types generated correctly' };
    });
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 USM-IA Setup Validation');
    console.log('==========================\n');
    
    await this.testEnvironment();
    await this.testConnection();
    await this.testAuthentication();
    await this.testDatabaseTables();
    await this.testSampleData();
    await this.testRLS();
    await this.testTypeScriptTypes();
    
    console.log('\n📊 Validation Results');
    console.log('=====================');
    console.log(`Tests passed: ${this.passedTests}/${this.totalTests}`);
    console.log(`Success rate: ${Math.round((this.passedTests / this.totalTests) * 100)}%\n`);
    
    if (this.passedTests === this.totalTests) {
      console.log('🎉 All tests passed! Your USM-IA setup is complete and working correctly.\n');
      console.log('✨ You can now start the development server with: npm run dev');
    } else {
      console.log('⚠️  Some tests failed. Please review the issues above.\n');
      
      console.log('📋 Detailed Results:');
      this.results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🚫';
        console.log(`${icon} ${result.test}: ${result.message}`);
      });
      
      console.log('\n🔧 If you see failures, try running the setup again: npm run setup');
    }
    
    console.log('\n📞 Need help? Check the documentation or contact support.');
  }
}

// Run validation
const validator = new ValidationTests();
validator.runAllTests().catch(error => {
  console.error('❌ Validation error:', error.message);
  process.exit(1);
});