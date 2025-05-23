"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DespachanteForm } from "@/components/customers/despachante-form"
import { ClienteDirectoForm } from "@/components/customers/cliente-directo-form"
import { useClientes, type Cliente } from "@/lib/hooks/useClientes"

interface ClienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteData?: Cliente
  mode?: "create" | "edit"
}

export function ClienteDialog({ open, onOpenChange, clienteData, mode = "create" }: ClienteDialogProps) {
  const [activeTab, setActiveTab] = useState(
    clienteData ? (clienteData.tipo === "despachante" ? "despachante" : "directo") : "despachante",
  )
  const { createCliente, updateCliente } = useClientes()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (mode === "create") {
        await createCliente(data)
      } else if (mode === "edit" && clienteData?.id) {
        await updateCliente(clienteData.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar cliente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nuevo Cliente" : "Editar Cliente"}</DialogTitle>
          <DialogDescription>Complete los datos del cliente según su tipo.</DialogDescription>
        </DialogHeader>

        {mode === "create" && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="despachante">Despachante / Empresa</TabsTrigger>
              <TabsTrigger value="directo">Cliente Directo</TabsTrigger>
            </TabsList>

            <TabsContent value="despachante">
              <DespachanteForm
                onSubmit={handleSubmit}
                initialData={clienteData?.tipo === "despachante" ? clienteData : undefined}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="directo">
              <ClienteDirectoForm
                onSubmit={handleSubmit}
                initialData={clienteData?.tipo === "cliente" ? clienteData : undefined}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        )}

        {mode === "edit" && (
          <>
            {clienteData?.tipo === "despachante" ? (
              <DespachanteForm onSubmit={handleSubmit} initialData={clienteData} isSubmitting={isSubmitting} />
            ) : (
              <ClienteDirectoForm onSubmit={handleSubmit} initialData={clienteData} isSubmitting={isSubmitting} />
            )}
          </>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
