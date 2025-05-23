import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function GET(request: Request) {
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

    // Verificar estructura de tablas
    const tablesInfo: Record<string, any> = {}

    // Verificar tabla clients
    const { data: clientsColumns, error: clientsError } = await supabase.rpc("get_table_info", {
      table_name: "clients",
    })

    if (clientsError) {
      tablesInfo.clients = { error: clientsError.message }
    } else {
      tablesInfo.clients = { columns: clientsColumns }
    }

    // Verificar tabla prefacturas
    const { data: prefacturasColumns, error: prefacturasError } = await supabase.rpc("get_table_info", {
      table_name: "prefacturas",
    })

    if (prefacturasError) {
      tablesInfo.prefacturas = { error: prefacturasError.message }
    } else {
      tablesInfo.prefacturas = { columns: prefacturasColumns }
    }

    // Verificar tabla facturas
    const { data: facturasColumns, error: facturasError } = await supabase.rpc("get_table_info", {
      table_name: "facturas",
    })

    if (facturasError) {
      tablesInfo.facturas = { error: facturasError.message }
    } else {
      tablesInfo.facturas = { columns: facturasColumns }
    }

    // Verificar políticas RLS
    const { data: policies, error: policiesError } = await supabase.from("pg_policies").select("*")

    // Intentar insertar datos de prueba en cada tabla
    const testResults: Record<string, any> = {}

    // Probar inserción en prefacturas
    const testPrefactura = {
      cliente_id: session.user.id, // Usar ID del usuario como prueba
      fecha: new Date().toISOString().split("T")[0],
      concepto: "importacion",
      descripcion: "Prueba de inserción",
      cantidad: 100,
    }

    const { data: prefacturaResult, error: prefacturaInsertError } = await supabase
      .from("prefacturas")
      .insert([testPrefactura])
      .select()

    testResults.prefacturas = {
      success: !prefacturaInsertError,
      data: prefacturaResult,
      error: prefacturaInsertError ? prefacturaInsertError.message : null,
      details: prefacturaInsertError ? prefacturaInsertError.details : null,
    }

    // Si la inserción fue exitosa, eliminar el registro de prueba
    if (prefacturaResult && prefacturaResult.length > 0) {
      await supabase.from("prefacturas").delete().eq("id", prefacturaResult[0].id)
    }

    // Probar inserción en facturas
    const testFactura = {
      tipo_comprobante: "A",
      punto_venta: "00001",
      numero_comprobante: "00000001",
      fecha_emision: new Date().toISOString().split("T")[0],
      cliente_id: session.user.id, // Usar ID del usuario como prueba
      prefactura_id: "00000000-0000-0000-0000-000000000000", // UUID inválido para prueba
      condicion_venta: "Contado",
      cantidad: 1,
      valor_unitario: 100,
      subtotal: 100,
      iva: 21,
      total: 121,
      cae: "12345678901234",
      fecha_vencimiento_cae: new Date().toISOString().split("T")[0],
      estado: "emitida",
    }

    const { data: facturaResult, error: facturaInsertError } = await supabase
      .from("facturas")
      .insert([testFactura])
      .select()

    testResults.facturas = {
      success: !facturaInsertError,
      data: facturaResult,
      error: facturaInsertError ? facturaInsertError.message : null,
      details: facturaInsertError ? facturaInsertError.details : null,
    }

    // Si la inserción fue exitosa, eliminar el registro de prueba
    if (facturaResult && facturaResult.length > 0) {
      await supabase.from("facturas").delete().eq("id", facturaResult[0].id)
    }

    // Generar script SQL para corregir políticas RLS
    const fixScript = `
-- Deshabilitar temporalmente RLS para solucionar problemas
ALTER TABLE prefacturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer prefacturas" ON prefacturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar prefacturas" ON prefacturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar prefacturas" ON prefacturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar prefacturas" ON prefacturas;

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar facturas" ON facturas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar facturas" ON facturas;

-- Habilitar RLS nuevamente
ALTER TABLE prefacturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Acceso completo a prefacturas para usuarios autenticados"
ON prefacturas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Acceso completo a facturas para usuarios autenticados"
ON facturas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
`

    return NextResponse.json(
      {
        tablesInfo,
        policies: policies || [],
        policiesError: policiesError ? policiesError.message : null,
        testResults,
        fixScript,
        user: session.user,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error en diagnóstico:", error)
    return NextResponse.json(
      {
        error: "Error en diagnóstico",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
