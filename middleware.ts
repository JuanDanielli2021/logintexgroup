import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Crear un cliente de Supabase específico para middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refrescar la sesión si existe
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // Rutas protegidas que requieren autenticación
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard")

  // Si no hay sesión y es una ruta protegida, redirigir a login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión y es una ruta pública, redirigir a dashboard
  if (session && isPublicRoute) {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Especificar en qué rutas se ejecutará este middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
