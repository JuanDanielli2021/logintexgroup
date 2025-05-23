"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertTriangle, CheckCircle, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DisableRLSPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const { toast } = useToast()

  const disableRLS = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug/disable-rls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al deshabilitar RLS")
      }

      setResult({
        success: data.success,
        message: data.message,
      })

      toast({
        title: data.success ? "Operación exitosa" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      })
    } catch (error: any) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: error.message || "Error inesperado al deshabilitar RLS",
      })

      toast({
        title: "Error",
        description: error.message || "Error inesperado al deshabilitar RLS",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyScript = () => {
    const script = `
-- Script para deshabilitar RLS en las tablas principales
-- IMPORTANTE: Esto elimina la protección de seguridad a nivel de fila
-- Solo debe usarse en entornos de desarrollo o cuando se comprenden las implicaciones

-- Deshabilitar RLS para la tabla clients
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla prefacturas
ALTER TABLE prefacturas DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla facturas
ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;
    `
    navigator.clipboard.writeText(script)
    toast({
      title: "Copiado",
      description: "Script SQL copiado al portapapeles",
    })
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Deshabilitar RLS</CardTitle>
          <CardDescription>
            Esta herramienta deshabilitará la seguridad a nivel de fila (RLS) para las tablas principales de la
            aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md border border-yellow-300 bg-yellow-50 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Advertencia</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Deshabilitar RLS eliminará la protección de seguridad a nivel de fila para las tablas. Esto
                    significa que todos los usuarios podrán acceder a todos los datos.
                  </p>
                  <p className="mt-2">
                    Esta acción solo debe realizarse en entornos de desarrollo o cuando se comprenden completamente las
                    implicaciones de seguridad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {result && (
            <div
              className={`mb-6 rounded-md ${
                result.success ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
              } p-4`}
            >
              <div className="flex">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                    {result.success ? "Operación exitosa" : "Error"}
                  </h3>
                  <div className={`mt-2 text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
                    <p>{result.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border p-4">
            <h3 className="mb-2 text-sm font-medium">Script SQL para deshabilitar RLS</h3>
            <pre className="mb-2 overflow-auto rounded-md bg-gray-100 p-2 text-xs">
              <code>{`-- Deshabilitar RLS para la tabla clients
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla prefacturas
ALTER TABLE prefacturas DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS para la tabla facturas
ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;`}</code>
            </pre>
            <Button variant="outline" size="sm" onClick={copyScript} className="mt-2">
              <Terminal className="mr-2 h-4 w-4" />
              Copiar script
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button onClick={disableRLS} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Deshabilitar RLS"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Si el botón no funciona, copia el script SQL y ejecútalo manualmente en el Editor SQL de Supabase.</p>
      </div>
    </div>
  )
}
