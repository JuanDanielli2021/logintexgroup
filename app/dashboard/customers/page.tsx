import type { Metadata } from "next"
import { ClientesHeader } from "@/components/customers/clientes-header"
import { ClientesTable } from "@/components/customers/clientes-table"

export const metadata: Metadata = {
  title: "Clientes",
  description: "Gestión de clientes",
}

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <ClientesHeader />
      <ClientesTable />
    </div>
  )
}
