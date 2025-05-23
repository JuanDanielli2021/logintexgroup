import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if environment variables are set
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
        envVars: {
          url: Boolean(supabaseUrl),
          key: Boolean(supabaseAnonKey),
        },
      })
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test a simple query
    const { data, error } = await supabase.from("clients").select("count").limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        query: "SELECT count FROM clients LIMIT 1",
      })
    }

    // Try to get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      data: {
        queryResult: data,
        session: sessionData ? "Session exists" : "No active session",
        sessionError: sessionError ? sessionError.message : null,
      },
      envVars: {
        url: Boolean(supabaseUrl),
        key: Boolean(supabaseAnonKey),
      },
    })
  } catch (error) {
    console.error("Error in test-connection route:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
