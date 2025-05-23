import { NextResponse } from "next/server"
import { createAPIClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()
    const supabase = createAPIClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Insertar en la tabla de usuarios
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: data.user?.id,
        email: email,
        full_name: fullName,
      },
    ])

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      return NextResponse.json({ error: "Error creating user profile" }, { status: 500 })
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
