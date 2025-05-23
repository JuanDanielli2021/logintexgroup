"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useClientes } from "@/lib/hooks/useClientes"
import type { Prefactura } from "@/lib/hooks/usePrefacturas"

interface PrefacturaFormProps {
  onSubmit: (data: any) => void
  initialData?: Prefactura
  isSubmitting?: boolean
}

export function PrefacturaForm({ onSubmit, initialData, isSubmitting = false }: PrefacturaFormProps) {
  const { clientes, loadingClientes } = useClientes()

  // Buscar el cliente en los datos si tenemos un initialData
  const clienteInicial = initialData?.cliente || null

  const [formData, setFormData] = useState({
    cliente_id: initialData?.cliente_id || "",
    fecha: initialData?.fecha ? new Date(initialData.fecha) : new Date(),
    concepto: initialData?.concepto || "importacion",
    descripcion: initialData?.descripcion || "",
    cantidad: initialData?.cantidad ? initialData.cantidad.toString() : "",
  })

  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(clienteInicial)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejador específico para el campo cantidad que permite solo números y un punto decimal
  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Permitir solo dígitos y un punto decimal
    // Regex: permite dígitos, un punto decimal opcional, y más dígitos opcionales después del punto
    if (value === "" || /^[0-9]+(\.[0-9]*)?$/.test(value)) {
      setFormData((prev) => ({ ...prev, cantidad: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Si el campo es cliente_id, buscar y actualizar el cliente seleccionado
    if (name === "cliente_id") {
      const cliente = clientes.find((c) => c.id === value)
      setClienteSeleccionado(cliente || null)
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, fecha: date }))
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Convertir cantidad a número
    const cantidad = formData.cantidad ? Number.parseFloat(formData.cantidad) : 0

    // Crear objeto de datos para enviar
    const datosParaEnviar = {
      ...formData,
      cantidad,
      cliente: clienteSeleccionado,
    }

    onSubmit(datosParaEnviar)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cliente_id">Cliente *</Label>
          <Select
            value={formData.cliente_id}
            onValueChange={(value) => handleSelectChange("cliente_id", value)}
            required
            disabled={isSubmitting || loadingClientes}
          >
            <SelectTrigger id="cliente_id">
              <SelectValue placeholder={loadingClientes ? "Cargando clientes..." : "Seleccionar cliente"} />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id!}>
                  {cliente.razon_social} ({cliente.cuit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mostrar información de la empresa asociada si el cliente es un despachante */}
        <div className="space-y-2">
          <Label>Empresa Asociada</Label>
          {clienteSeleccionado && clienteSeleccionado.tipo === "despachante" ? (
            <div className="rounded-md border border-brand-blue-100 bg-brand-blue-50 px-3 py-2 text-sm">
              <p className="font-medium text-brand-blue-700">{clienteSeleccionado.razon_social_empresa}</p>
              {clienteSeleccionado.domicilio_empresa && (
                <p className="mt-1 text-xs text-gray-600">{clienteSeleccionado.domicilio_empresa}</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              No aplicable
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal", !formData.fecha && "text-muted-foreground")}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.fecha ? format(formData.fecha, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={formData.fecha} onSelect={handleDateChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="concepto">Concepto *</Label>
          <Select
            value={formData.concepto}
            onValueChange={(value) => handleSelectChange("concepto", value)}
            required
            disabled={isSubmitting}
          >
            <SelectTrigger id="concepto">
              <SelectValue placeholder="Seleccionar concepto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="importacion">Importación</SelectItem>
              <SelectItem value="exportacion">Exportación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cantidad">Cantidad *</Label>
          <Input
            id="cantidad"
            name="cantidad"
            type="text" // Cambiado de "number" a "text" para mayor control
            inputMode="decimal" // Sugiere teclado numérico con punto decimal en dispositivos móviles
            placeholder="0"
            value={formData.cantidad}
            onChange={handleCantidadChange}
            required
            className="font-mono"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="descripcion">Descripción *</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            placeholder="Detalle de la operación"
            value={formData.descripcion}
            onChange={handleChange}
            required
            className="min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full bg-brand-blue-500 hover:bg-brand-blue-600" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Actualizar Pre-Factura" : "Crear Pre-Factura"}
      </Button>
    </form>
  )
}
