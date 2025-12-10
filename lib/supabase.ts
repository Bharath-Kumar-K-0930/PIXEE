import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Event {
  id: string
  name: string
  code: string
  created_at: string
}

export interface Photo {
  id: string
  event_id: string
  image_url: string
  source_type?: 'url' | 'drive_folder' | 'upload'
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  created_at: string
  updated_at: string
}