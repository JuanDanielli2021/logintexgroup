import type { Metadata } from "next"
import { PrefacturasHeader } from "@/components/prefacturas/prefacturas-header"
import { PrefacturasTable } from "@/components/prefacturas/prefacturas-table"

export const metadata: Metadata = {
  title: "Pre-Facturas",
  description: "Gestión de pre-facturas",
}

export default function PrefacturasPage() {
  return (
    <div className="space-y-6">
      <PrefacturasHeader />
      <PrefacturasTable />
    </div>
  )
}
