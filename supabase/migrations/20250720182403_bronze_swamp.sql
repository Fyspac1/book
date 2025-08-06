/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Problem
    - The "Admins can read all profiles" policy creates infinite recursion
    - It checks user_profiles.is_admin while protecting user_profiles table
    - This creates a circular dependency

  2. Solution
    - Remove the problematic admin policy that causes recursion
    - Keep simple policies that don't create circular dependencies
    - Users can still read and update their own profiles
    - Admin functionality will work through service role or direct queries

  3. Security
    - Users can only read/update their own profile data
    - Admin operations should use service role key for elevated permissions
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);