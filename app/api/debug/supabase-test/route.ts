import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Crear cliente de Supabase con cookies de autenticación
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verificar la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "No hay sesión activa. Inicia sesión primero." }, { status: 401 })
    }

    // Verificar la conexión a la base de datos
    const { data: connectionTest, error: connectionError } = await supabase.from("clients").select("count(*)").limit(1)

    if (connectionError) {
      return NextResponse.json(
        {
          error: "Error de conexión a la base de datos",
          details: connectionError,
          session: {
            user: session.user.email,
            authenticated: true,
          },
        },
        { status: 500 },
      )
    }

    // Verificar las políticas RLS
    const { data: rlsTest, error: rlsError } = await supabase
      .from("clients")
      .insert([
        {
          tipo: "test",
          cuit: "12345678901", // CUIT sin guiones
          razon_social: "Test RLS",
          condicion_iva: "Responsable Inscripto",
          domicilio: "Test",
          localidad: "Test",
          rubro: "Test",
        },
      ])
      .select()

    // Intentar eliminar el registro de prueba si se creó
    if (rlsTest && rlsTest.length > 0) {
      await supabase.from("clients").delete().eq("id", rlsTest[0].id)
    }

    return NextResponse.json({
      connection: "OK",
      session: {
        user: session.user.email,
        authenticated: true,
        id: session.user.id,
      },
      rlsTest: rlsError ? "Error: " + rlsError.message : "OK",
      message: "La conexión a la base de datos está funcionando correctamente.",
    })
  } catch (error) {
    console.error("Error en la prueba de Supabase:", error)
    return NextResponse.json({ error: "Error inesperado", details: error }, { status: 500 })
  }
}
