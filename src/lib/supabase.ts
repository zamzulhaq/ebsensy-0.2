import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL dan Anon Key wajib diisi di file .env. Salin .env.example ke .env dan isi credential Anda.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
