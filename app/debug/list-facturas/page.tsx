"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function ListFacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFacturas = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/debug/list-facturas")
      const data = await response.json()

      if (response.ok) {
        setFacturas(data.facturas || [])
        setPolicies(data.policies || [])
      } else {
        setError(data.error || "Error desconocido")
        console.error("Error al cargar facturas:", data)
      }
    } catch (err) {
      setError("Error inesperado al cargar facturas")
      console.error("Error inesperado:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacturas()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Diagnóstico de Facturas</h1>
        <Button onClick={fetchFacturas} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Facturas en la Base de Datos</CardTitle>
          <CardDescription>Se encontraron {facturas.length} facturas en la base de datos.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : facturas.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No se encontraron facturas en la base de datos.</p>
          ) : (
            <div className="overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(facturas, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Políticas RLS para Facturas</CardTitle>
          <CardDescription>Políticas de seguridad a nivel de fila (RLS) para la tabla facturas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : policies.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No se encontraron políticas RLS para la tabla facturas.</p>
          ) : (
            <div className="overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(policies, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Solución para Problemas de Visualización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">1. Verificar Políticas RLS</h3>
            <p className="text-sm text-gray-600">
              Si hay facturas en la base de datos pero no se muestran en la interfaz, es posible que las políticas RLS
              estén bloqueando el acceso. Considera deshabilitar temporalmente RLS para la tabla facturas.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => (window.location.href = "/debug/disable-rls")}
            >
              Ir a Deshabilitar RLS
            </Button>
          </div>

          <div>
            <h3 className="font-semibold">2. Verificar Estructura de la Tabla</h3>
            <p className="text-sm text-gray-600">
              Asegúrate de que la tabla facturas tenga todas las columnas necesarias.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => (window.location.href = "/debug/table-structure")}
            >
              Verificar Estructura
            </Button>
          </div>

          <div>
            <h3 className="font-semibold">3. Limpiar Caché del Navegador</h3>
            <p className="text-sm text-gray-600">
              A veces, el navegador puede estar mostrando datos en caché. Intenta limpiar la caché o recargar la página
              con Ctrl+F5.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
