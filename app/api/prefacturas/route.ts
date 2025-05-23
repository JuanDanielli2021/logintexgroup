import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Get all prefacturas
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
    const clienteId = searchParams.get("cliente_id")
    const concepto = searchParams.get("concepto")

    // Build query with join to get client information
    let query = supabase.from("prefacturas").select(`
        *,
        clients:cliente_id (
          id,
          tipo,
          cuit,
          razon_social,
          condicion_iva,
          razon_social_empresa,
          domicilio_empresa
        )
      `)

    // Add filters if provided
    if (clienteId) {
      query = query.eq("cliente_id", clienteId)
    }

    if (concepto) {
      query = query.eq("concepto", concepto)
    }

    // Execute query
    const { data, error } = await query.order("fecha", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match the expected format in the frontend
    const transformedData = data.map((item) => ({
      id: item.id,
      cliente: item.clients,
      fecha: item.fecha,
      concepto: item.concepto,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching prefacturas:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create a new prefactura
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

    const prefacturaData = await request.json()

    // Extract cliente_id from the cliente object if it exists
    if (prefacturaData.cliente && prefacturaData.cliente.id) {
      prefacturaData.cliente_id = prefacturaData.cliente.id
      delete prefacturaData.cliente
    }

    // Validate required fields
    const requiredFields = ["cliente_id", "fecha", "concepto", "descripcion", "cantidad"]
    for (const field of requiredFields) {
      if (!prefacturaData[field]) {
        return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 })
      }
    }

    // Insert prefactura
    const { data, error } = await supabase.from("prefacturas").insert([prefacturaData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the client information for the created prefactura
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", data[0].cliente_id)
      .single()

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    // Return the prefactura with the client information
    const result = {
      ...data[0],
      cliente: clientData,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating prefactura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
