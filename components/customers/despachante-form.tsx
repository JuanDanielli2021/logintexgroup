"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Cliente } from "@/lib/hooks/useClientes"
import { Loader2 } from "lucide-react"

interface DespachanteFormProps {
  onSubmit: (data: any) => void
  initialData?: Cliente
  isSubmitting?: boolean
}

export function DespachanteForm({ onSubmit, initialData, isSubmitting = false }: DespachanteFormProps) {
  const [formData, setFormData] = useState({
    tipo: "despachante",
    cuit: initialData?.cuit || "",
    razon_social: initialData?.razon_social || "",
    condicion_iva: initialData?.condicion_iva || "",
    domicilio: initialData?.domicilio || "",
    razon_social_empresa: initialData?.razon_social_empresa || "",
    domicilio_empresa: initialData?.domicilio_empresa || "",
    localidad: initialData?.localidad || "",
    rubro: initialData?.rubro || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Crear una copia del formData para modificar
    const formDataToSubmit = { ...formData }

    // Eliminar guiones del CUIT antes de enviar
    formDataToSubmit.cuit = formDataToSubmit.cuit.replace(/[^0-9]/g, "")

    onSubmit(formDataToSubmit)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cuit">CUIT Despachante *</Label>
          <Input
            id="cuit"
            name="cuit"
            placeholder="XX-XXXXXXXX-X"
            value={formData.cuit}
            onChange={(e) => {
              // Formatear CUIT automáticamente (XX-XXXXXXXX-X) para visualización
              let value = e.target.value.replace(/[^\d]/g, "")
              if (value.length > 11) value = value.slice(0, 11)
              if (value.length >= 2) value = value.slice(0, 2) + "-" + value.slice(2)
              if (value.length >= 11) value = value.slice(0, 11) + "-" + value.slice(11)
              setFormData((prev) => ({ ...prev, cuit: value }))
            }}
            required
            className="font-mono"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="razon_social">Razón Social Despachante *</Label>
          <Input
            id="razon_social"
            name="razon_social"
            placeholder="Nombre completo o razón social"
            value={formData.razon_social}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="condicion_iva">Condición frente al IVA *</Label>
          <Select
            value={formData.condicion_iva}
            onValueChange={(value) => handleSelectChange("condicion_iva", value)}
            required
            disabled={isSubmitting}
          >
            <SelectTrigger id="condicion_iva">
              <SelectValue placeholder="Seleccionar condición" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
              <SelectItem value="Monotributista">Monotributista</SelectItem>
              <SelectItem value="Exento">Exento</SelectItem>
              <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domicilio">Domicilio Comercial *</Label>
          <Input
            id="domicilio"
            name="domicilio"
            placeholder="Dirección completa"
            value={formData.domicilio}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="razon_social_empresa">Razón Social de la Empresa *</Label>
          <Input
            id="razon_social_empresa"
            name="razon_social_empresa"
            placeholder="Nombre de la empresa (sin CUIT)"
            value={formData.razon_social_empresa}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domicilio_empresa">Domicilio Empresa</Label>
          <Input
            id="domicilio_empresa"
            name="domicilio_empresa"
            placeholder="Dirección de la empresa (opcional)"
            value={formData.domicilio_empresa || ""}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="localidad">Localidad Empresa *</Label>
          <Input
            id="localidad"
            name="localidad"
            placeholder="Ciudad o localidad"
            value={formData.localidad}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rubro">Rubro Empresa *</Label>
          <Input
            id="rubro"
            name="rubro"
            placeholder="Sector o actividad principal"
            value={formData.rubro}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full bg-brand-blue-500 hover:bg-brand-blue-600" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Actualizar Despachante / Empresa" : "Crear Despachante / Empresa"}
      </Button>
    </form>
  )
}
