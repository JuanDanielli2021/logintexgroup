import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = createClient()

    // Consultar directamente la tabla facturas
    const { data: facturas, error: facturasError } = await supabase
      .from("facturas")
      .select("*")
      .order("created_at", { ascending: false })

    if (facturasError) {
      console.error("Error al consultar facturas:", facturasError)
      return NextResponse.json(
        { error: "Error al consultar facturas", details: facturasError.message },
        { status: 500 },
      )
    }

    // Consultar las políticas RLS para la tabla facturas
    const { data: policies, error: policiesError } = await supabase.rpc("get_table_policies", {
      table_name: "facturas",
    })

    if (policiesError) {
      console.error("Error al consultar políticas RLS:", policiesError)
      return NextResponse.json(
        { error: "Error al consultar políticas RLS", details: policiesError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      facturas,
      policies,
      count: facturas.length,
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error inesperado", details: String(error) }, { status: 500 })
  }
}
