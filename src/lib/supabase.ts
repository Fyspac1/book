import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Book {
  id: string
  title: string
  author: string
  category: string
  year_published: number
  description: string
  cover_image_url: string
  purchase_price: number
  rental_price_2weeks: number
  rental_price_1month: number
  rental_price_3months: number
  available_copies: number
  total_copies: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
}

export interface Rental {
  id: string
  user_id: string
  book_id: string
  rental_type: '2weeks' | '1month' | '3months'
  start_date: string
  end_date: string
  price_paid: number
  status: 'active' | 'returned' | 'overdue'
  created_at: string
  books?: Book
}

export interface Purchase {
  id: string
  user_id: string
  book_id: string
  price_paid: number
  created_at: string
  books?: Book
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'rental_reminder' | 'rental_overdue'
  is_read: boolean
  created_at: string
}