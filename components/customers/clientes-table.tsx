"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MoreHorizontal, Edit, Trash2, Eye, RefreshCw } from "lucide-react"
import { ClienteDialog } from "@/components/customers/cliente-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClientes } from "@/lib/hooks/useClientes"
import { formatearCUIT } from "@/lib/utils"
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
import { useToast } from "@/hooks/use-toast"

export function ClientesTable() {
  const [activeTab, setActiveTab] = useState("todos")
  const [editingCliente, setEditingCliente] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const { clientes, loading, error, removeCliente, reloadClientes } = useClientes()

  // Efecto para mostrar errores como toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleEdit = (cliente: any) => {
    setEditingCliente(cliente)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setClienteToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (clienteToDelete) {
      const success = await removeCliente(clienteToDelete)
      setDeleteDialogOpen(false)
      setClienteToDelete(null)

      if (success) {
        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado correctamente.",
        })
      }
    }
  }

  const handleRefresh = async () => {
    await reloadClientes()
    toast({
      title: "Lista actualizada",
      description: "La lista de clientes ha sido actualizada.",
    })
  }

  const filteredClientes = clientes.filter((cliente) => {
    if (activeTab === "todos") return true
    if (activeTab === "despachantes") return cliente.tipo === "despachante"
    if (activeTab === "directos") return cliente.tipo === "cliente"
    return true
  })

  return (
    <Card className="border-brand-blue-100">
      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="p-1">
        <div className="px-4 pt-4 flex justify-between items-center">
          <TabsList className="bg-brand-blue-50 grid w-full grid-cols-3 mb-4">
            <TabsTrigger
              value="todos"
              className="data-[state=active]:bg-white data-[state=active]:text-brand-blue-700 data-[state=active]:shadow-sm"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="despachantes"
              className="data-[state=active]:bg-white data-[state=active]:text-brand-blue-700 data-[state=active]:shadow-sm"
            >
              Despachantes / Empresas
            </TabsTrigger>
            <TabsTrigger
              value="directos"
              className="data-[state=active]:bg-white data-[state=active]:text-brand-blue-700 data-[state=active]:shadow-sm"
            >
              Clientes Directos
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading} className="ml-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Actualizar</span>
          </Button>
        </div>

        <TabsContent value="todos" className="m-0">
          <ClientesTableContent
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="despachantes" className="m-0">
          <ClientesTableContent
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="directos" className="m-0">
          <ClientesTableContent
            clientes={filteredClientes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {dialogOpen && (
        <ClienteDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              // Recargar datos cuando se cierra el diálogo
              reloadClientes()
            }
          }}
          clienteData={editingCliente}
          mode="edit"
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el cliente y todos los datos asociados.
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

function ClientesTableContent({
  clientes,
  onEdit,
  onDelete,
  loading,
}: {
  clientes: any[]
  onEdit: (cliente: any) => void
  onDelete: (id: string) => void
  loading: boolean
}) {
  return (
    <div className="rounded-md border-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[150px]">CUIT</TableHead>
            <TableHead>Razón Social</TableHead>
            <TableHead>Condición IVA</TableHead>
            <TableHead>Localidad</TableHead>
            <TableHead>Rubro</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-blue-600"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : clientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          ) : (
            clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium whitespace-nowrap">{formatearCUIT(cliente.cuit)}</TableCell>
                <TableCell>{cliente.razon_social}</TableCell>
                <TableCell>{cliente.condicion_iva}</TableCell>
                <TableCell>{cliente.localidad}</TableCell>
                <TableCell>{cliente.rubro}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      cliente.tipo === "despachante"
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }
                  >
                    {cliente.tipo === "despachante" ? "Despachante / Empresa" : "Cliente Directo"}
                  </Badge>
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
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(cliente)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600" onClick={() => onDelete(cliente.id)}>
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
  )
}
