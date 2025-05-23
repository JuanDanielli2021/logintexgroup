"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { ClienteDialog } from "@/components/customers/cliente-dialog"

export function ClientesHeader() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar la búsqueda aquí
    console.log("Buscando:", searchQuery)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clientes</h1>
        <p className="text-muted-foreground">Gestiona tus clientes, despachantes y empresas desde un solo lugar.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar cliente..."
            className="w-full min-w-[200px] pl-8 sm:w-auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <Button onClick={() => setDialogOpen(true)} className="bg-brand-blue-500 hover:bg-brand-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
      <ClienteDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
