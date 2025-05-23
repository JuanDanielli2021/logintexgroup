import { NextResponse } from "next/server"
import { createAPIClient } from "@/lib/supabase-server"

export async function POST() {
  try {
    const supabase = createAPIClient()
    await supabase.auth.signOut()
    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
