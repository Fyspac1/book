import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    // Listen for changes in user_profiles table
    const profileSubscription = supabase
      .channel('public:user_profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_profiles' }, payload => {
        if (payload.new.id === user?.id) {
          setProfile(payload.new as UserProfile)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      profileSubscription.unsubscribe()
    }
  }, [user?.id]) // Re-subscribe if user ID changes

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (data.user && !error) {
      // Create user profile
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        is_admin: false,
      })
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  }
}

