"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FacturaForm } from "@/components/facturacion/factura-form"
import { useFacturas, type Factura } from "@/lib/hooks/useFacturas"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface FacturaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facturaData?: Factura
  mode?: "create" | "edit"
}

export function FacturaDialog({ open, onOpenChange, facturaData, mode = "create" }: FacturaDialogProps) {
  const { createFactura, updateFactura } = useFacturas()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      console.log("Datos del formulario a enviar:", data)

      if (mode === "create") {
        await createFactura(data)
      } else if (mode === "edit" && facturaData?.id) {
        await updateFactura(facturaData.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar factura:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isSubmitting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[95%] md:max-w-[90%] lg:max-w-[1100px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Factura Electrónica" : "Editar Factura Electrónica"}</DialogTitle>
          <DialogDescription>Complete los datos de la factura según los requisitos de AFIP.</DialogDescription>
        </DialogHeader>

        <FacturaForm onSubmit={handleSubmit} initialData={facturaData} isSubmitting={isSubmitting} />

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Cancelar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
