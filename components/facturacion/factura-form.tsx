"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PrefacturaResumen } from "@/components/facturacion/prefactura-resumen"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePrefacturas } from "@/lib/hooks/usePrefacturas"
import { Textarea } from "@/components/ui/textarea"

interface FacturaFormProps {
  onSubmit: (data: any) => void
  initialData?: any
  isSubmitting?: boolean
}

interface FacturaItem {
  id: string
  descripcion: string
  cantidad: string
  valorUnitario: string
  subtotal: string
  iva: string
  total: string
}

export function FacturaForm({ onSubmit, initialData, isSubmitting = false }: FacturaFormProps) {
  const { prefacturas, loadingPrefacturas, reloadPrefacturas } = usePrefacturas()
  const [formData, setFormData] = useState({
    tipoComprobante: initialData?.tipoComprobante || "A",
    puntoVenta: initialData?.puntoVenta || "00001",
    numeroComprobante: initialData?.numeroComprobante || "",
    fechaEmision: initialData?.fechaEmision ? new Date(initialData.fechaEmision) : new Date(),
    prefacturaId: initialData?.prefacturaId || "",
    condicionVenta: initialData?.condicionVenta || "Contado",
    cae: initialData?.cae || "",
    fechaVencimientoCae: initialData?.fechaVencimientoCae ? new Date(initialData.fechaVencimientoCae) : new Date(),
    observaciones: initialData?.observaciones || "",
    estado: initialData?.estado || "emitida",
  })

  const [items, setItems] = useState<FacturaItem[]>(
    initialData?.items?.length > 0
      ? initialData.items
      : [
          {
            id: crypto.randomUUID(),
            descripcion: "",
            cantidad: "1",
            valorUnitario: "",
            subtotal: "0",
            iva: "0",
            total: "0",
          },
        ],
  )

  const [totales, setTotales] = useState({
    subtotal: "0",
    iva: "0",
    total: "0",
  })

  const [selectedPrefactura, setSelectedPrefactura] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("datos-factura")

  // Cargar prefacturas al iniciar
  useEffect(() => {
    reloadPrefacturas()
  }, [])

  // Función para recalcular los valores de un ítem
  const recalcularValoresItem = (item: FacturaItem): FacturaItem => {
    const valorUnitarioNum = Number.parseFloat(item.valorUnitario) || 0
    const cantidadNum = Number.parseFloat(item.cantidad) || 0

    const subtotal = valorUnitarioNum * cantidadNum
    const iva = subtotal * 0.21 // 21% de IVA
    const total = subtotal + iva

    return {
      ...item,
      subtotal: subtotal.toFixed(2),
      iva: iva.toFixed(2),
      total: total.toFixed(2),
    }
  }

  // Función para recalcular todos los totales
  const recalcularTotales = (itemsArray: FacturaItem[]) => {
    const subtotalTotal = itemsArray.reduce((sum, item) => sum + (Number.parseFloat(item.subtotal) || 0), 0)
    const ivaTotal = itemsArray.reduce((sum, item) => sum + (Number.parseFloat(item.iva) || 0), 0)
    const total = subtotalTotal + ivaTotal

    setTotales({
      subtotal: subtotalTotal.toFixed(2),
      iva: ivaTotal.toFixed(2),
      total: total.toFixed(2),
    })
  }

  // Actualizar totales cuando cambian los ítems
  useEffect(() => {
    recalcularTotales(items)
  }, [items])

  useEffect(() => {
    if (formData.prefacturaId) {
      const prefactura = prefacturas.find((p) => p.id === formData.prefacturaId)
      setSelectedPrefactura(prefactura)

      if (prefactura) {
        // Inicializar con valores por defecto
        setItems([
          {
            id: crypto.randomUUID(),
            descripcion: prefactura.descripcion || "",
            cantidad: "1",
            valorUnitario: "",
            subtotal: "0",
            iva: "0",
            total: "0",
          },
        ])
      }
    }
  }, [formData.prefacturaId, prefacturas])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }))
    }
  }

  // Manejar cambios en los ítems
  const handleItemChange = (id: string, field: keyof FacturaItem, value: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // Si el campo es valorUnitario o cantidad, recalcular los valores
          if (field === "valorUnitario" || field === "cantidad") {
            return recalcularValoresItem(updatedItem)
          }

          return updatedItem
        }
        return item
      })

      return newItems
    })
  }

  // Agregar un nuevo ítem
  const addItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        id: crypto.randomUUID(),
        descripcion: "",
        cantidad: "1",
        valorUnitario: "",
        subtotal: "0",
        iva: "0",
        total: "0",
      },
    ])
  }

  // Eliminar un ítem
  const removeItem = (id: string) => {
    if (items.length <= 1) return // Mantener al menos un ítem

    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Crear objeto de datos para enviar
    const datosParaEnviar = {
      ...formData,
      items: items.map((item) => ({
        ...item,
        cantidad: Number.parseFloat(item.cantidad),
        valorUnitario: Number.parseFloat(item.valorUnitario),
        subtotal: Number.parseFloat(item.subtotal),
        iva: Number.parseFloat(item.iva),
        total: Number.parseFloat(item.total),
      })),
      subtotal: Number.parseFloat(totales.subtotal),
      iva: Number.parseFloat(totales.iva),
      total: Number.parseFloat(totales.total),
      cliente: selectedPrefactura?.cliente,
    }

    onSubmit(datosParaEnviar)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Selección de pre-factura */}
      <div className="w-full mb-4">
        <Label htmlFor="prefacturaId" className="text-base mb-2 block">
          Seleccione la pre-factura que desea convertir en factura:
        </Label>
        <Select
          value={formData.prefacturaId}
          onValueChange={(value) => handleSelectChange("prefacturaId", value)}
          required
          disabled={loadingPrefacturas || isSubmitting}
        >
          <SelectTrigger id="prefacturaId" className="w-full">
            <SelectValue placeholder={loadingPrefacturas ? "Cargando prefacturas..." : "Seleccionar pre-factura"} />
          </SelectTrigger>
          <SelectContent>
            {loadingPrefacturas ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Cargando prefacturas...</span>
              </div>
            ) : prefacturas.length > 0 ? (
              prefacturas.map((prefactura) => (
                <SelectItem key={prefactura.id} value={prefactura.id!}>
                  {prefactura.cliente?.razon_social} - {prefactura.descripcion.substring(0, 30)}
                  {prefactura.descripcion.length > 30 ? "..." : ""}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500">No hay prefacturas disponibles</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedPrefactura && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna izquierda - Resumen de pre-factura */}
          <div className="md:col-span-4 lg:col-span-3">
            <PrefacturaResumen prefactura={selectedPrefactura} />
          </div>

          {/* Columna derecha - Formulario de factura */}
          <div className="md:col-span-8 lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="datos-factura">Datos de Factura</TabsTrigger>
                <TabsTrigger value="datos-fiscales">Datos Fiscales</TabsTrigger>
              </TabsList>

              <TabsContent value="datos-factura" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.fechaEmision && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.fechaEmision ? (
                            format(formData.fechaEmision, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaEmision}
                          onSelect={(date) => handleDateChange("fechaEmision", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condicionVenta">Condición de Venta *</Label>
                    <Select
                      value={formData.condicionVenta}
                      onValueChange={(value) => handleSelectChange("condicionVenta", value)}
                      required
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="condicionVenta">
                        <SelectValue placeholder="Seleccionar condición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contado">Contado</SelectItem>
                        <SelectItem value="Crédito 15 días">Crédito 15 días</SelectItem>
                        <SelectItem value="Crédito 30 días">Crédito 30 días</SelectItem>
                        <SelectItem value="Crédito 60 días">Crédito 60 días</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => handleSelectChange("estado", value)}
                      required
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emitida">Emitida</SelectItem>
                        <SelectItem value="pagada">Pagada</SelectItem>
                        <SelectItem value="vencida">Vencida</SelectItem>
                        <SelectItem value="anulada">Anulada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      name="observaciones"
                      placeholder="Observaciones adicionales"
                      value={formData.observaciones}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Ítems de factura */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Ítems de Factura</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                      disabled={isSubmitting}
                      className="flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Ítem
                    </Button>
                  </div>

                  {items.map((item, index) => (
                    <Card key={item.id} className="border border-gray-200">
                      <CardHeader className="py-3 px-4 flex flex-row justify-between items-center">
                        <CardTitle className="text-sm font-medium">Ítem {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          disabled={isSubmitting || items.length <= 1}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`descripcion-${item.id}`}>Descripción producto / servicio *</Label>
                            <Textarea
                              id={`descripcion-${item.id}`}
                              value={item.descripcion}
                              onChange={(e) => handleItemChange(item.id, "descripcion", e.target.value)}
                              placeholder="Descripción del producto o servicio"
                              required
                              disabled={isSubmitting}
                              className="resize-none"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                            <div className="space-y-2">
                              <Label htmlFor={`valorUnitario-${item.id}`}>Valor Unitario *</Label>
                              <Input
                                id={`valorUnitario-${item.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.valorUnitario}
                                onChange={(e) => handleItemChange(item.id, "valorUnitario", e.target.value)}
                                required
                                className="font-mono"
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`cantidad-${item.id}`}>Cantidad *</Label>
                              <Input
                                id={`cantidad-${item.id}`}
                                type="number"
                                step="1"
                                min="1"
                                placeholder="1"
                                value={item.cantidad}
                                onChange={(e) => handleItemChange(item.id, "cantidad", e.target.value)}
                                required
                                className="font-mono"
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`subtotal-${item.id}`}>Subtotal</Label>
                              <Input
                                id={`subtotal-${item.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.subtotal}
                                readOnly
                                className="font-mono bg-gray-50"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`iva-${item.id}`}>IVA (21%)</Label>
                              <Input
                                id={`iva-${item.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.iva}
                                readOnly
                                className="font-mono bg-gray-50"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`total-${item.id}`}>Total</Label>
                              <Input
                                id={`total-${item.id}`}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.total}
                                readOnly
                                className="font-mono font-bold bg-gray-50"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Totales generales */}
                  <Card className="border-t-2 border-gray-300">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="subtotalGeneral">Subtotal General</Label>
                          <Input
                            id="subtotalGeneral"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={totales.subtotal}
                            readOnly
                            className="font-mono bg-gray-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ivaGeneral">IVA General</Label>
                          <Input
                            id="ivaGeneral"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={totales.iva}
                            readOnly
                            className="font-mono bg-gray-50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="totalGeneral">Total General</Label>
                          <Input
                            id="totalGeneral"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={totales.total}
                            readOnly
                            className="font-mono font-bold bg-gray-50 text-lg"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="datos-fiscales" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="tipoComprobante">Tipo de Comprobante *</Label>
                    <Select
                      value={formData.tipoComprobante}
                      onValueChange={(value) => handleSelectChange("tipoComprobante", value)}
                      required
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="tipoComprobante">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Factura A</SelectItem>
                        <SelectItem value="B">Factura B</SelectItem>
                        <SelectItem value="C">Factura C</SelectItem>
                        <SelectItem value="M">Factura M</SelectItem>
                        <SelectItem value="E">Factura E (Exportación)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="puntoVenta">Punto de Venta *</Label>
                    <Input
                      id="puntoVenta"
                      name="puntoVenta"
                      placeholder="00001"
                      value={formData.puntoVenta}
                      onChange={handleChange}
                      required
                      className="font-mono"
                      maxLength={5}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroComprobante">Número de Comprobante *</Label>
                    <Input
                      id="numeroComprobante"
                      name="numeroComprobante"
                      placeholder="00000001"
                      value={formData.numeroComprobante}
                      onChange={handleChange}
                      required
                      className="font-mono"
                      maxLength={8}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cae">CAE (Código de Autorización Electrónico) *</Label>
                    <Input
                      id="cae"
                      name="cae"
                      placeholder="71234567890123"
                      value={formData.cae}
                      onChange={handleChange}
                      required
                      className="font-mono"
                      maxLength={14}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaVencimientoCae">Fecha de Vencimiento CAE *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.fechaVencimientoCae && "text-muted-foreground",
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.fechaVencimientoCae ? (
                            format(formData.fechaVencimientoCae, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.fechaVencimientoCae}
                          onSelect={(date) => handleDateChange("fechaVencimientoCae", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              className="mt-6 w-full bg-[#0091d5] hover:bg-[#007ab8]"
              disabled={!selectedPrefactura || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Actualizando Factura..." : "Creando Factura..."}
                </>
              ) : initialData ? (
                "Actualizar Factura"
              ) : (
                "Crear Factura"
              )}
            </Button>
          </div>
        </div>
      )}

      {!selectedPrefactura && (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {loadingPrefacturas
              ? "Cargando prefacturas..."
              : prefacturas.length > 0
                ? "Seleccione una pre-factura para continuar"
                : "No hay prefacturas disponibles. Cree una prefactura primero."}
          </p>
          {loadingPrefacturas && <Loader2 className="h-5 w-5 animate-spin mx-auto mt-2" />}
        </div>
      )}
    </form>
  )
}
