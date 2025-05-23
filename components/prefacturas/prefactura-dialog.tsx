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
import { PrefacturaForm } from "@/components/prefacturas/prefactura-form"
import { usePrefacturas, type Prefactura } from "@/lib/hooks/usePrefacturas"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface PrefacturaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefacturaData?: Prefactura
  mode?: "create" | "edit"
}

export function PrefacturaDialog({ open, onOpenChange, prefacturaData, mode = "create" }: PrefacturaDialogProps) {
  const { createPrefactura, updatePrefactura } = usePrefacturas()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (mode === "create") {
        await createPrefactura(data)
      } else if (mode === "edit" && prefacturaData?.id) {
        await updatePrefactura(prefacturaData.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar prefactura:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isSubmitting && onOpenChange(newOpen)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Pre-Factura" : "Editar Pre-Factura"}</DialogTitle>
          <DialogDescription>Complete los datos de la pre-factura.</DialogDescription>
        </DialogHeader>

        <PrefacturaForm onSubmit={handleSubmit} initialData={prefacturaData} isSubmitting={isSubmitting} />

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
