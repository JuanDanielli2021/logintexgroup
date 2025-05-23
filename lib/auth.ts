"use client"

import { useRouter } from "next/navigation"

// Función para simular inicio de sesión
export function login(email: string, password: string) {
  // En un entorno real, aquí harías una petición a tu API
  // y verificarías las credenciales

  // Para este ejemplo, simplemente establecemos una cookie
  document.cookie = "auth-session=true; path=/; max-age=86400"

  // Devolvemos true para indicar que el login fue exitoso
  return true
}

// Función para cerrar sesión
export function logout() {
  // Eliminamos la cookie de sesión
  document.cookie = "auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
}

// Hook personalizado para usar la autenticación
export function useAuth() {
  const router = useRouter()

  const isAuthenticated = () => {
    // Verificar si existe la cookie de sesión
    return document.cookie.includes("auth-session=true")
  }

  const loginUser = (email: string, password: string) => {
    const success = login(email, password)
    if (success) {
      router.push("/dashboard")
    }
    return success
  }

  const logoutUser = () => {
    logout()
    router.push("/login")
  }

  return {
    isAuthenticated,
    login: loginUser,
    logout: logoutUser,
  }
}
