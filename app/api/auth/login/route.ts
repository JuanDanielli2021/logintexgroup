import { NextResponse } from "next/server"
import { createAPIClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = createAPIClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ user: data.user }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
