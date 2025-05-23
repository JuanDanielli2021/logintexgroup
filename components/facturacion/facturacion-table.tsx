"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Eye, Printer, Download, RefreshCw } from "lucide-react"
import { FacturaDialog } from "@/components/facturacion/factura-dialog"
import { formatearFecha, formatearMoneda } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"

export function FacturacionTable() {
  const [editingFactura, setEditingFactura] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [facturaToDelete, setFacturaToDelete] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [facturas, setFacturas] = useState<any[]>([])
  const [loadingFacturas, setLoadingFacturas] = useState(true)

  // Cargar facturas al inicializar el componente
  useEffect(() => {
    loadFacturas()
  }, [])

  // Función para cargar facturas directamente
  const loadFacturas = async () => {
    try {
      setLoadingFacturas(true)
      setIsRefreshing(true)

      // Usar directamente el cliente de Supabase para mayor control
      const { data, error: supabaseError } = await supabase
        .from("facturas")
        .select(`
          *,
          clients:cliente_id (
            id, 
            tipo, 
            cuit, 
            razon_social, 
            condicion_iva, 
            razon_social_empresa, 
            domicilio_empresa
          ),
          prefacturas:prefactura_id (
            id,
            concepto,
            descripcion
          )
        `)
        .order("fecha_emision", { ascending: false })

      if (supabaseError) {
        console.error("Error al cargar facturas:", supabaseError)
        setFacturas([])
        return
      }

      console.log("Facturas cargadas en FacturacionTable:", data)

      // Transformar los datos para que coincidan con la estructura esperada
      const transformedData = data.map((item) => ({
        ...item,
        cliente: item.clients,
        prefactura: item.prefacturas,
        clients: undefined,
        prefacturas: undefined,
      }))

      setFacturas(transformedData)
    } catch (err) {
      console.error("Error inesperado al cargar facturas:", err)
      setFacturas([])
    } finally {
      setLoadingFacturas(false)
      setIsRefreshing(false)
    }
  }

  const handleEdit = (factura: any) => {
    setEditingFactura(factura)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setFacturaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (facturaToDelete) {
      try {
        setIsRefreshing(true)
        const { error } = await supabase.from("facturas").delete().eq("id", facturaToDelete)

        if (error) {
          console.error("Error al eliminar factura:", error)
        } else {
          // Recargar facturas después de eliminar
          await loadFacturas()
        }
      } catch (err) {
        console.error("Error inesperado al eliminar factura:", err)
      } finally {
        setDeleteDialogOpen(false)
        setFacturaToDelete(null)
        setIsRefreshing(false)
      }
    }
  }

  const handleRefresh = async () => {
    await loadFacturas()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "emitida":
        return (
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
            Emitida
          </Badge>
        )
      case "pagada":
        return (
          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
            Pagada
          </Badge>
        )
      case "vencida":
        return (
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
            Vencida
          </Badge>
        )
      case "anulada":
        return (
          <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
            Anulada
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  return (
    <Card className="border-brand-blue-100">
      <div className="flex justify-end p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingFacturas || isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>
      <div className="rounded-md border-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Comprobante</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Condición Venta</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingFacturas ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-blue-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : facturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No se encontraron facturas.
                </TableCell>
              </TableRow>
            ) : (
              facturas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell className="font-medium">
                    {factura.tipo_comprobante} {factura.punto_venta}-{factura.numero_comprobante}
                  </TableCell>
                  <TableCell>{formatearFecha(new Date(factura.fecha_emision))}</TableCell>
                  <TableCell>{factura.cliente?.razon_social}</TableCell>
                  <TableCell>{factura.cliente?.cuit}</TableCell>
                  <TableCell>{factura.condicion_venta}</TableCell>
                  <TableCell className="font-medium font-mono">{formatearMoneda(factura.total)}</TableCell>
                  <TableCell>{getEstadoBadge(factura.estado)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Ver detalles</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(factura)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Printer className="mr-2 h-4 w-4" />
                          <span>Imprimir</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Download className="mr-2 h-4 w-4" />
                          <span>Descargar PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => handleDelete(factura.id!)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {dialogOpen && (
        <FacturaDialog open={dialogOpen} onOpenChange={setDialogOpen} facturaData={editingFactura} mode="edit" />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la factura y todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
