import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      about: {
        Row: {
          id: number
          content_en: string | null
          content_ne: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          content_en?: string | null
          content_ne?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          content_en?: string | null
          content_ne?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stats: {
        Row: {
          id: number
          label_en: string
          label_ne: string
          value: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          label_en: string
          label_ne: string
          value: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          label_en?: string
          label_ne?: string
          value?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
