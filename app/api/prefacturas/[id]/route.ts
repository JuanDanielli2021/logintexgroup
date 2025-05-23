import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Get a specific prefactura
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Get prefactura with client information
    const { data, error } = await supabase
      .from("prefacturas")
      .select(`
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
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Transform data to match the expected format in the frontend
    const result = {
      id: data.id,
      cliente: data.clients,
      fecha: data.fecha,
      concepto: data.concepto,
      descripcion: data.descripcion,
      cantidad: data.cantidad,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching prefactura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Update a prefactura
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params
    const prefacturaData = await request.json()

    // Extract cliente_id from the cliente object if it exists
    if (prefacturaData.cliente && prefacturaData.cliente.id) {
      prefacturaData.cliente_id = prefacturaData.cliente.id
      delete prefacturaData.cliente
    }

    // Update prefactura
    const { data, error } = await supabase.from("prefacturas").update(prefacturaData).eq("id", id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the client information for the updated prefactura
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

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating prefactura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Delete a prefactura
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params

    // Delete prefactura
    const { error } = await supabase.from("prefacturas").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Prefactura deleted successfully" })
  } catch (error) {
    console.error("Error deleting prefactura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
