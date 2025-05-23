"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle, Copy, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TablesDebugPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/debug/check-tables")

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err.message || "Error desconocido")
        toast({
          title: "Error",
          description: `No se pudo obtener la información de diagnóstico: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Script SQL copiado al portapapeles",
    })
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-lg font-medium">Cargando diagnóstico...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error de Diagnóstico</CardTitle>
            <CardDescription className="text-red-600">No se pudo obtener la información de diagnóstico</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-2xl font-bold">Diagnóstico de Tablas y Políticas RLS</h1>

      {data && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Estado de Autenticación</CardTitle>
              <CardDescription>Información del usuario autenticado</CardDescription>
            </CardHeader>
            <CardContent>
              {data.user ? (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Usuario autenticado</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>ID: {data.user.id}</p>
                        <p>Email: {data.user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">No autenticado</h3>
                      <p className="mt-2 text-sm text-red-700">
                        Debes iniciar sesión para realizar operaciones en la base de datos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="structure" className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="structure">Estructura de Tablas</TabsTrigger>
              <TabsTrigger value="policies">Políticas RLS</TabsTrigger>
              <TabsTrigger value="tests">Pruebas de Inserción</TabsTrigger>
            </TabsList>

            <TabsContent value="structure">
              <Card>
                <CardHeader>
                  <CardTitle>Estructura de Tablas</CardTitle>
                  <CardDescription>Información sobre las columnas de cada tabla</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="prefacturas">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="clients">Clientes</TabsTrigger>
                      <TabsTrigger value="prefacturas">Pre-Facturas</TabsTrigger>
                      <TabsTrigger value="facturas">Facturas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="clients">
                      {data.tablesInfo.clients.error ? (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-red-700">{data.tablesInfo.clients.error}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="p-2 text-left">Columna</th>
                                <th className="p-2 text-left">Tipo</th>
                                <th className="p-2 text-left">Nullable</th>
                                <th className="p-2 text-left">Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.tablesInfo.clients.columns?.map((col: any, i: number) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2">{col.column_name}</td>
                                  <td className="p-2">{col.data_type}</td>
                                  <td className="p-2">{col.is_nullable}</td>
                                  <td className="p-2">{col.column_default || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="prefacturas">
                      {data.tablesInfo.prefacturas.error ? (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-red-700">{data.tablesInfo.prefacturas.error}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="p-2 text-left">Columna</th>
                                <th className="p-2 text-left">Tipo</th>
                                <th className="p-2 text-left">Nullable</th>
                                <th className="p-2 text-left">Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.tablesInfo.prefacturas.columns?.map((col: any, i: number) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2">{col.column_name}</td>
                                  <td className="p-2">{col.data_type}</td>
                                  <td className="p-2">{col.is_nullable}</td>
                                  <td className="p-2">{col.column_default || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="facturas">
                      {data.tablesInfo.facturas.error ? (
                        <div className="rounded-md bg-red-50 p-4">
                          <p className="text-red-700">{data.tablesInfo.facturas.error}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="p-2 text-left">Columna</th>
                                <th className="p-2 text-left">Tipo</th>
                                <th className="p-2 text-left">Nullable</th>
                                <th className="p-2 text-left">Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.tablesInfo.facturas.columns?.map((col: any, i: number) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2">{col.column_name}</td>
                                  <td className="p-2">{col.data_type}</td>
                                  <td className="p-2">{col.is_nullable}</td>
                                  <td className="p-2">{col.column_default || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies">
              <Card>
                <CardHeader>
                  <CardTitle>Políticas RLS</CardTitle>
                  <CardDescription>Políticas de seguridad a nivel de fila configuradas</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.policiesError ? (
                    <div className="rounded-md bg-red-50 p-4">
                      <p className="text-red-700">{data.policiesError}</p>
                    </div>
                  ) : data.policies.length === 0 ? (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <p className="text-yellow-700">No se encontraron políticas RLS configuradas.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="p-2 text-left">Tabla</th>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2 text-left">Acción</th>
                            <th className="p-2 text-left">Roles</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.policies.map((policy: any, i: number) => (
                            <tr key={i} className="border-b">
                              <td className="p-2">{policy.tablename}</td>
                              <td className="p-2">{policy.policyname}</td>
                              <td className="p-2">{policy.permissive}</td>
                              <td className="p-2">{policy.roles?.join(", ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tests">
              <Card>
                <CardHeader>
                  <CardTitle>Pruebas de Inserción</CardTitle>
                  <CardDescription>Resultados de intentos de inserción en las tablas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-2 text-lg font-medium">Pre-Facturas</h3>
                      {data.testResults.prefacturas.success ? (
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Inserción exitosa</h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>La inserción de prueba en la tabla prefacturas fue exitosa.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Error de inserción</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>{data.testResults.prefacturas.error}</p>
                                {data.testResults.prefacturas.details && (
                                  <p className="mt-1 font-mono text-xs">{data.testResults.prefacturas.details}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-lg font-medium">Facturas</h3>
                      {data.testResults.facturas.success ? (
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-green-800">Inserción exitosa</h3>
                              <div className="mt-2 text-sm text-green-700">
                                <p>La inserción de prueba en la tabla facturas fue exitosa.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <XCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">Error de inserción</h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>{data.testResults.facturas.error}</p>
                                {data.testResults.facturas.details && (
                                  <p className="mt-1 font-mono text-xs">{data.testResults.facturas.details}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">Script de Corrección</CardTitle>
              <CardDescription className="text-blue-600">
                Ejecuta este script SQL en el Editor SQL de Supabase para corregir las políticas RLS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="max-h-96 overflow-auto rounded-md bg-gray-900 p-4 text-sm text-white">
                  <code>{data.fixScript}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  onClick={() => copyToClipboard(data.fixScript)}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copiar
                </Button>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => copyToClipboard(data.fixScript)}
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  Copiar Script SQL
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="text-lg font-medium text-yellow-800">Instrucciones para resolver el problema</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-yellow-700">
              <li>
                Copia el script SQL de corrección y ejecútalo en el <strong>Editor SQL de Supabase</strong>.
              </li>
              <li>
                Verifica que las políticas RLS se hayan configurado correctamente en la sección{" "}
                <strong>Authentication &gt; Policies</strong> del panel de Supabase.
              </li>
              <li>
                Asegúrate de que los datos que envías a la base de datos tengan el formato correcto según la estructura
                de las tablas.
              </li>
              <li>
                Después de ejecutar el script, regresa a esta página y recarga para verificar que las pruebas de
                inserción sean exitosas.
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}
