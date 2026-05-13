import { createClient } from '@supabase/supabase-js'
import type { Lancamento } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      lancamentos: {
        Row: Lancamento
        Insert: Omit<Lancamento, 'id' | 'created_at' | 'user_id'>
        Update: Partial<Omit<Lancamento, 'id' | 'created_at' | 'user_id'>>
      }
    }
  }
}
