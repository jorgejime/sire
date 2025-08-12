# Authentication Fix Instructions

This document provides step-by-step instructions to fix the authentication issues in the USM-IA application.

## Problem Summary

The diagnostic script revealed:
- **Invalid login credentials** for all test users
- **Users don't exist** in the auth.users table
- **RLS policy issues** causing infinite recursion
- **User registration disabled** in Supabase settings

## Solution Options

### Option 1: SQL Script (Recommended - Easiest)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `jofqwhvntvykclqfuhia`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the User Creation Script**
   - Copy the contents of `create-users.sql` 
   - Paste it into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Results**
   - You should see messages like "Created admin user with ID: ..."
   - Check the final SELECT query results to confirm users were created

5. **Test Login**
   - Run: `node test-login.js`
   - All users should now be able to login

### Option 2: Service Role Script (Advanced)

If you prefer using the Node.js script with admin privileges:

1. **Get Service Role Key**
   - In Supabase Dashboard > Settings > API
   - Copy the "service_role" key (starts with `eyJ...`)
   - **Keep this key secure - it has full admin access**

2. **Run the Service Role Script**
   ```bash
   node fix-auth-service.js
   ```
   - Enter your service role key when prompted
   - The script will create users with admin privileges

3. **Test Login**
   ```bash
   node test-login.js
   ```

### Option 3: Manual User Creation

If you prefer to create users manually:

1. **Go to Supabase Dashboard > Authentication > Users**
2. **Click "Add User"** for each user:
   - **Admin User:**
     - Email: `admin@usm.cl`
     - Password: `admin123456`
     - Confirm Email: ✅ (checked)
   
   - **Coordinator User:**
     - Email: `coordinador@usm.cl` 
     - Password: `coord123456`
     - Confirm Email: ✅ (checked)
   
   - **Counselor User:**
     - Email: `consejero@usm.cl`
     - Password: `consejero123`
     - Confirm Email: ✅ (checked)
   
   - **Student User:**
     - Email: `estudiante1@usm.cl`
     - Password: `estudiante123`
     - Confirm Email: ✅ (checked)

3. **Create Profiles Manually**
   - Go to Database > Tables > profiles
   - Insert records for each user with their user ID from auth.users

## Post-Fix Configuration

### 1. Authentication Settings

In Supabase Dashboard > Authentication > Settings:

- **Confirm email**: DISABLE for testing (enable in production)
- **Site URL**: Set to your application URL (e.g., `http://localhost:5173`)
- **Email templates**: Configure as needed

### 2. Test the Application

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open the application** in your browser

3. **Test login** with any of these credentials:
   - `admin@usm.cl` / `admin123456`
   - `coordinador@usm.cl` / `coord123456`
   - `consejero@usm.cl` / `consejero123`
   - `estudiante1@usm.cl` / `estudiante123`

## Troubleshooting Scripts

### Quick Test
```bash
node test-login.js
```
Tests all user logins and shows results.

### Full Diagnostics  
```bash
node diagnose-auth.js
```
Runs comprehensive authentication diagnostics.

### Windows Batch Script
```bash
fix-auth.bat
```
Interactive menu for running different fix options.

## User Credentials (Development Only)

| Email | Password | Role |
|-------|----------|------|
| admin@usm.cl | admin123456 | admin |
| coordinador@usm.cl | coord123456 | coordinator |
| consejero@usm.cl | consejero123 | counselor |
| estudiante1@usm.cl | estudiante123 | student |

## Security Notes

⚠️ **Important Security Reminders:**

1. **Change passwords in production** - These are development passwords only
2. **Enable email confirmation** in production environments  
3. **Secure your service role key** - Never expose it publicly
4. **Review RLS policies** to ensure proper access control
5. **Remove test accounts** before going to production

## Success Criteria

After applying the fix, you should see:

✅ All users can login successfully  
✅ Profiles are created and linked correctly  
✅ Role-based access control works  
✅ No RLS policy errors  
✅ Application functions normally  

## Need Help?

If you're still having issues:

1. Run the diagnostic script: `node diagnose-auth.js`
2. Check the Supabase Dashboard for error messages
3. Verify your .env file has the correct Supabase URL and keys
4. Ensure your Supabase project is active and not paused