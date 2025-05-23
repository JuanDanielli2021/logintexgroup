import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Get all facturas
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
    const estado = searchParams.get("estado")

    // Build query with join to get client information
    let query = supabase.from("facturas").select(`
        *,
        clients:cliente_id (
          id,
          tipo,
          cuit,
          razon_social,
          condicion_iva,
          razon_social_empresa,
          domicilio_empresa
        ),
        prefacturas:prefactura_id (
          id,
          concepto,
          descripcion
        )
      `)

    // Add filters if provided
    if (clienteId) {
      query = query.eq("cliente_id", clienteId)
    }

    if (estado) {
      query = query.eq("estado", estado)
    }

    // Execute query
    const { data, error } = await query.order("fecha_emision", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match the expected format in the frontend
    const transformedData = data.map((item) => ({
      id: item.id,
      tipoComprobante: item.tipo_comprobante,
      puntoVenta: item.punto_venta,
      numeroComprobante: item.numero_comprobante,
      fechaEmision: item.fecha_emision,
      cliente: item.clients,
      prefacturaId: item.prefactura_id,
      prefactura: item.prefacturas,
      condicionVenta: item.condicion_venta,
      cantidad: item.cantidad,
      valorUnitario: item.valor_unitario,
      subtotal: item.subtotal,
      iva: item.iva,
      total: item.total,
      cae: item.cae,
      fechaVencimientoCae: item.fecha_vencimiento_cae,
      observaciones: item.observaciones,
      estado: item.estado,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching facturas:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Create a new factura
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

    const facturaData = await request.json()

    // Extract cliente_id from the cliente object if it exists
    if (facturaData.cliente && facturaData.cliente.id) {
      facturaData.cliente_id = facturaData.cliente.id
      delete facturaData.cliente
    }

    // Transform camelCase to snake_case for database
    const dbFacturaData = {
      tipo_comprobante: facturaData.tipoComprobante,
      punto_venta: facturaData.puntoVenta,
      numero_comprobante: facturaData.numeroComprobante,
      fecha_emision: facturaData.fechaEmision,
      cliente_id: facturaData.cliente_id,
      prefactura_id: facturaData.prefacturaId,
      condicion_venta: facturaData.condicionVenta,
      cantidad: facturaData.cantidad,
      valor_unitario: facturaData.valorUnitario,
      subtotal: facturaData.subtotal,
      iva: facturaData.iva,
      total: facturaData.total,
      cae: facturaData.cae,
      fecha_vencimiento_cae: facturaData.fechaVencimientoCae,
      observaciones: facturaData.observaciones,
      estado: facturaData.estado,
    }

    // Validate required fields
    const requiredFields = [
      "tipo_comprobante",
      "punto_venta",
      "numero_comprobante",
      "fecha_emision",
      "cliente_id",
      "prefactura_id",
      "condicion_venta",
      "cantidad",
      "valor_unitario",
      "cae",
      "fecha_vencimiento_cae",
      "estado",
    ]

    for (const field of requiredFields) {
      if (!dbFacturaData[field]) {
        return NextResponse.json({ error: `Field ${field} is required` }, { status: 400 })
      }
    }

    // Insert factura
    const { data, error } = await supabase.from("facturas").insert([dbFacturaData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the client information for the created factura
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", data[0].cliente_id)
      .single()

    if (clientError) {
      return NextResponse.json({ error: clientError.message }, { status: 500 })
    }

    // Get the prefactura information
    const { data: prefacturaData, error: prefacturaError } = await supabase
      .from("prefacturas")
      .select("*")
      .eq("id", data[0].prefactura_id)
      .single()

    if (prefacturaError) {
      return NextResponse.json({ error: prefacturaError.message }, { status: 500 })
    }

    // Return the factura with the client and prefactura information
    const result = {
      id: data[0].id,
      tipoComprobante: data[0].tipo_comprobante,
      puntoVenta: data[0].punto_venta,
      numeroComprobante: data[0].numero_comprobante,
      fechaEmision: data[0].fecha_emision,
      cliente: clientData,
      prefacturaId: data[0].prefactura_id,
      prefactura: prefacturaData,
      condicionVenta: data[0].condicion_venta,
      cantidad: data[0].cantidad,
      valorUnitario: data[0].valor_unitario,
      subtotal: data[0].subtotal,
      iva: data[0].iva,
      total: data[0].total,
      cae: data[0].cae,
      fechaVencimientoCae: data[0].fecha_vencimiento_cae,
      observaciones: data[0].observaciones,
      estado: data[0].estado,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating factura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
