"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SupabaseDebugPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/supabase-test")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Error desconocido")
      }
    } catch (err) {
      setError("Error al ejecutar la prueba: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico de Supabase</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado de la Conexión</CardTitle>
          <CardDescription>Verifica la conexión con la base de datos Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span>Ejecutando pruebas...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {result?.connection === "OK" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Conexión a la base de datos: {result?.connection}</span>
              </div>

              <div className="flex items-center space-x-2">
                {result?.session?.authenticated ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Autenticación: {result?.session?.authenticated ? "Autenticado" : "No autenticado"}</span>
              </div>

              {result?.session?.user && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Usuario: {result.session.user}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {result?.rlsTest === "OK" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span>Prueba RLS: {result?.rlsTest}</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={runTest} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ejecutar prueba nuevamente
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solución para Políticas RLS</CardTitle>
          <CardDescription>Ejecuta este SQL en el Editor SQL de Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            {`-- Habilitar RLS en la tabla clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer clientes" ON clients;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar clientes" ON clients;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar clientes" ON clients;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar clientes" ON clients;

-- Crear políticas para permitir operaciones CRUD a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer clientes"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar clientes"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar clientes"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar clientes"
  ON clients
  FOR DELETE
  TO authenticated
  USING (true);`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
