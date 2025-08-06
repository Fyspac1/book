/*
  # Fix RLS policies for user_profiles table

  1. Security Changes
    - Drop all existing policies on user_profiles table
    - Create non-recursive policies that avoid infinite loops
    - Use auth.uid() directly without subqueries for admin checks

  2. New Policies
    - Users can read their own profile using auth.uid()
    - Users can update their own profile using auth.uid()
    - Users can insert their own profile using auth.uid()
    - Admins can read all profiles (using a different approach)
*/

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE((SELECT is_admin FROM user_profiles WHERE id = user_id), false);
$$;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

