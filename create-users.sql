-- ================================================================
-- USM-IA User Creation Script
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ================================================================

-- First, let's clean up any existing RLS policies that might have recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Coordinators can read profiles" ON profiles;

-- Create a function to safely create users
CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email text,
  user_password text,
  user_role text,
  user_full_name text,
  user_department text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create the profile
  INSERT INTO profiles (
    id,
    email,
    role,
    full_name,
    department,
    created_at,
    updated_at
  )
  VALUES (
    new_user_id,
    user_email,
    user_role::text,
    user_full_name,
    user_department,
    NOW(),
    NOW()
  );

  RETURN new_user_id;
END;
$$;

-- Create the users
DO $$
DECLARE
  admin_id uuid;
  coord_id uuid;
  counsel_id uuid;
  student_id uuid;
BEGIN
  -- Delete existing users if they exist (optional)
  DELETE FROM profiles WHERE email IN ('admin@usm.cl', 'coordinador@usm.cl', 'consejero@usm.cl', 'estudiante1@usm.cl');
  DELETE FROM auth.users WHERE email IN ('admin@usm.cl', 'coordinador@usm.cl', 'consejero@usm.cl', 'estudiante1@usm.cl');

  -- Create admin user
  admin_id := create_user_with_profile(
    'admin@usm.cl',
    'admin123456',
    'admin',
    'Administrador Sistema',
    'TI'
  );
  RAISE NOTICE 'Created admin user with ID: %', admin_id;

  -- Create coordinator user
  coord_id := create_user_with_profile(
    'coordinador@usm.cl',
    'coord123456',
    'coordinator',
    'Coordinador Académico',
    'Ingeniería'
  );
  RAISE NOTICE 'Created coordinator user with ID: %', coord_id;

  -- Create counselor user
  counsel_id := create_user_with_profile(
    'consejero@usm.cl',
    'consejero123',
    'counselor',
    'Consejero Estudiantil',
    'Bienestar Estudiantil'
  );
  RAISE NOTICE 'Created counselor user with ID: %', counsel_id;

  -- Create student user
  student_id := create_user_with_profile(
    'estudiante1@usm.cl',
    'estudiante123',
    'student',
    'Estudiante Ejemplo',
    NULL
  );
  RAISE NOTICE 'Created student user with ID: %', student_id;

END $$;

-- Create proper RLS policies without recursion
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Admins can read all profiles
CREATE POLICY "admins_read_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        SELECT email FROM profiles 
        WHERE profiles.id = auth.users.id 
        AND profiles.role = 'admin'
      )
    )
  );

-- Policy 4: Admins can update all profiles
CREATE POLICY "admins_update_all_profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        SELECT email FROM profiles 
        WHERE profiles.id = auth.users.id 
        AND profiles.role = 'admin'
      )
    )
  );

-- Policy 5: Coordinators can read student profiles
CREATE POLICY "coordinators_read_students" ON profiles
  FOR SELECT USING (
    role = 'student' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        SELECT email FROM profiles 
        WHERE profiles.id = auth.users.id 
        AND profiles.role IN ('admin', 'coordinator')
      )
    )
  );

-- Clean up the helper function (optional)
-- DROP FUNCTION create_user_with_profile;

-- Verify the users were created
SELECT 
  u.email,
  u.created_at as auth_created,
  p.role,
  p.full_name,
  p.department
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('admin@usm.cl', 'coordinador@usm.cl', 'consejero@usm.cl', 'estudiante1@usm.cl')
ORDER BY p.role;