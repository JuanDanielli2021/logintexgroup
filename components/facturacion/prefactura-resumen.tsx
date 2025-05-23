"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import type { Prefactura } from "@/lib/hooks/usePrefacturas"

interface PrefacturaResumenProps {
  prefactura: Prefactura
}

export function PrefacturaResumen({ prefactura }: PrefacturaResumenProps) {
  // Formatear la fecha
  const fechaFormateada = prefactura.fecha
    ? typeof prefactura.fecha === "string"
      ? format(new Date(prefactura.fecha), "PPP", { locale: es })
      : format(prefactura.fecha as Date, "PPP", { locale: es })
    : "Fecha no disponible"

  // Formatear el concepto
  const conceptoFormateado =
    prefactura.concepto === "importacion" ? "Importación" : prefactura.concepto === "exportacion" ? "Exportación" : ""

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Resumen de Pre-factura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500">Cliente</h3>
          <p className="font-semibold">{prefactura.cliente?.razon_social}</p>
          <p className="text-sm">{prefactura.cliente?.cuit}</p>
          {prefactura.cliente?.tipo === "despachante" && (
            <>
              <p className="text-sm mt-2 font-medium">Empresa representada:</p>
              <p className="text-sm">{prefactura.cliente?.razon_social_empresa}</p>
              <p className="text-sm">{prefactura.cliente?.domicilio_empresa}</p>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm text-gray-500">Fecha</h3>
            <p>{fechaFormateada}</p>
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">Concepto</h3>
            <Badge variant="outline" className="mt-1">
              {conceptoFormateado}
            </Badge>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-sm text-gray-500">Descripción</h3>
          <p className="text-sm">{prefactura.descripcion}</p>
        </div>

        <div>
          <h3 className="font-medium text-sm text-gray-500">Cantidad</h3>
          <p className="text-xl font-bold font-mono">{prefactura.cantidad}</p>
        </div>
      </CardContent>
    </Card>
  )
}
