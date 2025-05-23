import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    // Crear cliente de Supabase con cookies para autenticación
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Verificar sesión
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Script SQL para deshabilitar RLS
    const disableRlsScript = `
    -- Deshabilitar RLS para la tabla clients
    ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

    -- Deshabilitar RLS para la tabla prefacturas
    ALTER TABLE prefacturas DISABLE ROW LEVEL SECURITY;

    -- Deshabilitar RLS para la tabla facturas
    ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;
    `

    // Ejecutar el script SQL
    const { error } = await supabase.rpc("exec_sql", { sql: disableRlsScript })

    if (error) {
      console.error("Error al deshabilitar RLS:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Error al deshabilitar RLS. Es posible que necesites ejecutar el script manualmente.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "RLS deshabilitado correctamente para las tablas clients, prefacturas y facturas",
    })
  } catch (error: any) {
    console.error("Error al deshabilitar RLS:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Error inesperado al deshabilitar RLS",
      },
      { status: 500 },
    )
  }
}
