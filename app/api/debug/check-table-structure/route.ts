import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Verificar la estructura de la tabla "facturas"
    const { data: facturaColumns, error: facturaError } = await supabase.rpc("get_table_columns", {
      table_name: "facturas",
    })

    if (facturaError) {
      return NextResponse.json(
        {
          error: "Error al obtener la estructura de la tabla facturas",
          details: facturaError.message,
        },
        { status: 500 },
      )
    }

    // Verificar la estructura de la tabla "prefacturas" para comparación
    const { data: prefacturaColumns, error: prefacturaError } = await supabase.rpc("get_table_columns", {
      table_name: "prefacturas",
    })

    if (prefacturaError) {
      return NextResponse.json(
        {
          error: "Error al obtener la estructura de la tabla prefacturas",
          details: prefacturaError.message,
        },
        { status: 500 },
      )
    }

    // Verificar si existe la función get_table_columns
    if (!facturaColumns) {
      // Intentar obtener la estructura de la tabla de otra manera
      const { data: tableInfo, error: tableError } = await supabase
        .from("information_schema.columns")
        .select("*")
        .eq("table_name", "facturas")

      if (tableError) {
        return NextResponse.json(
          {
            error: "Error al obtener la estructura de la tabla facturas usando information_schema",
            details: tableError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Estructura de la tabla facturas obtenida usando information_schema",
        facturaColumns: tableInfo,
      })
    }

    // Verificar los campos necesarios para el formulario
    const requiredColumns = [
      "id",
      "tipo_comprobante",
      "punto_venta",
      "numero_comprobante",
      "fecha_emision",
      "cliente_id",
      "prefactura_id",
      "condicion_venta",
      "cantidad",
      "valor_unitario",
      "subtotal",
      "iva",
      "total",
      "cae",
      "fecha_vencimiento_cae",
      "observaciones",
      "estado",
      "created_at",
      "updated_at",
    ]

    const missingColumns = requiredColumns.filter(
      (column) => !facturaColumns.some((c: any) => c.column_name === column),
    )

    return NextResponse.json({
      message: "Estructura de la tabla facturas obtenida",
      facturaColumns,
      prefacturaColumns,
      missingColumns,
      requiredColumns,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error al verificar la estructura de la tabla",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
