/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create new policies that don't reference user_profiles table within themselves
    - Use auth.uid() directly instead of querying user_profiles for admin checks
    - Separate admin policies to avoid circular dependencies

  2. Policy Structure
    - Users can read/update their own profile using auth.uid() = id
    - Admin operations will be handled separately without circular references
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Create new policies without circular dependencies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- For admin access, we'll handle this in the application layer
-- or create a separate admin role, but not through RLS policies
-- that reference the same table