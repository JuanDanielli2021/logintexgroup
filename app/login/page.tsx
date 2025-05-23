"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EnvChecker } from "@/components/env-checker"
import { createClient } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message || "Error al iniciar sesión. Por favor intenta nuevamente.")
        return
      }

      // Forzar recarga para asegurar que la sesión se establezca correctamente
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Error durante el login:", err)
      setError("Ocurrió un error al iniciar sesión. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center login-gradient px-4 py-12 sm:px-6 lg:px-8">
      <EnvChecker />
      <div className="absolute inset-0 z-0 opacity-40">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <radialGradient id="radialGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(0, 145, 213, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#radialGradient)" />
        </svg>
      </div>

      <div className="z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-2">
            <Image src="/logintex-logo.png" alt="LogintexGroup" width={60} height={40} className="object-contain" />
          </div>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold text-[#0091d5]">LogintexGroup</CardTitle>
            <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-brand-blue-700">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    placeholder="nombre@ejemplo.com"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-lg border-brand-blue-100 focus:border-brand-blue-300 focus:ring focus:ring-brand-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-brand-blue-700">
                      Contraseña
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-brand-blue-500 hover:text-brand-blue-600 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    required
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="rounded-lg border-brand-blue-100 focus:border-brand-blue-300 focus:ring focus:ring-brand-blue-200 focus:ring-opacity-50"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-brand-blue-200 text-brand-blue-500 focus:ring-brand-blue-400"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Recordar mi sesión
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#0091d5] hover:bg-[#007ab8] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-[#0091d5] hover:text-[#007ab8] hover:underline">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
