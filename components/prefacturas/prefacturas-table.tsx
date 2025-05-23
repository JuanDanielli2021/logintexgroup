"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Eye, FileText, RefreshCw } from "lucide-react"
import { PrefacturaDialog } from "@/components/prefacturas/prefactura-dialog"
import { formatearFecha } from "@/lib/utils"
import { usePrefacturas } from "@/lib/hooks/usePrefacturas"
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

export function PrefacturasTable() {
  const [editingPrefactura, setEditingPrefactura] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [prefacturaToDelete, setPrefacturaToDelete] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { prefacturas, loadingPrefacturas, removePrefactura, loadPrefacturas } = usePrefacturas()

  const handleEdit = (prefactura: any) => {
    setEditingPrefactura(prefactura)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPrefacturaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (prefacturaToDelete) {
      await removePrefactura(prefacturaToDelete)
      setDeleteDialogOpen(false)
      setPrefacturaToDelete(null)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadPrefacturas()
    setIsRefreshing(false)
  }

  return (
    <Card className="border-brand-blue-100">
      <div className="flex justify-end p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loadingPrefacturas || isRefreshing}
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
              <TableHead>Cliente</TableHead>
              <TableHead>Empresa Asociada</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingPrefacturas ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-blue-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : prefacturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No se encontraron pre-facturas.
                </TableCell>
              </TableRow>
            ) : (
              prefacturas.map((prefactura) => (
                <TableRow key={prefactura.id}>
                  <TableCell className="font-medium">{prefactura.cliente?.razon_social}</TableCell>
                  <TableCell>
                    {prefactura.cliente?.tipo === "despachante" && prefactura.cliente?.razon_social_empresa ? (
                      <span className="text-brand-blue-700">{prefactura.cliente.razon_social_empresa}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{prefactura.cliente?.cuit}</TableCell>
                  <TableCell>{formatearFecha(new Date(prefactura.fecha))}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        prefactura.concepto === "importacion"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-green-200 bg-green-50 text-green-700"
                      }
                    >
                      {prefactura.concepto === "importacion" ? "Importación" : "Exportación"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={prefactura.descripcion}>
                    {prefactura.descripcion}
                  </TableCell>
                  <TableCell className="font-medium text-right font-mono">
                    {prefactura.cantidad.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(prefactura)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Generar factura</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600"
                          onClick={() => handleDelete(prefactura.id!)}
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
        <PrefacturaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          prefacturaData={editingPrefactura}
          mode="edit"
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la pre-factura y todos los datos
              asociados.
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
