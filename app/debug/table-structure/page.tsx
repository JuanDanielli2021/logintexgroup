"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TableStructurePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableStructure, setTableStructure] = useState<any>(null)

  const checkTableStructure = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/debug/check-table-structure")
      const data = await response.json()

      if (response.ok) {
        setTableStructure(data)
      } else {
        setError(data.error || "Error al verificar la estructura de la tabla")
      }
    } catch (err: any) {
      setError(err.message || "Error inesperado al verificar la estructura de la tabla")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkTableStructure()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Verificación de Estructura de Tabla</h1>

      <div className="mb-4 flex justify-end">
        <Button onClick={checkTableStructure} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Verificar Nuevamente"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !error && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Verificando estructura de la tabla...</p>
        </div>
      )}

      {!loading && !error && tableStructure && (
        <div className="space-y-8">
          {tableStructure.missingColumns && tableStructure.missingColumns.length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Columnas Faltantes</AlertTitle>
              <AlertDescription>
                <p>Las siguientes columnas son necesarias pero no existen en la tabla "facturas":</p>
                <ul className="list-disc pl-5 mt-2">
                  {tableStructure.missingColumns.map((column: string) => (
                    <li key={column}>{column}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Estructura de la Tabla "facturas"</CardTitle>
              <CardDescription>
                Columnas actuales en la tabla "facturas" ({tableStructure.facturaColumns?.length || 0} columnas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de Columna</TableHead>
                    <TableHead>Tipo de Dato</TableHead>
                    <TableHead>¿Puede ser Nulo?</TableHead>
                    <TableHead>Valor por Defecto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStructure.facturaColumns?.map((column: any) => (
                    <TableRow key={column.column_name}>
                      <TableCell className="font-medium">{column.column_name}</TableCell>
                      <TableCell>{column.data_type}</TableCell>
                      <TableCell>{column.is_nullable === "YES" ? "Sí" : "No"}</TableCell>
                      <TableCell>{column.column_default || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Columnas Requeridas para el Formulario</CardTitle>
              <CardDescription>
                Estas son las columnas necesarias para el formulario de facturas (
                {tableStructure.requiredColumns?.length || 0} columnas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de Columna</TableHead>
                    <TableHead>¿Existe en la Tabla?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStructure.requiredColumns?.map((column: string) => {
                    const exists = tableStructure.facturaColumns?.some((c: any) => c.column_name === column)
                    return (
                      <TableRow key={column}>
                        <TableCell className="font-medium">{column}</TableCell>
                        <TableCell>
                          {exists ? (
                            <span className="text-green-600 font-medium">Sí</span>
                          ) : (
                            <span className="text-red-600 font-medium">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estructura de la Tabla "prefacturas" (Referencia)</CardTitle>
              <CardDescription>
                Columnas actuales en la tabla "prefacturas" ({tableStructure.prefacturaColumns?.length || 0} columnas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de Columna</TableHead>
                    <TableHead>Tipo de Dato</TableHead>
                    <TableHead>¿Puede ser Nulo?</TableHead>
                    <TableHead>Valor por Defecto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStructure.prefacturaColumns?.map((column: any) => (
                    <TableRow key={column.column_name}>
                      <TableCell className="font-medium">{column.column_name}</TableCell>
                      <TableCell>{column.data_type}</TableCell>
                      <TableCell>{column.is_nullable === "YES" ? "Sí" : "No"}</TableCell>
                      <TableCell>{column.column_default || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
