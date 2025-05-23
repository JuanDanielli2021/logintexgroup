import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Get all clients
export async function GET(request: Request) {
  try {
    // Create a Supabase client with the user's session
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // Verify the user is authenticated
    const {
      data: { session },
    } = await supabaseServer.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")

    // Build query
    let query = supabase.from("clients").select("*")

    // Add filter if tipo is provided
    if (tipo) {
      query = query.eq("tipo", tipo)
    }

    // Execute query
    const { data, error } = await query.order("razon_social", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create a new client
export async function POST(request: Request) {
  try {
    // Create a Supabase client with the user's session
    const cookieStore = cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // Verify the user is authenticated
    const {
      data: { session },
    } = await supabaseServer.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientData = await request.json()

    // Validate required fields
    const requiredFields = ["tipo", "cuit", "razon_social", "condicion_iva", "domicilio", "localidad", "rubro"]
    for (const field of requiredFields) {
      if (!clientData[field]) {
        return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 })
      }
    }

    // Insert client
    const { data, error } = await supabase.from("clients").insert([clientData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
