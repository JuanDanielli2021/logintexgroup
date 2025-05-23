import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Please check your .env.local file or environment configuration.",
  )
}

// Initialize the Supabase client with proper error handling
export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")
