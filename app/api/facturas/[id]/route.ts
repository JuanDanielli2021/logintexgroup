import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Get a specific factura
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

    // Get factura with client and prefactura information
    const { data, error } = await supabase
      .from("facturas")
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
        ),
        prefacturas:prefactura_id (
          id,
          concepto,
          descripcion
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
      tipoComprobante: data.tipo_comprobante,
      puntoVenta: data.punto_venta,
      numeroComprobante: data.numero_comprobante,
      fechaEmision: data.fecha_emision,
      cliente: data.clients,
      prefacturaId: data.prefactura_id,
      prefactura: data.prefacturas,
      condicionVenta: data.condicion_venta,
      cantidad: data.cantidad,
      valorUnitario: data.valor_unitario,
      subtotal: data.subtotal,
      iva: data.iva,
      total: data.total,
      cae: data.cae,
      fechaVencimientoCae: data.fecha_vencimiento_cae,
      observaciones: data.observaciones,
      estado: data.estado,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching factura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Update a factura
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

    // Update factura
    const { data, error } = await supabase.from("facturas").update(dbFacturaData).eq("id", id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the client information for the updated factura
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

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating factura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Delete a factura
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

    // Delete factura
    const { error } = await supabase.from("facturas").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Factura deleted successfully" })
  } catch (error) {
    console.error("Error deleting factura:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
