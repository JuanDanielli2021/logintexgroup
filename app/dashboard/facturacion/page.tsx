import type { Metadata } from "next"
import { FacturacionHeader } from "@/components/facturacion/facturacion-header"
import { FacturacionTable } from "@/components/facturacion/facturacion-table"

export const metadata: Metadata = {
  title: "Facturación",
  description: "Gestión de facturas electrónicas",
}

export default function FacturacionPage() {
  return (
    <div className="space-y-6">
      <FacturacionHeader />
      <FacturacionTable />
    </div>
  )
}
