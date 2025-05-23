import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Try to connect to Supabase and get the current user
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to connect to Supabase",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Check if we can query the database
    const { data: dbTest, error: dbError } = await supabase.from("clients").select("count").limit(1).single()

    if (dbError && dbError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      return NextResponse.json(
        {
          status: "warning",
          message: "Connected to Supabase auth but database query failed",
          authStatus: "ok",
          dbStatus: "error",
          error: dbError.message,
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Successfully connected to Supabase",
      authStatus: "ok",
      dbStatus: "ok",
      session: data.session ? "active" : "none",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
